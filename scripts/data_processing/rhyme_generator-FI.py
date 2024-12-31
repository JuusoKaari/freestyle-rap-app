import json
import re
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkinter.scrolledtext import ScrolledText
import os
import sys

# Configuration constants
MIN_SYLLABLES = 2
MAX_SYLLABLES = 3

class RhymeGeneratorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Rhyme Generator")
        self.root.geometry("800x600")  # Made window bigger for previews
        
        # Create main frame
        self.main_frame = ttk.Frame(root, padding="10")
        self.main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Input file frame
        self.file_frame = ttk.LabelFrame(self.main_frame, text="Input File", padding="5")
        self.file_frame.grid(row=0, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.file_label = ttk.Label(self.file_frame, text="No file selected")
        self.file_label.grid(row=0, column=0, sticky=tk.W, padx=5)
        
        self.browse_button = ttk.Button(self.file_frame, text="Browse", command=self.browse_file)
        self.browse_button.grid(row=0, column=1, padx=5)
        
        # Output directory frame
        self.output_frame = ttk.LabelFrame(self.main_frame, text="Output Directory", padding="5")
        self.output_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        self.output_label = ttk.Label(self.output_frame, text="No directory selected")
        self.output_label.grid(row=0, column=0, sticky=tk.W, padx=5)
        
        self.output_button = ttk.Button(self.output_frame, text="Select", command=self.select_output_dir)
        self.output_button.grid(row=0, column=1, padx=5)
        
        # Process button
        self.process_button = ttk.Button(self.main_frame, text="Process File", command=self.process_file)
        self.process_button.grid(row=2, column=0, columnspan=2, pady=10)
        
        # Status text (made taller for previews)
        self.status_text = ScrolledText(self.main_frame, height=20, width=70)
        self.status_text.grid(row=3, column=0, columnspan=2, pady=5)
        
        # Initialize variables
        self.input_file = None
        self.output_dir = None
    
    def browse_file(self):
        filename = filedialog.askopenfilename(
            filetypes=[("Text Files", "*.txt"), ("All Files", "*.*")]
        )
        if filename:
            self.input_file = filename
            self.file_label.config(text=os.path.basename(filename))
            # Automatically set output directory to the same as input file
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

def tavuta_uusi(sana):
    vowels = "aeiouyäö"
    diftongit = ["ai", "ei", "oi", "ui", "yi", "äi", "öi", "au", "eu", "iu", "ou", "ey", "iy", "äy", "öy", "ie", "yö", "uo"]
    result = ""

    i = 0
    while i < len(sana):
        char = sana[i]
        result += char

        # Jos merkki on vokaali
        if char in vowels:
            next_chars = sana[i+1:i+4]  # Tarkista seuraavat kolme merkkiä
            if len(next_chars) == 3 and all(c not in vowels for c in next_chars):
                # Jos seuraavat kolme merkkiä ovat konsonantteja, lisää tavuviiva toisen ja kolmannen konsonantin väliin
                result += next_chars[0] + next_chars[1] + "-"
                i += 2  # Hyppää kahden ensimmäisen konsonantin yli
            elif len(next_chars) >= 2 and all(c not in vowels for c in next_chars[:2]):
                # Jos seuraavat kaksi merkkiä ovat konsonantteja, lisää tavuviiva niiden väliin
                result += next_chars[0] + "-"
                i += 1  # Hyppää ensimmäisen konsonantin yli
            elif (i + 1 < len(sana)) and (sana[i + 1] in vowels):
                # Jos seuraava merkki on vokaali, mutta ei muodosta diftongia tai tuplavokaalia, lisää tavuviiva
                if sana[i:i+2] in diftongit or sana[i] == sana[i + 1]:
                    pass  # Älä lisää tavuviivaa diftongien tai tuplavokaalien kohdalla
                else:
                    result += "-"
            elif (i + 1 < len(sana)) and (sana[i + 1] not in vowels):
                # Jos seuraava merkki ei ole vokaali, lisää tavuviiva
                result += "-"

        i += 1

    # Poista viimeinen tavuviiva, jos sen jälkeen on vain yksittäinen konsonantti
    split_result = result.split("-")
    if len(split_result) > 1 and len(split_result[-1]) == 1 and split_result[-1] not in vowels:
        split_result[-2] += split_result[-1]
        split_result.pop()
    result = "-".join(split_result)

    # Palauta tavuviivoilla merkitty sana
    return result

def get_vowels_only(syllable, is_last_syllable=False):
    vowels = "aeiouyäö"
    
    # Check if syllable has exactly one vowel and a single consonant after it
    # Skip this special rule for the last syllable
    if not is_last_syllable:
        vowels_in_syllable = [char for char in syllable if char in vowels]
        if len(vowels_in_syllable) == 1:
            vowel_index = syllable.index(vowels_in_syllable[0])
            # Check if there's any consonants after the vowel
            if vowel_index < len(syllable) - 1 and all(c not in vowels for c in syllable[vowel_index + 1:]):
                # Return the vowel twice to match rhyming pattern
                return vowels_in_syllable[0] * 2
    
    # Default case: return all vowels in sequence
    return ''.join(char for char in syllable if char in vowels)

def get_syllable_vowel_pattern(word):
    """Get the vowel pattern for each syllable of a hyphenated word."""
    syllables = word.split("-")
    syllable_count = len(syllables)
    if syllable_count < MIN_SYLLABLES or syllable_count > MAX_SYLLABLES:
        return None, None
    
    # Process each syllable, marking the last one
    vowel_patterns = []
    for i, syllable in enumerate(syllables):
        is_last_syllable = (i == len(syllables) - 1)
        vowel_patterns.append(get_vowels_only(syllable, is_last_syllable))
    
    return vowel_patterns, syllable_count

def load_existing_data(output_file):
    """Load existing words from JS file if it exists."""
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as js_file:
            content = js_file.read()
            # Remove the export default and parse the JSON part
            json_str = content.replace('export default ', '').strip().rstrip(';')
            return json.loads(json_str)
    return {}

def prosessoi_tiedosto(input_file, output_dir):
    with open(input_file, "r", encoding="utf-8") as file:
        text = file.read()
    
    # Remove punctuation and split into words
    text = re.sub(r'[.,!?:;"\'\(\)\[\]{}]', '', text)
    sanat = [word.strip() for word in text.split() 
             if word.strip() 
             and len(word.strip()) >= 4 
             and len(word.strip()) <= 15]

    # Generate output filename based on input filename
    input_basename = os.path.splitext(os.path.basename(input_file))[0]
    output_file = os.path.join(output_dir, f"FI_{input_basename}.js")

    # Load existing data if any
    vowel_patterns = load_existing_data(output_file)
    previews = {}
    new_words_count = 0

    for sana in sanat:
        sana = sana.strip().lower()
        if not sana:
            continue

        hyphenated_word = tavuta_uusi(sana)
        vowel_pattern, syllable_count = get_syllable_vowel_pattern(hyphenated_word)
        
        # Skip if no valid vowel pattern or not 2-3 syllables
        if not vowel_pattern or syllable_count not in [2, 3]:
            continue

        # Create pattern key (e.g., "a-e" or "a-e-i")
        pattern_key = "-".join(vowel_pattern)
        
        # Initialize pattern list if it doesn't exist
        if pattern_key not in vowel_patterns:
            vowel_patterns[pattern_key] = []
        
        # Add word if it's not already in the list
        if hyphenated_word not in vowel_patterns[pattern_key]:
            vowel_patterns[pattern_key].append(hyphenated_word)
            new_words_count += 1

    # Sort patterns and prepare output data
    output_data = {}
    for pattern, words in sorted(vowel_patterns.items()):
        if words:  # Only include patterns that have words
            unique_words = sorted(list(set(words)))
            output_data[pattern] = unique_words
            # Store first 5 words of each pattern for preview
            previews[pattern] = unique_words[:5]
    
    # Save to JS file with export syntax
    with open(output_file, "w", encoding="utf-8") as js_file:
        js_content = json.dumps(output_data, ensure_ascii=False, indent=4)
        js_file.write(f"export default {js_content};")
    
    return previews, new_words_count, output_file

def process_and_show_preview(input_file, output_dir, status_text=None):
    previews, new_words_count, output_file = prosessoi_tiedosto(input_file, output_dir)
    
    if status_text:  # GUI mode - show full preview
        preview_msg = f"Processed file: {os.path.basename(input_file)}\n"
        preview_msg += f"Output file: {os.path.basename(output_file)}\n"
        preview_msg += f"Added {new_words_count} new words.\n"
        preview_msg += "\nPreviews of each vowel pattern:\n"
        preview_msg += "-" * 40 + "\n"
        
        for pattern, words in sorted(previews.items()):
            syllable_count = len(pattern.split("-"))
            preview_msg += f"{syllable_count}-syllable pattern {pattern}: {', '.join(words)}\n"
        
        status_text.delete(1.0, tk.END)
        status_text.insert(tk.END, preview_msg)
    else:  # Command-line mode - show only summary
        print(f"Processed: {os.path.basename(input_file)}")
        print(f"Output: {os.path.basename(output_file)}")
        print(f"Added {new_words_count} new words.")
        print()  # Empty line between files
    
    return previews


if __name__ == "__main__":
    # Check if command line arguments are provided
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
        # No command line arguments, start GUI
        root = tk.Tk()
        app = RhymeGeneratorGUI(root)
        root.mainloop()
