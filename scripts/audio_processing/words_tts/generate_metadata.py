#!/usr/bin/env python3
import json
from pathlib import Path
import sys

# Get the project root directory (3 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Directory paths
AUDIO_STATUS_DIR = SCRIPT_DIR / "__audio_status"
METADATA_DIR = PROJECT_ROOT / "src" / "data" / "vocabulary_audio_metadata"

def generate_metadata_for_vocabulary(vocab_name):
    """Generate metadata for a specific vocabulary"""
    status_file = AUDIO_STATUS_DIR / f"{vocab_name}.json"
    if not status_file.exists():
        print(f"No status file found for vocabulary: {vocab_name}")
        return False
    
    try:
        # Load status file
        with open(status_file, 'r', encoding='utf-8') as f:
            status = json.load(f)
        
        # Create metadata structure
        metadata = {
            status['language']: status['audio_urls']
        }
        
        # Create metadata directory if it doesn't exist
        METADATA_DIR.mkdir(exist_ok=True)
        
        # Write metadata file
        metadata_file = METADATA_DIR / f"{vocab_name}_audio_metadata.js"
        with open(metadata_file, 'w', encoding='utf-8') as f:
            f.write("// This file is auto-generated. Do not edit manually.\n")
            f.write("export default ")
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            f.write(";\n")
        
        print(f"Generated metadata for {vocab_name} with {len(status['audio_urls'])} audio URLs")
        return True
        
    except Exception as e:
        print(f"Error generating metadata for {vocab_name}: {e}")
        return False

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
        print("0. ALL (Generate metadata for all vocabularies)")
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
    
    success_count = 0
    for vocab_name in vocabs_to_process:
        print(f"\nProcessing vocabulary: {vocab_name}")
        if generate_metadata_for_vocabulary(vocab_name):
            success_count += 1
    
    print(f"\nSuccessfully generated metadata for {success_count}/{len(vocabs_to_process)} vocabularies")

if __name__ == "__main__":
    main() 