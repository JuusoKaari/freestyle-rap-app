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
MAX_SYLLABLES = 3

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
    """Convert CMU pattern to simple vowel pattern with dashes."""
    # Extract only vowel sounds (AA, AE, AH, etc.) with their stress numbers
    vowels = [part for part in pattern.split() if any(c.isdigit() for c in part)]
    # Remove stress numbers and join with dashes
    simple_pattern = "-".join(v.rstrip("012") for v in vowels)
    return simple_pattern


def process_word(word):
    syllable_count = get_syllable_count(word)
    if syllable_count < MIN_SYLLABLES or syllable_count > MAX_SYLLABLES:
        return None, None

    pronunciations = pronouncing.phones_for_word(word)
    if pronunciations:
        # Use full pronunciation pattern instead of just rhyming part
        full_pattern = pronunciations[0]
        simple_pattern = simplify_cmu_pattern(full_pattern)
        return simple_pattern, syllable_count
    return None, None


def load_existing_data(output_file):
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as js_file:
            content = js_file.read()
            json_str = content.replace('export default ', '').strip().rstrip(';')
            return json.loads(json_str)
    return {}


def process_file(input_file, output_dir):
    with open(input_file, "r", encoding="utf-8") as file:
        text = file.read()

    text = re.sub(r'[.,!?:;"\'\(\)\[\]{}]', '', text)
    words = [word.strip().lower() for word in text.split() if word.strip()]

    input_basename = os.path.splitext(os.path.basename(input_file))[0]
    output_file = os.path.join(output_dir, f"EN_{input_basename}.js")

    vowel_patterns = load_existing_data(output_file)
    previews = {}
    new_words_count = 0

    for word in words:
        if len(word) < 4 or len(word) > 15:
            continue

        rhyme_part, syllable_count = process_word(word)

        if not rhyme_part:
            continue

        if rhyme_part not in vowel_patterns:
            vowel_patterns[rhyme_part] = []

        if word not in vowel_patterns[rhyme_part]:
            vowel_patterns[rhyme_part].append(word)
            new_words_count += 1

    output_data = {}
    for pattern, words in sorted(vowel_patterns.items()):
        if words:
            unique_words = sorted(list(set(words)))
            output_data[pattern] = unique_words
            previews[pattern] = unique_words[:5]

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

        for pattern, words in sorted(previews.items()):
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