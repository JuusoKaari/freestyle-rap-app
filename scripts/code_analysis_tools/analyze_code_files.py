#!/usr/bin/env python3
"""
Code File Line Count Analyzer
Analyzes all code files in the src folder (excluding data folder) and reports line counts,
with emphasis on the top 10 longest files.
"""

import os
import sys
from pathlib import Path
from collections import defaultdict

def get_line_count(file_path):
    """Count the number of lines in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            return len(f.readlines())
    except Exception as e:
        print(f"Warning: Could not read {file_path}: {e}")
        return 0

def is_code_file(file_path):
    """Check if a file is considered a code file based on its extension."""
    code_extensions = {
        '.js', '.jsx', '.ts', '.tsx',  # JavaScript/TypeScript
        '.py', '.pyx',                  # Python
        '.css', '.scss', '.sass',       # Stylesheets
        '.html', '.htm',                # HTML
        '.json',                        # JSON
        '.xml',                         # XML
        '.md',                          # Markdown
        '.txt',                         # Text files
        '.yml', '.yaml',                # YAML
        '.sql',                         # SQL
        '.php',                         # PHP
        '.java',                        # Java
        '.c', '.cpp', '.h', '.hpp',     # C/C++
        '.cs',                          # C#
        '.rb',                          # Ruby
        '.go',                          # Go
        '.rs',                          # Rust
        '.swift',                       # Swift
        '.kt',                          # Kotlin
        '.vue',                         # Vue
        '.svelte',                      # Svelte
    }
    return file_path.suffix.lower() in code_extensions

def analyze_src_folder():
    """Analyze all code files in the src folder."""
    # Get the project root (assuming script is in scripts/ folder)
    script_dir = Path(__file__).parent.parent
    project_root = script_dir.parent
    src_folder = project_root / "src"
    
    if not src_folder.exists():
        print(f"Error: src folder not found at {src_folder}")
        sys.exit(1)
    
    print(f"Analyzing code files in: {src_folder} (excluding data folder)")
    print("=" * 60)
    
    file_stats = []
    total_lines = 0
    total_files = 0
    extension_stats = defaultdict(lambda: {'files': 0, 'lines': 0})
    
    # Walk through all files in src folder (excluding data folder)
    for file_path in src_folder.rglob('*'):
        if file_path.is_file() and is_code_file(file_path):
            # Skip files in the data folder
            if 'data' in file_path.parts:
                continue
                
            line_count = get_line_count(file_path)
            relative_path = file_path.relative_to(project_root)
            
            file_stats.append({
                'path': str(relative_path),
                'lines': line_count,
                'extension': file_path.suffix.lower()
            })
            
            total_lines += line_count
            total_files += 1
            
            # Update extension stats
            ext = file_path.suffix.lower()
            extension_stats[ext]['files'] += 1
            extension_stats[ext]['lines'] += line_count
    
    # Sort by line count (descending)
    file_stats.sort(key=lambda x: x['lines'], reverse=True)
    
    # Print summary statistics
    print(f"SUMMARY:")
    print(f"Total code files analyzed: {total_files}")
    print(f"Total lines of code: {total_lines:,}")
    print(f"Average lines per file: {total_lines / total_files if total_files > 0 else 0:.1f}")
    print()
    
    # Print top 10 longest files
    print("🔥 TOP 10 LONGEST FILES:")
    print("-" * 60)
    for i, file_info in enumerate(file_stats[:10], 1):
        print(f"{i:2d}. {file_info['path']:<45} {file_info['lines']:>6} lines")
    print()
    
    # Print statistics by file extension
    print("📊 STATISTICS BY FILE TYPE:")
    print("-" * 60)
    sorted_extensions = sorted(extension_stats.items(), key=lambda x: x[1]['lines'], reverse=True)
    for ext, stats in sorted_extensions:
        avg_lines = stats['lines'] / stats['files'] if stats['files'] > 0 else 0
        print(f"{ext:<8} {stats['files']:>3} files  {stats['lines']:>6} lines  (avg: {avg_lines:.1f})")
    print()
    
    # Print all files if requested
    show_all = input("Show all files? (y/N): ").lower().startswith('y')
    if show_all:
        print("📋 ALL FILES (sorted by line count):")
        print("-" * 60)
        for i, file_info in enumerate(file_stats, 1):
            print(f"{i:3d}. {file_info['path']:<45} {file_info['lines']:>6} lines")
    
    # Check for files over 300 lines (user's rule)
    large_files = [f for f in file_stats if f['lines'] > 300]
    if large_files:
        print()
        print("⚠️  FILES OVER 300 LINES (might need splitting):")
        print("-" * 60)
        for file_info in large_files:
            print(f"   {file_info['path']:<45} {file_info['lines']:>6} lines")

if __name__ == "__main__":
    analyze_src_folder() 