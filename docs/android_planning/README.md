# Android Native Version - Overview Plan

## Project Overview

This document outlines the plan for building a native Android version of the Freestyle Rap Training Application using Kotlin and Hilt for dependency injection. The app will replicate the core functionality of the React web version while leveraging Android platform capabilities.

## Architecture Overview

### Tech Stack
- **Language**: Kotlin
- **Dependency Injection**: Hilt (Dagger Hilt)
- **Architecture Pattern**: MVVM with Clean Architecture principles
- **UI Framework**: Jetpack Compose
- **Database**: Room Persistence Library
- **Network**: Retrofit + OkHttp
- **Audio**: MediaPlayer, AudioRecord, ExoPlayer (for advanced audio features)
- **Background Tasks**: WorkManager
- **Local Storage**: DataStore/SharedPreferences

### Project Structure
```
app/src/main/java/com/freestylerap/
├── data/
│   ├── local/           # Room database, DAOs, entities
│   ├── remote/          # API services, DTOs
│   ├── repository/      # Repository implementations
│   └── model/           # Domain models
├── di/                  # Hilt dependency injection modules
├── domain/
│   ├── usecase/         # Business logic use cases
│   └── repository/      # Repository interfaces
├── ui/
│   ├── components/      # Reusable Compose components
│   ├── screens/         # Main screens and navigation
│   ├── theme/           # App theming and styling
│   └── viewmodel/       # ViewModels for each screen
└── utils/               # Utility classes and extensions
```

## Core Features

### 1. Training Modes
[training_modes.md](training_modes.md) - Different practice modes for freestyle training

### 2. Vocabulary Management
[vocabulary_system.md](vocabulary_system.md) - Word sets, categories, and custom vocabularies

### 3. Rhyme Matching Engine
[rhyme_matching.md](rhyme_matching.md) - Finnish and English rhyme detection algorithms

### 4. Audio System
[audio_system.md](audio_system.md) - Beat playback, word pronunciation, and audio controls

### 5. Recording System
[recording_system.md](recording_system.md) - Microphone recording and playback functionality

### 6. Data Persistence
[data_persistence.md](data_persistence.md) - Local storage and data management

### 7. User Interface
[user_interface.md](user_interface.md) - Navigation, theming, and UI components

## Development Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup with Hilt configuration
- [ ] Basic MVVM architecture implementation
- [ ] Room database setup for vocabulary storage
- [ ] Simple training mode (Single Rhymes)
- [ ] Basic audio playback for beats

### Phase 2: Core Features
- [ ] All training modes implementation
- [ ] Advanced rhyme matching algorithms
- [ ] Recording functionality
- [ ] Vocabulary management system

### Phase 3: Polish & Enhancement
- [ ] UI/UX improvements
- [ ] Performance optimizations
- [ ] Offline support
- [ ] Advanced audio features

## Key Technical Considerations

### Audio Handling
- Use ExoPlayer for beat streaming from URLs
- AudioRecord for microphone input recording
- SoundPool for UI sound effects
- Background music service for continuous playback

### Offline Support
- Bundle essential audio files in assets
- Cache remote audio files using Room
- Implement offline vocabulary sets
- Background sync for new content

### Performance Optimization
- Lazy loading of vocabulary data
- Pagination for large word lists
- Audio file caching and compression
- Background processing for rhyme calculations

### Platform Integration
- Microphone permission handling
- Audio focus management
- Background playback controls
- Media session integration

## Migration Strategy

### Data Migration
1. Convert JavaScript vocabulary files to JSON format
2. Generate Room entities from vocabulary structure
3. Create migration scripts for data transformation
4. Validate rhyme data integrity

### Feature Parity
- Map React components to Compose screens
- Convert CSS styles to Material Design 3
- Adapt web audio patterns to Android audio APIs
- Implement gesture-based interactions

## Testing Strategy

- Unit tests for rhyme algorithms and business logic
- Integration tests for audio playback and recording
- UI tests for training modes and navigation
- Performance tests for large vocabulary sets

## Deployment & Distribution

- APK and AAB generation
- Play Store listing and screenshots
- Beta testing strategy
- Update mechanism for vocabulary and audio content
