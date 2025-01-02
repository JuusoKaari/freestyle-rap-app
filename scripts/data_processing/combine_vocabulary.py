import json
import os
import sys

def combine_vocabulary_files(input_files, output_dir):
    # Dictionary to store all patterns and their words
    combined_patterns = {}
    
    # Process each input file
    for input_file in input_files:
        try:
            with open(input_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Remove the export default and parse the JSON part
                json_str = content.replace('export default ', '').strip().rstrip(';')
                data = json.loads(json_str)
                
                # Merge patterns
                for pattern, words in data.items():
                    if pattern not in combined_patterns:
                        combined_patterns[pattern] = []
                    # Add new words that aren't already in the list
                    combined_patterns[pattern].extend(word for word in words if word not in combined_patterns[pattern])
    
        except Exception as e:
            print(f"Error processing {os.path.basename(input_file)}: {str(e)}")
            continue
    
    # Sort patterns and words
    sorted_patterns = {}
    total_words = 0
    for pattern in sorted(combined_patterns.keys()):
        sorted_words = sorted(list(set(combined_patterns[pattern])))
        sorted_patterns[pattern] = sorted_words
        total_words += len(sorted_words)
    
    # Create output filename
    output_file = os.path.join(output_dir, "FI_combined_vocabulary.js")
    
    # Save combined data
    with open(output_file, 'w', encoding='utf-8') as f:
        json_content = json.dumps(sorted_patterns, ensure_ascii=False, indent=4)
        f.write(f"export default {json_content};")
    
    return output_file, len(sorted_patterns), total_words

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide at least one input file.")
        sys.exit(1)
    
    input_files = sys.argv[1:]
    output_dir = os.path.dirname(input_files[0])
    
    try:
        output_file, pattern_count, word_count = combine_vocabulary_files(input_files, output_dir)
        print(f"\nSuccessfully combined {len(input_files)} files into: {os.path.basename(output_file)}")
        print(f"Total unique patterns: {pattern_count}")
        print(f"Total unique words: {word_count}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1) 