#!/usr/bin/env python3
import tkinter as tk
from tkinter import ttk
import json
from pathlib import Path
import re

class BeatManagerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Beat Manager")
        
        # Get the script directory
        self.script_dir = Path(__file__).parent.absolute()
        
        # Create main frame
        main_frame = ttk.Frame(root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Create treeview
        self.tree = ttk.Treeview(main_frame, columns=('Raw', 'Processed', 'Uploaded'), show='headings')
        
        # Configure columns
        self.tree.heading('Raw', text='Raw')
        self.tree.heading('Processed', text='Processed')
        self.tree.heading('Uploaded', text='Uploaded')
        
        # Set column widths
        for col in ('Raw', 'Processed', 'Uploaded'):
            self.tree.column(col, width=200)
        
        # Add scrollbar
        scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Grid layout
        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Add refresh button
        refresh_btn = ttk.Button(main_frame, text="Refresh", command=self.refresh_status)
        refresh_btn.grid(row=1, column=0, pady=10)
        
        # Configure grid weights
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(0, weight=1)
        
        # Initial refresh
        self.refresh_status()

    def get_beat_name_from_json(self, json_path):
        """Extract beat name from JSON file"""
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
                return data.get('name', json_path.stem)
        except:
            return json_path.stem

    def refresh_status(self):
        """Refresh the beat status display"""
        # Clear current items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Get all beats in different stages
        raw_dir = self.script_dir / "beats" / "__raw_beat_files"
        processed_dir = self.script_dir / "beats" / "__processed_beats"
        uploaded_dir = self.script_dir / "beats" / "__uploaded_beats"
        
        # Collect all beat IDs
        beat_ids = set()
        
        # Check raw files (both JSON and non-SKIP JSON)
        raw_jsons = list(raw_dir.glob("*.json"))
        raw_beats = {}
        skipped_beats = set()
        
        # First, identify skipped beats
        for json_file in raw_jsons:
            if json_file.name.startswith("SKIP_"):
                skipped_beats.add(json_file.name[5:].replace(".json", ""))
            else:
                beat_id = json_file.stem
                raw_beats[beat_id] = self.get_beat_name_from_json(json_file)
        
        beat_ids.update(raw_beats.keys())
        beat_ids.update(skipped_beats)
        
        # Check processed beats
        processed_beats = {
            d.name: d.name.replace('_', ' ').title()
            for d in processed_dir.glob("*")
            if d.is_dir()
        }
        beat_ids.update(processed_beats.keys())
        
        # Check uploaded beats
        uploaded_beats = {
            d.name: d.name.replace('_', ' ').title()
            for d in uploaded_dir.glob("*")
            if d.is_dir()
        }
        beat_ids.update(uploaded_beats.keys())
        
        # Add rows for each beat
        for beat_id in sorted(beat_ids):
            # Initialize empty values
            raw_value = ""
            processed_value = ""
            uploaded_value = ""
            
            # Determine the current state and set the appropriate value
            if beat_id in raw_beats:
                # Unprocessed beat
                raw_value = raw_beats[beat_id]
            elif beat_id in skipped_beats and beat_id in processed_beats:
                # Processed but not uploaded
                processed_value = processed_beats[beat_id]
            elif beat_id in uploaded_beats:
                # Fully uploaded
                uploaded_value = uploaded_beats[beat_id]
            
            self.tree.insert('', tk.END, values=(raw_value, processed_value, uploaded_value))

def main():
    root = tk.Tk()
    root.geometry("650x400")
    app = BeatManagerGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main() 