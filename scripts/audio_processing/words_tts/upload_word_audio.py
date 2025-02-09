#!/usr/bin/env python3
import os
import json
from pathlib import Path
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
import sys

# Get the project root directory (3 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Directory paths
GENERATED_AUDIO_DIR = SCRIPT_DIR / "__generated_audio"
AUDIO_STATUS_DIR = SCRIPT_DIR / "__audio_status"

# Create necessary directories
AUDIO_STATUS_DIR.mkdir(exist_ok=True)

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

def update_status_file(vocab_name, word, url=None, failed=False):
    """Update the vocabulary status file with new upload information"""
    status_file = AUDIO_STATUS_DIR / f"{vocab_name}.json"
    
    # Load existing status
    if status_file.exists():
        with open(status_file, 'r', encoding='utf-8') as f:
            status = json.load(f)
    else:
        # Initialize new status file
        status = {
            "language": vocab_name.split('_')[0].lower(),
            "generated_audio": [],
            "audio_urls": {},
            "failed_uploads": []
        }
    
    if url:
        # Add successful upload
        status["audio_urls"][word] = url
        # Remove from failed uploads if it was there
        if word in status["failed_uploads"]:
            status["failed_uploads"].remove(word)
    elif failed:
        # Add to failed uploads if not already there
        if word not in status["failed_uploads"]:
            status["failed_uploads"].append(word)
    
    # Write updated status
    with open(status_file, 'w', encoding='utf-8') as f:
        json.dump(status, f, indent=2, ensure_ascii=False)

def process_vocabulary(vocab_name):
    """Process audio files for a specific vocabulary"""
    vocab_dir = GENERATED_AUDIO_DIR / vocab_name
    if not vocab_dir.exists():
        print(f"No audio directory found for vocabulary: {vocab_name}")
        return False
    
    # Load status file
    status_file = AUDIO_STATUS_DIR / f"{vocab_name}.json"
    if not status_file.exists():
        print(f"No status file found for vocabulary: {vocab_name}")
        return False
    
    with open(status_file, 'r', encoding='utf-8') as f:
        status = json.load(f)
    
    # Get list of words to upload (generated but not uploaded)
    to_upload = [
        word for word in status["generated_audio"] 
        if word not in status["audio_urls"] and word not in status["failed_uploads"]
    ]
    
    if not to_upload:
        print(f"No new words to upload for {vocab_name}")
        return True
    
    print(f"Found {len(to_upload)} words to upload for {vocab_name}")
    
    # Process each word
    success = True
    for word in to_upload:
        audio_file = vocab_dir / f"{word}.mp3"
        if not audio_file.exists():
            print(f"Warning: Audio file not found for word: {word}")
            update_status_file(vocab_name, word, failed=True)
            success = False
            continue
        
        # Upload to Cloudinary
        public_id = f"{status['language']}/{word}"
        url = upload_to_cloudinary(str(audio_file), public_id)
        
        if url:
            print(f"Uploaded {word}")
            update_status_file(vocab_name, word, url=url)
        else:
            print(f"Failed to upload {word}")
            update_status_file(vocab_name, word, failed=True)
            success = False
    
    return success

def main():
    # Find all status files
    status_files = list(AUDIO_STATUS_DIR.glob("*.json"))
    if not status_files:
        print("No status files found")
        return
    
    # Check if vocabulary name was provided as command line argument
    if len(sys.argv) > 1:
        vocab_arg = sys.argv[1]
        
        if vocab_arg.lower() == 'all':
            # Process all vocabularies
            vocabs_to_process = [f.stem for f in status_files]
        else:
            # Find matching status file
            matching_file = next(
                (f for f in status_files if f.stem.lower() == vocab_arg.lower()),
                None
            )
            if matching_file:
                vocabs_to_process = [matching_file.stem]
            else:
                print(f"Error: Vocabulary '{vocab_arg}' not found")
                print("\nAvailable vocabularies:")
                for status_file in status_files:
                    print(f"- {status_file.stem}")
                return
    else:
        # No argument provided, show interactive menu
        print("\nAvailable vocabularies:")
        print("0. ALL (Process all vocabularies)")
        for i, status_file in enumerate(status_files, 1):
            print(f"{i}. {status_file.stem}")
        
        # Get user selection
        while True:
            try:
                selection = input("\nSelect vocabulary to process (0-{0}): ".format(len(status_files)))
                selection_idx = int(selection)
                if 0 <= selection_idx <= len(status_files):
                    break
                print(f"Please enter a number between 0 and {len(status_files)}")
            except ValueError:
                print("Please enter a valid number")
        
        # Process selected vocabularies
        vocabs_to_process = [f.stem for f in status_files] if selection_idx == 0 else [status_files[selection_idx - 1].stem]
    
    for vocab_name in vocabs_to_process:
        print(f"\nProcessing vocabulary: {vocab_name}")
        if process_vocabulary(vocab_name):
            print(f"Successfully processed {vocab_name}")
        else:
            print(f"Some files failed to process for {vocab_name}")

if __name__ == "__main__":
    main() 