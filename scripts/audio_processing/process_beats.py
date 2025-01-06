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

def extract_bpm_from_filename(filename):
    """Extract BPM from filename with pattern '-bpm-XX'"""
    match = re.search(r'-bpm-(\d+)', filename)
    if match:
        return int(match.group(1))
    return None

def get_base_name(filename):
    """Get the base name of the beat (part before -bpm-)"""
    return re.sub(r'-bpm-\d+', '', filename)

def round_to_nearest_5(number):
    """Round a number to the nearest multiple of 5"""
    return round(number / 5) * 5

def create_beat_metadata(beat_name, original_bpm, bpm_files):
    """Create metadata dictionary for a beat"""
    return {
        "id": beat_name.lower().replace(" ", "_"),
        "name": beat_name.replace("_", " ").title(),
        "bpm": round_to_nearest_5(original_bpm),
        "files": bpm_files,
        "description": f"Original {original_bpm} BPM beat with variations"
    }

def process_beat_file(input_file, tempo_script):
    """Process a single beat file to create variations and metadata"""
    file_path = Path(input_file)
    original_bpm = extract_bpm_from_filename(file_path.name)
    if not original_bpm:
        print(f"Warning: Could not extract BPM from {file_path.name}")
        return None

    # Create output directory for processed files
    beat_name = get_base_name(file_path.stem)
    output_dir = SCRIPT_DIR / "beats" / "__processed_beats" / beat_name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate BPM variations from 60 to 140 with step of 5
    bpm_variations = list(range(60, 141, 5))
    
    # Run the tempo modifier script
    cmd = [
        "python", str(tempo_script),
        str(file_path),
        str(original_bpm),
        "--output-dir", str(output_dir),
        "--bpm-list"
    ] + [str(bpm) for bpm in bpm_variations]

    print(f"Running command: {' '.join(cmd)}")
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        print(f"Error processing {file_path.name}: {e.stderr}")
        return None

    # Create placeholder metadata with local file paths
    local_files = {}
    for bpm in bpm_variations:
        filename = f"{beat_name}_{bpm}bpm{file_path.suffix}"
        output_path = output_dir / filename
        if output_path.exists():
            local_files[bpm] = str(output_path.relative_to(PROJECT_ROOT))
            print(f"Created {filename}")

    if not local_files:
        print("No files were successfully created")
        return None

    # Create metadata
    metadata = create_beat_metadata(beat_name, original_bpm, local_files)
    
    # Save metadata as JS file
    metadata_dir = PROJECT_ROOT / "src" / "data" / "beat_metadata"
    metadata_dir.mkdir(parents=True, exist_ok=True)
    metadata_file = metadata_dir / f"{beat_name}.js"
    
    with open(metadata_file, 'w', encoding='utf-8') as f:
        f.write("export default ")
        json.dump(metadata, f, indent=2)
        f.write(";\n")

    print(f"Processed {beat_name}: Created {len(local_files)} variations")
    return metadata

def main():
    # Get all audio files from raw_beat_files
    raw_files_dir = SCRIPT_DIR / "beats" / "__raw_beat_files"
    print(f"Looking for audio files in: {raw_files_dir}")
    
    audio_files = []
    for ext in ['.wav', '.mp3']:
        audio_files.extend(raw_files_dir.glob(f"*{ext}"))

    if not audio_files:
        print("No audio files found in __raw_beat_files directory")
        return

    # Path to the tempo modifier script
    tempo_script = SCRIPT_DIR / "tempo_modifier.py"

    # Process each file
    all_metadata = []
    for audio_file in audio_files:
        print(f"Processing file: {audio_file}")
        metadata = process_beat_file(audio_file, tempo_script)
        if metadata:
            all_metadata.append(metadata)

    # Create an index file with all beat metadata
    if all_metadata:
        index_file = PROJECT_ROOT / "src" / "data" / "beat_metadata" / "index.js"
        with open(index_file, 'w', encoding='utf-8') as f:
            f.write("// Import individual beat metadata files\n")
            # Write imports
            for metadata in all_metadata:
                beat_name = metadata['id']
                f.write(f"import {beat_name} from './{beat_name}.js';\n")
            f.write("\n// Export the beats array built from the JS files\n")
            f.write("export const beats = [\n")
            # Write array entries
            for metadata in all_metadata:
                f.write(f"  {metadata['id']},\n")
            f.write("];\n")

if __name__ == "__main__":
    main() 