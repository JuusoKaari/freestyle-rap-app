# Training Modes - Android Implementation

## Overview

This section covers the implementation of various freestyle training modes in the Android native version, adapting the React-based training modes to use Compose UI and Android-specific patterns.

## Training Mode Categories

### 1. Setup & Punchline Mode
- **Purpose**: Practice writing setup lines leading to punchlines
- **Implementation**: Compose UI with text input fields and rhyme suggestions
- **Data Flow**: Real-time rhyme matching as user types

### 2. Rhyme Explorer Mode
- **Purpose**: Explore vocabulary and discover rhyme patterns
- **Implementation**: Grid/list view of words with interactive rhyme highlighting
- **Features**: Syllable filtering, audio playback for pronunciation

### 3. Find Rhymes Mode
- **Purpose**: Game mode with timer challenges for finding rhymes
- **Implementation**: Interactive quiz interface with countdown timer
- **Features**: Scoring system, difficulty levels, streak tracking

### 4. Rhyme Map Mode (Language-specific)
- **Purpose**: Visual representation of rhyme connections
- **Implementation**: Custom Compose views showing word relationships
- **Features**: Finnish and English specific rhyme pattern visualization

### 5. Rhyme Search Mode
- **Purpose**: Advanced rhyme filtering and search capabilities
- **Implementation**: Search interface with multiple filter options
- **Features**: Syllable count filtering, rhyme quality scoring

### 6. Slot Machine Mode
- **Purpose**: Continuous word generation with adjustable timing
- **Implementation**: Animated slot machine UI with BPM synchronization
- **Features**: Variable bar lengths, beat-synchronized word changes

### 7. Lyrics Writing Mode
- **Purpose**: Structured rap composition practice
- **Implementation**: Multi-section editor with rhyme assistance
- **Features**: Bar structure, rhyme scheme suggestions

## Technical Implementation

### ViewModels
- `TrainingModeViewModel`: Base class for all training modes
- Mode-specific ViewModels inheriting from base class
- State management for current words, rhymes, and user input

### Compose Screens
- `TrainingModeRenderer`: Main container adapting to different modes
- Mode-specific composables for unique UI requirements
- Shared components for common elements (word display, audio controls)

### Navigation
- Nested navigation within training modes
- State preservation during mode switches
- Deep linking support for sharing specific training sessions

### State Management
- Centralized state in ViewModels using StateFlow
- Offline persistence of training progress
- Sync with cloud services for cross-device progress
