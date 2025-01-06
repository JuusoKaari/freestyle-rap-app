#!/usr/bin/env python3
import os
import re
import json
import glob
import subprocess
import shutil
from pathlib import Path

# Get the project root directory (2 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

def round_to_nearest_5(number):
    """Round a number to the nearest multiple of 5"""
    return round(number / 5) * 5

def create_beat_metadata(beat_info, bpm_files):
    """Create metadata dictionary for a beat"""
    return {
        "id": beat_info["id"],
        "name": beat_info["name"],
        "bpm": round_to_nearest_5(beat_info["bpm"]),
        "files": bpm_files,
        "description": beat_info["description"]
    }

def process_beat_file(json_file, tempo_script):
    """Process a single beat file to create variations and metadata"""
    try:
        # Read beat info from JSON
        with open(json_file, 'r') as f:
            beat_info = json.load(f)

        # Get the audio file path
        raw_files_dir = SCRIPT_DIR / "beats" / "__raw_beat_files"
        
        # Try both .mp3 and .wav extensions
        audio_file = None
        for ext in ['.mp3', '.wav']:
            test_file = raw_files_dir / f"{beat_info['file']}{ext}"
            if test_file.exists():
                audio_file = test_file
                break
            # Also try without extension if file has it already
            test_file = raw_files_dir / beat_info['file']
            if test_file.exists() and test_file.suffix.lower() in ['.mp3', '.wav']:
                audio_file = test_file
                break
        
        if not audio_file:
            print(f"Error: Audio file not found for {beat_info['file']} (tried .mp3 and .wav)")
            return None

        # Create output directory for processed files
        output_dir = SCRIPT_DIR / "beats" / "__processed_beats" / beat_info["id"]
        output_dir.mkdir(parents=True, exist_ok=True)

        # Generate BPM variations from 60 to 140 with step of 5
        bpm_variations = list(range(60, 141, 5))
        
        # Run the tempo modifier script
        cmd = [
            "python", str(tempo_script),
            str(audio_file),
            str(beat_info["bpm"]),
            "--output-dir", str(output_dir),
            "--bpm-list"
        ] + [str(bpm) for bpm in bpm_variations]

        print(f"Running command: {' '.join(cmd)}")
        try:
            subprocess.run(cmd, check=True, capture_output=True, text=True)
        except subprocess.CalledProcessError as e:
            print(f"Error processing {audio_file.name}: {e.stderr}")
            return None

        # Create placeholder metadata with local file paths
        local_files = {}
        for bpm in bpm_variations:
            # Output is always MP3 with format: {clean_name}_{target_bpm}bpm.mp3
            # This matches the format in tempo_modifier.py
            filename = f"{clean_filename(audio_file.stem)}_{bpm}bpm.mp3"
            output_path = output_dir / filename
            if output_path.exists():
                local_files[str(bpm)] = str(output_path.relative_to(PROJECT_ROOT))
                print(f"Created {filename}")

        if not local_files:
            print("No files were successfully created")
            return None

        # Create metadata
        metadata = create_beat_metadata(beat_info, local_files)
        
        # Save metadata as JS file
        metadata_dir = PROJECT_ROOT / "src" / "data" / "beat_metadata"
        metadata_dir.mkdir(parents=True, exist_ok=True)
        metadata_file = metadata_dir / f"{beat_info['id']}.js"
        
        with open(metadata_file, 'w', encoding='utf-8') as f:
            f.write("export default ")
            json.dump(metadata, f, indent=2)
            f.write(";\n")

        # Mark the JSON file as processed by adding SKIP_ prefix
        new_json_path = json_file.parent / f"SKIP_{json_file.name}"
        json_file.rename(new_json_path)
        print(f"Marked {json_file.name} as processed")

        print(f"Processed {beat_info['id']}: Created {len(local_files)} variations")
        return metadata

    except Exception as e:
        print(f"Error processing {json_file}: {str(e)}")
        return None

def clean_filename(filename):
    """Remove the -bpm-XX part from filename"""
    return re.sub(r'-bpm-\d+', '', filename)

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
    # Get all JSON files from raw_beat_files that don't start with SKIP_
    raw_files_dir = SCRIPT_DIR / "beats" / "__raw_beat_files"
    print(f"Looking for unprocessed JSON files in: {raw_files_dir}")
    
    json_files = [f for f in raw_files_dir.glob("*.json") if not f.name.startswith("SKIP_")]
    processed_count = 0
    skipped_count = 0

    if json_files:
        print(f"Found {len(json_files)} unprocessed beat(s) to process")

        # Path to the tempo modifier script
        tempo_script = SCRIPT_DIR / "tempo_modifier.py"

        # Process new files
        for json_file in json_files:
            print(f"\nProcessing file: {json_file}")
            metadata = process_beat_file(json_file, tempo_script)
            if metadata:
                processed_count += 1
            else:
                skipped_count += 1

        print(f"\nProcessing complete:")
        print(f"- Successfully processed: {processed_count} beat(s)")
        print(f"- Skipped/Failed: {skipped_count} beat(s)")
    else:
        print("No unprocessed JSON files found in __raw_beat_files directory")

    # Always update the index file, even if no new beats were processed
    update_index_file()

if __name__ == "__main__":
    main() 