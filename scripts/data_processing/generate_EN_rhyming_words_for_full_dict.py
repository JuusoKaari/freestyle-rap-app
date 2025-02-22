import os
import sys
import pronouncing
from pathlib import Path

def get_rhyming_words(word):
    """Get all rhyming words for a given word."""
    try:
        print(f"  Finding rhymes for: {word}")
        rhymes = pronouncing.rhymes(word.lower())
        filtered_rhymes = [r for r in rhymes if r and ' ' not in r]
        print(f"    Found {len(filtered_rhymes)} rhymes")
        if filtered_rhymes:
            print(f"    First few rhymes: {', '.join(filtered_rhymes[:3])}")
        return filtered_rhymes
    except Exception as e:
        print(f"    Error finding rhymes for {word}: {str(e)}")
        return []

def process_wordlist(input_file_path):
    """Process a single wordlist file and generate rhyming words."""
    # Read input words
    with open(input_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Split by spaces and newlines to get individual words
        words = [word.strip() for word in content.replace('\n', ' ').split(' ') 
                if word.strip() and len(word.strip()) > 2]  # Only keep words longer than 2 chars
    
    print(f"Found {len(words)} words in file")
    if words:
        print(f"First few words: {', '.join(words[:5])}")
    
    # Get rhyming words for each word
    rhyme_dict = {}
    total_processed = 0
    
    for word in words:
        rhymes = get_rhyming_words(word)
        if rhymes:
            rhyme_dict[word] = rhymes
        
        total_processed += 1
        if total_processed % 10 == 0:  # Progress update every 10 words
            print(f"Processed {total_processed}/{len(words)} words...")
    
    return rhyme_dict

def main():
    # Get script directory and set up paths
    script_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    wordlists_dir = script_dir.parent.parent / "src" / "data" / "vocabulary" / "raw_wordlists"
    output_dir = wordlists_dir / "EN__full_dict_parts"
    
    print("\nUsing paths:")
    print(f"Wordlists directory: {wordlists_dir}")
    print(f"Output directory: {output_dir}\n")
    
    # Create output directory if it doesn't exist
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all English wordlist files
    for file_path in wordlists_dir.glob("EN_*.txt"):
        # Skip files in full_dict_parts folder
        if "full_dict_parts" in str(file_path):
            continue
            
        print(f"\nProcessing {file_path.name}...")
        print(f"Full path: {file_path}")
        
        if not file_path.exists():
            print(f"Warning: File does not exist: {file_path}")
            continue
            
        # Generate rhyming words
        rhyme_dict = process_wordlist(file_path)
        
        if rhyme_dict:
            # Create output filename
            output_filename = file_path.stem + "_rhymes.txt"
            output_path = output_dir / output_filename
            
            # Write rhyming words to output file
            with open(output_path, 'w', encoding='utf-8') as f:
                for word, rhymes in rhyme_dict.items():
                    # Take the first 5 rhymes in their original order
                    top_rhymes = rhymes[:5]
                    
                    if top_rhymes:  # Only write if we have rhymes
                        f.write(f"{word}:\n")
                        for rhyme in top_rhymes:
                            f.write(f"  {rhyme}\n")
                        f.write("\n")
            
            print(f"Created rhyming words file: {output_path.name}")
            print(f"Found rhymes for {len(rhyme_dict)} words")
        else:
            print(f"No rhyming words found in {file_path.name}")
        
        print()

if __name__ == "__main__":
    main() 