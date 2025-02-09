#!/usr/bin/env python3
import requests
import json
import time
import os
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import sys

# Get the project root directory (3 levels up from this script)
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.absolute()
SCRIPT_DIR = Path(__file__).parent.absolute()

# Create necessary directories
GENERATED_AUDIO_DIR = SCRIPT_DIR / "__generated_audio"
AUDIO_STATUS_DIR = SCRIPT_DIR / "__audio_status"
GENERATED_AUDIO_DIR.mkdir(exist_ok=True)
AUDIO_STATUS_DIR.mkdir(exist_ok=True)

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
                        clean_word = phonetic.replace('-', '').replace('_', '').replace(' ', '')
                    else:
                        # Remove hyphens and underscores if present
                        clean_word = word.replace('-', '').replace('_', '').replace(' ', '')
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

def update_status_file(vocab_name, word, success=True):
    """Update the vocabulary status file with newly generated audio"""
    status_file = AUDIO_STATUS_DIR / f"{vocab_name}.json"
    
    # Load existing status or create new
    if status_file.exists():
        with open(status_file, 'r', encoding='utf-8') as f:
            status = json.load(f)
    else:
        status = {
            "language": vocab_name.split('_')[0].lower(),
            "generated_audio": [],
            "audio_urls": {},
            "failed_uploads": []
        }
    
    # Add word to generated_audio if successful
    if success and word not in status["generated_audio"]:
        status["generated_audio"].append(word)
    
    # Write updated status
    with open(status_file, 'w', encoding='utf-8') as f:
        json.dump(status, f, indent=2, ensure_ascii=False)

def generate_audio_for_word(word, voice, vocab_dir):
    """Generate audio file for a single word using SpeechGen API"""
    try:
        # Check if audio file already exists
        output_path = vocab_dir / f"{word}.mp3"
        if output_path.exists():
            print(f"Audio file already exists for word: {word}, skipping...")
            return True

        url = "https://speechgen.io/index.php?r=api/text"
        
        # Add SSML break after the word to prevent cutoff
        ssml_text = f"{word} <break time=\"100ms\"/>"
        
        data = {
            'token': SPEECHGEN_TOKEN,
            'email': SPEECHGEN_EMAIL,
            'voice': voice,
            'text': ssml_text,
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
    vocab_name = vocab_path.stem
    
    # Create vocabulary-specific directory for audio files
    vocab_dir = GENERATED_AUDIO_DIR / vocab_name
    vocab_dir.mkdir(exist_ok=True)
    
    # Determine language from filename (e.g., FI_elaimet.js -> fi)
    language = vocab_name.split('_')[0].lower()
    
    # Get available voices
    available_voices = get_voices()
    if not available_voices:
        print("No voices available, cannot proceed")
        return False
    
    # Get appropriate voice for the language
    voice = get_voice_for_language(language, available_voices)
    print(f"Using voice: {voice}")
    
    # Extract words from vocabulary file
    words = extract_words_from_vocabulary(vocab_path)
    print(f"Found {len(words)} words to process")
    
    # Load status file to check already generated words
    status_file = AUDIO_STATUS_DIR / f"{vocab_name}.json"
    if status_file.exists():
        with open(status_file, 'r', encoding='utf-8') as f:
            status = json.load(f)
            already_generated = set(status.get('generated_audio', []))
    else:
        already_generated = set()
    
    # Filter out already generated words
    words_to_process = [word for word in words if word not in already_generated]
    print(f"After filtering already generated words: {len(words_to_process)} words to process")
    
    # Process each word
    success_count = 0
    for i, word in enumerate(words_to_process, 1):
        try:
            print(f"\nProcessing word {i}/{len(words_to_process)}: {word}")
            # Add a small delay between API calls to avoid rate limits
            time.sleep(1)
            
            if generate_audio_for_word(word, voice, vocab_dir):
                update_status_file(vocab_name, word, success=True)
                success_count += 1
            else:
                print(f"Failed to generate audio for word: {word}")
        except Exception as e:
            print(f"Failed to process word '{word}': {str(e)}")
            time.sleep(2)  # Longer delay after failure
    
    print(f"\nResults for {vocab_name}:")
    print(f"- Successfully generated: {success_count} word(s)")
    print(f"- Failed: {len(words_to_process) - success_count} word(s)")
    
    return success_count > 0

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
    
    # Check if vocabulary name was provided as command line argument
    if len(sys.argv) > 1:
        vocab_arg = sys.argv[1]
        
        if vocab_arg.lower() == 'all':
            # Process all vocabularies
            files_to_process = vocab_files
        else:
            # Find matching vocabulary file
            matching_file = next(
                (f for f in vocab_files if f.stem.lower() == vocab_arg.lower()),
                None
            )
            if matching_file:
                files_to_process = [matching_file]
            else:
                print(f"Error: Vocabulary '{vocab_arg}' not found")
                print("\nAvailable vocabularies:")
                for vocab_file in vocab_files:
                    print(f"- {vocab_file.stem}")
                return
    else:
        # No argument provided, show interactive menu
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
    
    success_count = 0
    for vocab_file in files_to_process:
        print(f'\nProcessing {vocab_file.stem}...')
        
        if not vocab_file.exists():
            print(f'{vocab_file.name} not found')
            continue
        
        # Process the vocabulary file
        if process_vocabulary_file(vocab_file):
            success_count += 1
    
    print(f"\nSuccessfully processed {success_count}/{len(files_to_process)} vocabularies")

if __name__ == "__main__":
    main()