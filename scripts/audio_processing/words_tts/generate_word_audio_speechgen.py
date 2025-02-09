#!/usr/bin/env python3
import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Get the project root directory (3 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Create necessary directories
TEMP_AUDIO_DIR = SCRIPT_DIR / "__generated_audio"
PROCESSED_DIR = SCRIPT_DIR / "__processed_words"
TEMP_AUDIO_DIR.mkdir(exist_ok=True)
PROCESSED_DIR.mkdir(exist_ok=True)

# Load environment variables from .env file
load_dotenv(Path(__file__).parent.parent / '.env')

# Configure SpeechGen
SPEECHGEN_EMAIL = os.getenv('SPEECHGEN_EMAIL')
SPEECHGEN_TOKEN = os.getenv('SPEECHGEN_TOKEN')
if not SPEECHGEN_EMAIL or not SPEECHGEN_TOKEN:
    raise ValueError("SPEECHGEN_EMAIL or SPEECHGEN_TOKEN not found in environment variables")

def get_voices():
    """Get the list of available voices from SpeechGen API"""
    url = "https://speechgen.io/index.php?r=api/voices"
    response = requests.get(url)
    print(f"Voices API response status code: {response.status_code}")
    
    if response.status_code == 200:
        try:
            voices_data = response.json()
            if isinstance(voices_data, dict):
                voices = []
                for language, voices_list in voices_data.items():
                    voices.extend(voice for voice in voices_list)
                print(f"Found {len(voices)} available voices")
                return voices
            else:
                print("Error: Unexpected JSON structure")
                return []
        except json.JSONDecodeError:
            print("Error decoding JSON response from voices API.")
            return []
    else:
        print("Failed to fetch voices from API.")
        return []

def extract_words_from_vocabulary(vocab_file):
    """Extract unique words from a vocabulary file"""
    with open(vocab_file, 'r', encoding='utf-8') as f:
        content = f.read()
        # Remove 'export default' and trailing semicolon
        json_str = content.replace('export default ', '').rstrip(';\n')
        vocab_data = json.loads(json_str)
        
        # For FI_elaimet.js style files (pattern-based)
        if isinstance(vocab_data, dict) and all(isinstance(k, str) for k in vocab_data.keys()):
            words = set()
            for word_list in vocab_data.values():
                for word in word_list:
                    # Check if word has a phonetic version (separated by semicolon)
                    if ';' in word:
                        # Use the phonetic version (after semicolon)
                        display_word, phonetic = word.split(';')
                        # Remove hyphens and underscores from phonetic version
                        clean_word = phonetic.replace('-', '').replace('_', '')
                    else:
                        # Remove hyphens and underscores if present
                        clean_word = word.replace('-', '').replace('_', '')
                    words.add(clean_word)
            return list(words)
        
        # For other vocabulary file formats
        # Add handling for other formats as needed
        return []

def get_voice_for_language(language, available_voices):
    """Get the appropriate voice based on language"""
    # Always use Harri for Finnish
    if language == 'fi':
        return 'Harri'
    
    # Fallback to Hunter for other languages
    return 'Hunter'

def generate_audio_for_word(word, voice, output_dir):
    """Generate audio file for a single word using SpeechGen API"""
    try:
        # Check if audio file already exists
        output_path = output_dir / f"{word}.mp3"
        if output_path.exists():
            print(f"Audio file already exists for word: {word}, skipping...")
            return True

        url = "https://speechgen.io/index.php?r=api/text"
        
        data = {
            'token': SPEECHGEN_TOKEN,
            'email': SPEECHGEN_EMAIL,
            'voice': voice,
            'text': word,
            'speed': 1.0,  # Normal speed
            'pitch': 1.0,  # Normal pitch
            'format': 'mp3'  # Output format
        }
        
        print(f"Generating audio for word: {word}")
        response = requests.post(url, data=data)
        response_data = response.json()
        
        if response_data['status'] == 1 and 'file' in response_data:
            file_url = response_data['file']
            
            # Download the audio file
            audio_response = requests.get(file_url)
            with open(output_path, 'wb') as f:
                f.write(audio_response.content)
            
            print(f"Successfully generated audio for: {word}")
            return True
        else:
            print(f"Error generating audio for '{word}': {response_data.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"Error generating audio for word '{word}': {str(e)}")
        return False

def process_vocabulary_file(vocab_file):
    """Process a single vocabulary file"""
    vocab_path = Path(vocab_file)
    
    # Determine language from filename (e.g., FI_elaimet.js -> fi)
    language = vocab_path.stem.split('_')[0].lower()
    
    # Check if we have a results file for this vocabulary
    results_file = PROCESSED_DIR / f'{vocab_path.stem}_results.json'
    previously_processed = set()
    if results_file.exists():
        try:
            with open(results_file, 'r', encoding='utf-8') as f:
                previous_results = json.load(f)
                previously_processed = set(previous_results.get('processed', []))
                print(f"Found {len(previously_processed)} previously processed words")
        except Exception as e:
            print(f"Error reading previous results: {e}")
    
    # Get available voices
    available_voices = get_voices()
    if not available_voices:
        print("No voices available, cannot proceed")
        return {
            'processed': list(previously_processed),
            'failed': [],
            'language': language
        }
    
    # Get appropriate voice for the language
    voice = get_voice_for_language(language, available_voices)
    print(f"Using voice: {voice}")
    
    # Extract words from vocabulary file
    words = extract_words_from_vocabulary(vocab_path)
    print(f"Found {len(words)} words to process")
    
    # Filter out already processed words
    words_to_process = [word for word in words if word not in previously_processed]
    print(f"After filtering previously processed words: {len(words_to_process)} words to process")
    
    # Create language-specific directory
    lang_dir = TEMP_AUDIO_DIR / language
    lang_dir.mkdir(exist_ok=True)
    
    # Process each word
    processed_words = list(previously_processed)  # Start with previously processed words
    failed_words = []
    
    for i, word in enumerate(words_to_process, 1):
        try:
            print(f"\nProcessing word {i}/{len(words_to_process)}: {word}")
            # Add a small delay between API calls to avoid rate limits
            time.sleep(1)
            
            if generate_audio_for_word(word, voice, lang_dir):
                processed_words.append(word)
            else:
                failed_words.append(word)
        except Exception as e:
            print(f"Failed to process word '{word}': {str(e)}")
            failed_words.append(word)
            time.sleep(2)  # Longer delay after failure
    
    return {
        'processed': processed_words,
        'failed': failed_words,
        'language': language
    }

def get_available_vocabularies():
    """Get list of available vocabulary files"""
    vocab_dir = PROJECT_ROOT / "src" / "data" / "vocabulary"
    vocab_files = list(vocab_dir.glob("*.js"))
    return [f for f in vocab_files 
            if not f.name.startswith('vocabularyConfig') 
            and not 'full_dict' in f.name]

def main():
    vocab_files = get_available_vocabularies()
    
    if not vocab_files:
        print('No vocabulary files found')
        return
    
    # Print available vocabularies
    print("\nAvailable vocabularies:")
    print("0. ALL (Process all vocabularies)")
    for i, vocab_file in enumerate(vocab_files, 1):
        print(f"{i}. {vocab_file.stem}")
    
    # Get user selection
    while True:
        try:
            selection = input("\nSelect vocabulary to process (0-{0}): ".format(len(vocab_files)))
            selection_idx = int(selection)
            if 0 <= selection_idx <= len(vocab_files):
                break
            print(f"Please enter a number between 0 and {len(vocab_files)}")
        except ValueError:
            print("Please enter a valid number")
    
    # Process selected vocabularies
    files_to_process = vocab_files if selection_idx == 0 else [vocab_files[selection_idx - 1]]
    
    for vocab_file in files_to_process:
        print(f'\nProcessing {vocab_file.stem}...')
        
        if not vocab_file.exists():
            print(f'{vocab_file.name} not found')
            continue
        
        # Process the vocabulary file
        result = process_vocabulary_file(vocab_file)
        
        # Save processing results
        results_file = PROCESSED_DIR / f'{vocab_file.stem}_results.json'
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"\nResults for {vocab_file.stem}:")
        print(f"- Successfully processed: {len(result['processed'])} word(s)")
        print(f"- Failed: {len(result['failed'])} word(s)")
        print(f"- Results saved to: {results_file}")

if __name__ == "__main__":
    main()