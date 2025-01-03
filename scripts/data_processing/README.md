# Data Processing Scripts

This directory contains scripts for preprocessing and generating data for the Freestyle Rap Trainer app.

## Contents

### Python Scripts
- `wordlist_processor-FI.py` - Script for processing Finnish word lists and generating vowel pattern combinations
- `wordlist_processor-EN.py` - Script for processing English word lists and generating vowel pattern combinations
- `populate_rhyme_groups-EN.py` - Script for generating rhyme groups from English vocabulary
- `combine_vocabulary.py` - Script for combining multiple vocabulary files into one

### Batch Files
- `process_all_wordlists.bat` - Processes all .txt files in the raw_wordlists folder into vocabulary files
- `process_rhymes-FI.bat` - Processes a single Finnish word list file (drag & drop interface)
- `process_rhymes-EN.bat` - Processes a single English word list file (drag & drop interface)
- `populate_rhymes-EN.bat` - Generates rhyme groups from English vocabulary files
- `combine_vocabulary.bat` - Combines multiple vocabulary files into one

## Usage

These scripts are not part of the web application itself but are used to generate and maintain the data used by the app.

### Typical Workflow
1. Add new word lists as .txt files to `src/data/vocabulary/raw_wordlists/`
2. Run `process_all_wordlists.bat` to process all word lists into vocabulary files
3. Use individual processing scripts if you need to process single files