# Freestyle Rap Training App

A React-based application for practicing freestyle rap in Finnish and English. The app helps users improve their rap and rhyming skills through various interactive training modes.

🎤 **[Try it out here!](https://juusokaari.github.io/freestyle-rap-app/)** 🎵

## Features

### Training Modes
- **Rhyme Explorer**: Browse through words and their rhyming pairs to expand vocabulary
- **Find Rhymes**: Interactive game to identify rhyming words against a timer
- **2-bar Setup & Punchline**: Practice basic setup-punchline patterns
- **4-bar Setup & Punchline**: Advanced practice with extended rhyme schemes

### Vocabulary Management
- Multiple predefined word sets
- Support for both Finnish and English
- Themed collections (rap, animals)
- Full dictionary support
- Dynamic word list generation

### Beat System
- Multiple beat patterns with adjustable BPM
- Beat-synchronized word changes
- Visual timing indicators
- Loading state management

### Bilingual Support
- Full Finnish and English translations
- Language-specific rhyme generation
- Separate vocabulary sets for each language

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation for development
1. Clone the repository
```bash
git clone [repository-url]
cd freestyle_app/my-react-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Usage

1. Select your preferred language (FI/EN)
2. Choose a beat and vocabulary set
3. Select a training mode:
   - Use Rhyme Explorer to learn new rhyming patterns
   - Play Find Rhymes to test your rhyme recognition
   - Practice with 2-bar or 4-bar modes for freestyle training

### Keyboard Controls
- Space: Play/Pause beat
- Left/Right arrows: Navigate words (in Rhyme Explorer)
- Ctrl+Shift+D: Toggle debug mode

## Project Structure

The project follows a modular architecture:
```
/src
  /components      # React components
    /modes         # Training mode components
  /data           # Configuration and data files
    /vocabulary   # Word lists and vocabularies
  /services       # Core services (translation, debug)
  /styles         # CSS styles
/scripts          # Data processing utilities
```

## Development

### Adding New Features
- Training modes: Add new mode to `trainingModes.js`
- Vocabularies: Add word lists to `/data/vocabulary/`
- Translations: Update language files in `/data/translations/`

### Debug Mode
Access development features with Ctrl+Shift+D:
- Word list inspection
- Manual word navigation
- Additional UI controls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.