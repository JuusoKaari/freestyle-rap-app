#!/usr/bin/env python3
import os
import json
import cloudinary
import cloudinary.uploader
from pathlib import Path
from dotenv import load_dotenv
import shutil

# Get the project root directory (2 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Load environment variables from .env file
load_dotenv(Path(__file__).parent / '.env')

def round_to_nearest_5(number):
    """Round a number to the nearest multiple of 5"""
    return round(number / 5) * 5

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
            folder="freestyle_beats",
            overwrite=True
        )
        return result['secure_url']
    except Exception as e:
        print(f"Error uploading {file_path}: {str(e)}")
        return None

def process_beat_directory(beat_dir):
    """Upload all files in a beat directory and update its metadata"""
    beat_path = Path(beat_dir)
    beat_name = beat_path.name
    
    # Read current metadata
    metadata_file = PROJECT_ROOT / "src" / "data" / "beat_metadata" / f"{beat_name}.js"
    if not metadata_file.exists():
        print(f"No metadata file found for {beat_name}")
        return None

    # Read the JS file content and extract the JSON part
    js_content = metadata_file.read_text()
    json_str = js_content.replace("export default ", "").rstrip(";\n")
    metadata = json.loads(json_str)

    # Upload each file and collect URLs
    cloudinary_urls = {}
    upload_success = True
    
    for bpm, local_path in metadata['files'].items():
        # Convert Windows path to Unix style if needed
        local_path = local_path.replace('\\', '/')
        file_path = PROJECT_ROOT / local_path
        if file_path.exists():
            public_id = f"{beat_name}/{bpm}bpm"
            url = upload_to_cloudinary(str(file_path), public_id)
            if url:
                cloudinary_urls[bpm] = url
                print(f"Uploaded {file_path.name} to Cloudinary")
            else:
                upload_success = False
                break
        else:
            print(f"Warning: File not found: {file_path}")
            upload_success = False
            break

    if not cloudinary_urls:
        print(f"No files were successfully uploaded for {beat_name}")
        return None

    if upload_success:
        # Update metadata with Cloudinary URLs and ensure BPM is rounded
        metadata['files'] = cloudinary_urls
        metadata['bpm'] = round_to_nearest_5(metadata['bpm'])  # Round BPM to nearest 5

        # Save updated metadata
        with open(metadata_file, 'w', encoding='utf-8') as f:
            f.write("export default ")
            json.dump(metadata, f, indent=2)
            f.write(";\n")

        # Move the processed beat directory to uploaded_beats
        uploaded_dir = SCRIPT_DIR / "beats" / "__uploaded_beats" / beat_name
        uploaded_dir.parent.mkdir(parents=True, exist_ok=True)
        
        if uploaded_dir.exists():
            shutil.rmtree(uploaded_dir)
        
        shutil.move(str(beat_path), str(uploaded_dir))
        print(f"Moved {beat_name} to __uploaded_beats directory")

        print(f"Updated metadata for {beat_name} with {len(cloudinary_urls)} Cloudinary URLs")
        return metadata
    
    return None

def update_index_file():
    """Update the index.js file with all beat metadata files"""
    metadata_dir = PROJECT_ROOT / "src" / "data" / "beat_metadata"
    
    # Get all JS files except index.js
    beat_files = [f for f in metadata_dir.glob("*.js") if f.name != "index.js"]
    beat_files.sort()  # Sort alphabetically
    
    # Create the index file
    index_file = metadata_dir / "index.js"
    with open(index_file, 'w', encoding='utf-8') as f:
        f.write("// Import individual beat metadata files\n")
        # Write imports
        for beat_file in beat_files:
            beat_name = beat_file.stem
            f.write(f"import {beat_name} from './{beat_name}.js';\n")
        
        f.write("\n// Export the beats array built from the JS files\n")
        f.write("export const beats = [\n")
        # Write array entries
        for beat_file in beat_files:
            beat_name = beat_file.stem
            f.write(f"  {beat_name},\n")
        f.write("];\n")
    
    print(f"Updated index.js with {len(beat_files)} beats")

def main():
    # Get all beat directories in __processed_beats
    processed_dir = SCRIPT_DIR / "beats" / "__processed_beats"
    if not processed_dir.exists():
        print("No processed beats directory found")
        return

    beat_dirs = [d for d in processed_dir.iterdir() if d.is_dir()]
    uploaded_count = 0
    failed_count = 0

    if beat_dirs:
        print(f"Found {len(beat_dirs)} beat(s) to upload")

        # Process each beat directory
        for beat_dir in beat_dirs:
            print(f"\nProcessing directory: {beat_dir}")
            metadata = process_beat_directory(beat_dir)
            if metadata:
                uploaded_count += 1
            else:
                failed_count += 1

        print(f"\nUpload complete:")
        print(f"- Successfully uploaded: {uploaded_count} beat(s)")
        print(f"- Failed: {failed_count} beat(s)")
    else:
        print("No processed beat directories found")

    # Always update the index file, even if no new beats were uploaded
    update_index_file()

if __name__ == "__main__":
    main() 