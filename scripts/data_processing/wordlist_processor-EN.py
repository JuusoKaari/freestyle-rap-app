import json
import re
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkinter.scrolledtext import ScrolledText
import os
import sys
import pronouncing

# Configuration constants
MIN_SYLLABLES = 1
MAX_SYLLABLES = 4

class RhymeGeneratorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Rhyme Generator")
        self.root.geometry("800x600")

        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        self.file_frame = ttk.LabelFrame(self.main_frame, text="Input File", padding="5")
        self.file_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        self.file_label = ttk.Label(self.file_frame, text="No file selected")
        self.file_label.grid(row=0, column=0, sticky=tk.W, padx=5)

        self.browse_button = ttk.Button(self.file_frame, text="Browse", command=self.browse_file)
        self.browse_button.grid(row=0, column=1, padx=5)

        self.output_frame = ttk.LabelFrame(self.main_frame, text="Output Directory", padding="5")
        self.output_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)

        self.output_label = ttk.Label(self.output_frame, text="No directory selected")
        self.output_label.grid(row=0, column=0, sticky=tk.W, padx=5)

        self.output_button = ttk.Button(self.output_frame, text="Select", command=self.select_output_dir)
        self.output_button.grid(row=0, column=1, padx=5)

        self.process_button = ttk.Button(self.main_frame, text="Process File", command=self.process_file)
        self.process_button.grid(row=2, column=0, columnspan=2, pady=10)

        self.status_text = ScrolledText(self.main_frame, height=20, width=70)
        self.status_text.grid(row=3, column=0, columnspan=2, pady=5)

        self.input_file = None
        self.output_dir = None

    def browse_file(self):
        filename = filedialog.askopenfilename(
            filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        if filename:
            self.input_file = filename
            self.file_label.config(text=os.path.basename(filename))
            self.output_dir = os.path.dirname(filename)
            self.output_label.config(text=self.output_dir)

    def select_output_dir(self):
        directory = filedialog.askdirectory()
        if directory:
            self.output_dir = directory
            self.output_label.config(text=directory)

    def process_file(self):
        if not self.input_file:
            messagebox.showerror("Error", "Please select an input file")
            return
        if not self.output_dir:
            messagebox.showerror("Error", "Please select an output directory")
            return

        try:
            process_and_show_preview(self.input_file, self.output_dir, self.status_text)
            messagebox.showinfo("Success", "File processed successfully!")
        except Exception as e:
            self.status_text.insert(tk.END, f"Error processing file: {str(e)}\n")
            messagebox.showerror("Error", f"Error processing file: {str(e)}")


def get_syllable_count(word):
    pronunciations = pronouncing.phones_for_word(word)
    if pronunciations:
        return pronouncing.syllable_count(pronunciations[0])
    return 0


def simplify_cmu_pattern(pattern):
    """Convert CMU pattern to simple phonetic pattern with dashes, keeping only vowel sounds with stress."""
    # Define vowel phonemes (CMU notation)
    vowel_phones = {
        'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
        'EH', 'ER', 'EY',
        'IH', 'IY',
        'OW', 'OY',
        'UH', 'UW'
    }
    
    # Split into individual phonemes
    phonemes = pattern.split()
    # Keep only vowel phonemes with their stress numbers
    vowels = [p for p in phonemes if any(p.startswith(v) for v in vowel_phones)]
    # Join vowels with dashes
    simple_pattern = "-".join(vowels)
    return simple_pattern


def are_pronunciations_similar(pron1, pron2):
    """Check if two pronunciations are similar enough (ignoring stress and minor variations)."""
    # Split into phonemes
    phones1 = pron1.split()
    phones2 = pron2.split()
    
    # Must have same number of phonemes
    if len(phones1) != len(phones2):
        return False
        
    # Compare each phoneme, ignoring stress numbers
    for p1, p2 in zip(phones1, phones2):
        # Remove stress numbers
        p1_base = p1.rstrip('012')
        p2_base = p2.rstrip('012')
        
        # If the base phonemes are different
        if p1_base != p2_base:
            # Check for common similar-sounding pairs
            similar_pairs = {
                ('AH', 'AX'),  # schwa variations
                ('ER', 'R'),   # r-colored variations
                ('AH', 'IH'),  # similar short vowels
            }
            if (p1_base, p2_base) not in similar_pairs and (p2_base, p1_base) not in similar_pairs:
                return False
    
    return True


def process_word(word):
    pronunciations = pronouncing.phones_for_word(word)
    if not pronunciations:
        return None, None

    # If multiple pronunciations, check if they're similar
    if len(pronunciations) > 1:
        # Check if all pronunciations are similar to the first one
        first_pron = pronunciations[0]
        for other_pron in pronunciations[1:]:
            if not are_pronunciations_similar(first_pron, other_pron):
                return None, None  # Skip only if pronunciations are significantly different
    
    # Use the first pronunciation (they're either all similar or there's only one)
    pronunciation = pronunciations[0]
    syllable_count = pronouncing.syllable_count(pronunciation)
    if syllable_count < MIN_SYLLABLES or syllable_count > MAX_SYLLABLES:
        return None, None
        
    simple_pattern = simplify_cmu_pattern(pronunciation)
    return simple_pattern, syllable_count


def get_sort_key(pattern):
    """Helper function to create a sort key from a vowel pattern.
    Only uses vowel phones for sorting, ignoring consonants."""
    vowel_phones = {
        'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
        'EH', 'ER', 'EY',
        'IH', 'IY',
        'OW', 'OY',
        'UH', 'UW'
    }
    # Split into phones and filter only vowel phones
    phones = pattern.split('-')
    vowels_only = [p for p in phones if any(v in p for v in vowel_phones)]
    # Reverse for end-first sorting
    return "-".join(vowels_only[::-1])


def process_file(input_file, output_dir):
    with open(input_file, "r", encoding="utf-8") as file:
        text = file.read()

    text = re.sub(r'[-.,!?:*"/\'\(\)\[\]{}]', '', text)
    # Split by whitespace and handle underscore-separated words
    words = []
    heteronyms = set()  # Track heteronyms
    for word in text.split():
        word = word.strip()
        # Skip empty words
        if not word:
            continue
        # Split into phonetic and display parts if semicolon is present
        parts = word.split(';', 1)
        phonetic_word = parts[0].strip().lower()
        display_word = parts[1].strip() if len(parts) > 1 else phonetic_word
        
        # Skip if phonetic word is too short or too long
        if len(phonetic_word) < 4 or len(phonetic_word) > 15:
            continue
            
        # Check for multiple pronunciations and if they're significantly different
        pronunciations = pronouncing.phones_for_word(phonetic_word)
        if pronunciations and len(pronunciations) > 1:
            # Check if pronunciations are similar
            first_pron = pronunciations[0]
            has_different_prons = False
            for other_pron in pronunciations[1:]:
                if not are_pronunciations_similar(first_pron, other_pron):
                    has_different_prons = True
                    break
            
            if has_different_prons:
                heteronyms.add(phonetic_word)
                continue

        # If word contains underscore, keep it as is
        if '_' in phonetic_word:
            words.append((phonetic_word, display_word))
        # Otherwise add normally
        else:
            words.append((phonetic_word, display_word))
    
    # Print skipped heteronyms
    if heteronyms:
        print(f"SKIPPED {len(heteronyms)} HETERONYM WORDS")

    input_basename = os.path.splitext(os.path.basename(input_file))[0]
    output_file = os.path.join(output_dir, f"{input_basename}.js")

    # Initialize new data structures
    vowel_patterns = {}
    previews = {}
    new_words_count = 0

    for phonetic_word, display_word in words:
        if not phonetic_word:
            continue

        result = process_word(phonetic_word)
        
        # Skip if no valid pattern found
        if result == (None, None):
            continue

        rhyme_part, syllable_count = result

        # Create word string - only include display version if it's different from phonetic
        word_string = phonetic_word if display_word == phonetic_word else f"{display_word};{phonetic_word}"

        if rhyme_part not in vowel_patterns:
            vowel_patterns[rhyme_part] = []

        # Add word if it's not already in the list
        if word_string not in vowel_patterns[rhyme_part]:
            vowel_patterns[rhyme_part].append(word_string)
            new_words_count += 1

    output_data = {}
    for pattern, words in sorted(vowel_patterns.items(), key=lambda item: get_sort_key(item[0])):
        if words:
            output_data[pattern] = sorted(words)
            # Store first 5 words of each pattern for preview - use display version if present
            previews[pattern] = [word.split(';')[1] if ';' in word else word for word in words[:5]]

    with open(output_file, "w", encoding="utf-8") as js_file:
        js_content = json.dumps(output_data, ensure_ascii=False, indent=4)
        js_file.write(f"export default {js_content};")

    return previews, new_words_count, output_file


def process_and_show_preview(input_file, output_dir, status_text=None):
    previews, new_words_count, output_file = process_file(input_file, output_dir)

    if status_text:
        preview_msg = f"Processed file: {os.path.basename(input_file)}\n"
        preview_msg += f"Output file: {os.path.basename(output_file)}\n"
        preview_msg += f"Added {new_words_count} new words.\n"
        preview_msg += "\nPreviews of each rhyme pattern:\n"
        preview_msg += "-" * 40 + "\n"

        for pattern, words in sorted(previews.items(), key=lambda item: get_sort_key(item[0])):
            preview_msg += f"Pattern {pattern}: {', '.join(words)}\n"

        status_text.delete(1.0, tk.END)
        status_text.insert(tk.END, preview_msg)
    else:
        print(f"Processed: {os.path.basename(input_file)}")
        print(f"Output: {os.path.basename(output_file)}")
        print(f"Added {new_words_count} new words.")
        print()

    return previews


if __name__ == "__main__":
    if len(sys.argv) > 2:
        input_file = sys.argv[1]
        output_dir = sys.argv[2]
        try:
            process_and_show_preview(input_file, output_dir)
        except Exception as e:
            print(f"Error processing file: {os.path.basename(input_file)}")
            print(f"Error details: {str(e)}")
            sys.exit(1)
    else:
        root = tk.Tk()
        app = RhymeGeneratorGUI(root)
        root.mainloop()