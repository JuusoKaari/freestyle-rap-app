#!/usr/bin/env python3
import os
import json
from pathlib import Path
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import shutil

# Get the project root directory (3 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Directory paths
GENERATED_AUDIO_DIR = SCRIPT_DIR / "__generated_audio"
UPLOADED_AUDIO_DIR = SCRIPT_DIR / "__uploaded_audio"
PROCESSED_DIR = SCRIPT_DIR / "__processed_words"

# Create necessary directories
UPLOADED_AUDIO_DIR.mkdir(exist_ok=True)

# Load environment variables from .env file
load_dotenv(Path(__file__).parent.parent / '.env')

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

def upload_to_cloudinary(file_path, public_id):
    """Upload a file to Cloudinary and return its URL"""
    try:
        result = cloudinary.uploader.upload(
            file_path,
            resource_type="video",  # Cloudinary uses "video" type for audio files
            public_id=public_id,
            folder="freestyle_words",
            overwrite=True
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading {file_path}: {str(e)}")
        return None

def update_metadata_file(metadata, vocab_name):
    """Update the word audio metadata file for a specific vocabulary"""
    # Create vocabulary_audio_metadata directory if it doesn't exist
    audio_metadata_dir = PROJECT_ROOT / "src" / "data" / "vocabulary_audio_metadata"
    audio_metadata_dir.mkdir(exist_ok=True)
    
    # Create metadata file path for this vocabulary
    metadata_file = audio_metadata_dir / f"{vocab_name}_audio_metadata.js"
    
    # Load existing metadata if it exists
    existing_metadata = {}
    if metadata_file.exists():
        try:
            with open(metadata_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract just the JSON object part
                start = content.find('{')
                end = content.rfind('}')
                if start != -1 and end != -1:
                    json_str = content[start:end+1]
                    existing_metadata = json.loads(json_str)
                else:
                    print("Warning: Could not find JSON object in metadata file")
        except Exception as e:
            print(f"Warning: Could not load existing metadata file: {e}")
    
    # Merge new metadata with existing metadata
    for lang, urls in metadata.items():
        if lang in existing_metadata:
            # Update existing language dictionary with new URLs
            existing_metadata[lang].update(urls)
        else:
            # Add new language dictionary
            existing_metadata[lang] = urls
    
    # Write the updated metadata file
    with open(metadata_file, 'w', encoding='utf-8') as f:
        f.write("// This file is auto-generated. Do not edit manually.\n")
        f.write("export default ")
        json.dump(existing_metadata, f, indent=2, ensure_ascii=False)
        f.write(";\n")
    
    print(f"Updated metadata file: {metadata_file}")

def process_language_directory(lang_dir):
    """Process all audio files in a language directory"""
    language = lang_dir.name
    audio_files = list(lang_dir.glob("*.mp3"))
    
    if not audio_files:
        print(f"No audio files found in {lang_dir}")
        return None
    
    # Upload files and collect URLs
    cloudinary_urls = {}
    upload_success = True
    
    for audio_file in audio_files:
        word = audio_file.stem
        public_id = f"{language}/{word}"
        url = upload_to_cloudinary(str(audio_file), public_id)
        
        if url:
            cloudinary_urls[word] = url
            print(f"Uploaded {audio_file.name} to Cloudinary")
        else:
            upload_success = False
            print(f"Failed to upload {audio_file.name}")
    
    if upload_success and cloudinary_urls:
        # Move processed files to uploaded directory
        uploaded_lang_dir = UPLOADED_AUDIO_DIR / language
        uploaded_lang_dir.mkdir(parents=True, exist_ok=True)
        
        for audio_file in audio_files:
            target_path = uploaded_lang_dir / audio_file.name
            shutil.move(str(audio_file), str(target_path))
        
        return cloudinary_urls
    
    return None

def main():
    if not GENERATED_AUDIO_DIR.exists():
        print(f"Generated audio directory not found: {GENERATED_AUDIO_DIR}")
        return
    
    # Process each language directory
    lang_dirs = [d for d in GENERATED_AUDIO_DIR.iterdir() if d.is_dir()]
    
    if not lang_dirs:
        print("No language directories found")
        return
    
    print(f"Found {len(lang_dirs)} language directory/ies")
    
    # Find all results files
    results_files = list(PROCESSED_DIR.glob("*_results.json"))
    if not results_files:
        print("No results files found in processed directory")
        return
    
    # Print available results files
    print("\nAvailable vocabulary results:")
    print("0. ALL (Process all vocabularies)")
    for i, results_file in enumerate(results_files, 1):
        print(f"{i}. {results_file.stem}")
    
    # Get user selection
    while True:
        try:
            selection = input("\nSelect vocabulary results to process (0-{0}): ".format(len(results_files)))
            selection_idx = int(selection)
            if 0 <= selection_idx <= len(results_files):
                break
            print(f"Please enter a number between 0 and {len(results_files)}")
        except ValueError:
            print("Please enter a valid number")
    
    # Get selected results files
    results_to_process = results_files if selection_idx == 0 else [results_files[selection_idx - 1]]
    
    for selected_results_file in results_to_process:
        vocab_name = selected_results_file.stem.replace('_results', '')
        print(f"\nProcessing vocabulary: {vocab_name}")
        
        # Process each language directory
        for lang_dir in lang_dirs:
            print(f"\nProcessing language directory: {lang_dir.name}")
            urls = process_language_directory(lang_dir)
            
            if urls:
                # Create metadata structure
                metadata = {
                    lang_dir.name: urls
                }
                
                # Update metadata file for this vocabulary
                update_metadata_file(metadata, vocab_name)
                print(f"Successfully processed {len(urls)} audio file(s) for {lang_dir.name}")
            else:
                print(f"No audio files were successfully processed for {lang_dir.name}")

if __name__ == "__main__":
    main() 