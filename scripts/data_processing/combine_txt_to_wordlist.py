import os
import sys
import re

def combine_txt_files(input_files, output_dir):
    # Set to store unique words
    unique_words = set()
    
    # Process each input file
    for input_file in input_files:
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Remove punctuation
                content = re.sub(r'[-.,!?:;*”“„…&"/\'\(\)\[\]{}]', '', content)
                # Split by whitespace and add to set
                words = content.split()
                unique_words.update(words)
    
        except Exception as e:
            print(f"Error processing {os.path.basename(input_file)}: {str(e)}")
            continue
    
    # Sort words
    sorted_words = sorted(list(unique_words))
    
    # Create output filename based on first input file
    first_file_name = os.path.basename(input_files[0])
    prefix = first_file_name.split('_', 1)[0] if '_' in first_file_name else ''
    output_file = os.path.join(output_dir, f"{prefix}_combined.txt")
    
    # Save combined words
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(' '.join(sorted_words))
    
    return output_file, len(sorted_words)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide at least one input file.")
        sys.exit(1)
    
    input_files = sys.argv[1:]
    output_dir = os.path.dirname(input_files[0])
    
    try:
        output_file, word_count = combine_txt_files(input_files, output_dir)
        print(f"\nSuccessfully combined {len(input_files)} files into: {os.path.basename(output_file)}")
        print(f"Total unique words: {word_count}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1) 