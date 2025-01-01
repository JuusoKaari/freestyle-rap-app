import json
import os
import sys
import pronouncing
import importlib.util
from wordfreq import word_frequency

# Import from the local script file
script_dir = os.path.dirname(os.path.abspath(__file__))
generator_path = os.path.join(script_dir, "rhyme_generator-EN.py")
spec = importlib.util.spec_from_file_location("rhyme_generator", generator_path)
rhyme_generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rhyme_generator)

# Get the required functions and constants
simplify_cmu_pattern = rhyme_generator.simplify_cmu_pattern
get_syllable_count = rhyme_generator.get_syllable_count
MIN_SYLLABLES = rhyme_generator.MIN_SYLLABLES
MAX_SYLLABLES = rhyme_generator.MAX_SYLLABLES

# Common word endings that often indicate a name when preceded by certain patterns
NAME_ENDINGS = {'er', 'ar', 'el', 'le', 'al', 'en', 'on', 'an'}

# Minimum word frequency to be considered common (adjust this threshold as needed)
MIN_WORD_FREQUENCY = 1e-6  # This is a good starting point, can be adjusted

def is_common_word(word):
    """Check if word is likely to be a common word rather than a name or rare term."""
    word = word.lower()
    
    # Skip words that contain numbers or special characters
    if not word.isalpha():
        return False
    
    # Get pronunciation - if word isn't in CMU dict, it's probably rare
    pronunciations = pronouncing.phones_for_word(word)
    if not pronunciations:
        return False
    
    # Check word frequency in English
    frequency = word_frequency(word, 'en')
    if frequency < MIN_WORD_FREQUENCY:
        return False
        
    # If it's a single syllable word ending in common name endings, check frequency more strictly
    if get_syllable_count(word) == 1 and any(word.endswith(ending) for ending in NAME_ENDINGS):
        return frequency > MIN_WORD_FREQUENCY * 10  # Be more strict with these
    
    # Check for repeated consonant patterns often found in names
    for i in range(len(word)-1):
        if word[i] == word[i+1] and word[i].isalpha() and word[i] not in 'aeiou':
            return frequency > MIN_WORD_FREQUENCY * 10  # Be more strict with these
    
    return True

def load_js_file(file_path):
    """Load the JavaScript file and parse its contents."""
    with open(file_path, "r", encoding="utf-8") as js_file:
        content = js_file.read()
        json_str = content.replace('export default ', '').strip().rstrip(';')
        return json.loads(json_str)

def save_js_file(file_path, data):
    """Save the data back to JavaScript file format."""
    with open(file_path, "w", encoding="utf-8") as js_file:
        js_content = json.dumps(data, ensure_ascii=False, indent=4)
        js_file.write(f"export default {js_content};")

def get_word_pattern(word):
    """Get the vowel pattern for a word."""
    pronunciations = pronouncing.phones_for_word(word)
    if pronunciations:
        return simplify_cmu_pattern(pronunciations[0])
    return None

def create_backup(file_path):
    """Create a backup of the original file with .bak extension."""
    backup_path = f"{file_path}.bak"
    with open(file_path, "r", encoding="utf-8") as source:
        with open(backup_path, "w", encoding="utf-8") as backup:
            backup.write(source.read())
    print(f"Created backup: {backup_path}")

def filter_word_list(words):
    """Filter a list of words to remove duplicates, names, and rare words."""
    # Convert to set to remove duplicates
    unique_words = set(words)
    
    # Filter out names and rare words
    filtered_words = {word.lower() for word in unique_words if is_common_word(word)}
    
    return sorted(list(filtered_words))

def rebuild_patterns(words):
    """Rebuild pattern groups from a list of words."""
    pattern_groups = {}
    
    for word in words:
        pattern = get_word_pattern(word)
        if pattern:
            if pattern not in pattern_groups:
                pattern_groups[pattern] = []
            pattern_groups[pattern].append(word)
    
    return pattern_groups

def populate_rhyme_groups(input_file):
    # Create backup first
    create_backup(input_file)
    
    # Load existing data
    rhyme_groups = load_js_file(input_file)
    
    # Get all existing words
    all_words = []
    for words in rhyme_groups.values():
        all_words.extend(words)
    
    # Rebuild patterns from scratch
    print("Rebuilding pattern groups...")
    rhyme_groups = rebuild_patterns(all_words)
    print(f"Created {len(rhyme_groups)} pattern groups")
    
    new_words_count = 0
    
    # Process each group
    for pattern, words in list(rhyme_groups.items()):
        print(f"\nProcessing pattern {pattern}...")
        new_words = set()
        
        # For each word in the group
        for word in words:
            print(f"  Finding rhymes for '{word}'...")
            # Get all rhyming words
            rhyming_words = pronouncing.rhymes(word)
            print(f"  Found {len(rhyming_words)} potential rhymes")
            
            # Filter rhyming words
            for rhyme in rhyming_words:
                # Skip if word is too short or too long
                if len(rhyme) < 4 or len(rhyme) > 15:
                    continue
                    
                # Skip if not a common word (but only for new words, not existing ones)
                if rhyme not in words and not is_common_word(rhyme):
                    print(f"    Skipping '{rhyme}' - not a common word")
                    continue
                
                # Get syllable count
                syllable_count = get_syllable_count(rhyme)
                if syllable_count < MIN_SYLLABLES or syllable_count > MAX_SYLLABLES:
                    continue
                
                # Verify the pattern matches
                rhyme_pattern = get_word_pattern(rhyme)
                if rhyme_pattern == pattern:
                    if rhyme not in words:  # Only add if it's actually new
                        print(f"    Adding new rhyme: {rhyme}")
                        new_words.add(rhyme)
                else:
                    if rhyme_pattern:
                        print(f"    Skipping '{rhyme}' - pattern mismatch: expected '{pattern}', got '{rhyme_pattern}'")
        
        # Add new words to the group while preserving original words
        original_count = len(rhyme_groups[pattern])
        rhyme_groups[pattern] = sorted(list(set(words + list(new_words))))
        new_count = len(rhyme_groups[pattern])
        words_added = new_count - original_count
        
        if words_added > 0:
            print(f"Added {words_added} new words to pattern {pattern}")
            new_words_count += words_added
        else:
            print("No new words added for this pattern")
    
    # Save the enhanced data
    save_js_file(input_file, rhyme_groups)
    print(f"\nTotal new words added: {new_words_count}")
    return new_words_count

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python populate_rhyme_groups-EN.py <input_js_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    if not os.path.exists(input_file):
        print(f"Error: File {input_file} not found")
        sys.exit(1)
    
    try:
        new_words = populate_rhyme_groups(input_file)
        print("\nRhyme groups successfully populated!")
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        sys.exit(1) 