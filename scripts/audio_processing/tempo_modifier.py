#!/usr/bin/env python3
import os
import argparse
import subprocess
import re

def clean_filename(filename):
    """Remove the -bpm-XX part from filename"""
    return re.sub(r'-bpm-\d+', '', filename)

def modify_tempo(input_file, output_dir, target_bpm, original_bpm):
    """
    Modify the tempo of an audio file to match the target BPM.
    
    Args:
        input_file (str): Path to input audio file
        output_dir (str): Directory to save the modified file
        target_bpm (float): Target BPM
        original_bpm (float): Original BPM of the input file
    """
    # Calculate the speed change factor (inverted because slower tempo means stretching the audio)
    speed_factor = target_bpm / original_bpm
    
    # Create output filename with BPM info
    filename = os.path.basename(input_file)
    name, ext = os.path.splitext(filename)
    clean_name = clean_filename(name)
    output_file = os.path.join(output_dir, f"{clean_name}_{int(target_bpm)}bpm{ext}")
    
    # Construct ffmpeg command
    # atempo can only handle 0.5 to 2.0, so we chain filters for larger changes
    tempo = speed_factor
    atempo_filters = []
    
    while tempo < 0.5:
        atempo_filters.append("atempo=0.5")
        tempo = tempo / 0.5
    while tempo > 2.0:
        atempo_filters.append("atempo=2.0")
        tempo = tempo / 2.0
    if 0.5 <= tempo <= 2.0:
        atempo_filters.append(f"atempo={tempo}")
    
    filter_string = ','.join(atempo_filters)
    
    # Run ffmpeg command
    cmd = [
        'ffmpeg', '-i', input_file,
        '-filter:a', filter_string,
        '-y',  # Overwrite output file if it exists
        output_file
    ]
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"Created: {output_file}")
    except subprocess.CalledProcessError as e:
        print(f"Error processing {input_file}: {e.stderr}")

def create_bpm_variations(input_file, output_dir, original_bpm, bpm_variations):
    """
    Create multiple BPM variations of an input audio file.
    
    Args:
        input_file (str): Path to input audio file
        output_dir (str): Directory to save modified files
        original_bpm (float): Original BPM of the input file
        bpm_variations (list): List of target BPMs
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Process each BPM variation
    for target_bpm in bpm_variations:
        modify_tempo(input_file, output_dir, target_bpm, original_bpm)

def main():
    parser = argparse.ArgumentParser(description='Create BPM variations of an audio file')
    parser.add_argument('input_file', help='Input audio file path')
    parser.add_argument('original_bpm', type=float, help='Original BPM of the input file')
    parser.add_argument('--output-dir', default='output', help='Output directory for modified files')
    parser.add_argument('--bpm-list', type=float, nargs='+', 
                        help='List of target BPMs (e.g., 90 95 100 105)')
    
    args = parser.parse_args()
    
    if not args.bpm_list:
        # Default BPM variations if none provided
        bpm_variations = [args.original_bpm * factor for factor in [0.8, 0.9, 1.1, 1.2]]
    else:
        bpm_variations = args.bpm_list
    
    create_bpm_variations(args.input_file, args.output_dir, args.original_bpm, bpm_variations)

if __name__ == "__main__":
    main() 