# Android MVP - Freestyle Rap Training App

## Project Overview

**MVP Scope**: Finnish-only Single Rhymes mode with basic functionality for rapid development and testing.

## Tech Stack
- **Language**: Kotlin
- **Dependency Injection**: Hilt
- **Architecture**: MVVM
- **UI**: Jetpack Compose
- **Database**: Room (for vocabulary storage)
- **Audio**: ExoPlayer (for single beat playback)

## Core Features (MVP Only)

### ✅ Single Training Mode
- **Single Rhymes Mode**: Display words and their rhymes in Finnish

### ✅ Single Vocabulary
- **Finnish Generic Rap**: Pre-loaded Finnish vocabulary set

### ✅ Single Beat
- **One Beat File**: Single background beat for rhythm

### ❌ Excluded from MVP
- Recording system
- Multiple training modes
- Vocabulary selection
- Beat selection
- English language support

## Project Structure
```
app/src/main/java/com/freestylerap/
├── data/
│   ├── local/           # Room database, DAOs
│   ├── repository/      # Vocabulary repository
│   └── model/           # Word, Vocabulary models
├── di/                  # Hilt modules
├── ui/
│   ├── screens/         # RhymeExplorerScreen, HomeScreen
│   ├── components/      # WordCard, RhymeList
│   └── theme/           # Basic theming
├── utils/               # Constants and utilities
└── services/            # AudioService, RhymeService
```

## Development Phases

### Phase 1: Foundation (Week 1)
- [ ] Project setup with Hilt
- [ ] Room database for Finnish vocabulary
- [ ] Basic MVVM structure
- [ ] Single Compose screen layout

### Phase 2: Core Functionality (Week 2)
- [ ] Load and display Finnish words
- [ ] Basic rhyme matching
- [ ] Single beat playback

### Phase 3: Polish (Week 3)
- [ ] UI improvements
- [ ] Error handling
- [ ] Performance optimization
- [ ] Testing

## Quick Start Database Schema

```kotlin
@Database(entities = [VocabularyEntity::class, WordEntity::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun vocabularyDao(): VocabularyDao
    abstract fun wordDao(): WordDao
}

@Entity(tableName = "vocabularies")
data class VocabularyEntity(
    @PrimaryKey val id: String,
    val name: String,
    val language: String,
    val wordCount: Int
)

@Entity(tableName = "words")
data class WordEntity(
    @PrimaryKey val id: String,
    val vocabularyId: String,
    val word: String,
    val phonetic: String?,
    val syllableCount: Int,
    val rhymeGroup: String,
    val audioUrl: String?
)
```

## Simple Audio Setup

```kotlin
@Singleton
class AudioService @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val exoPlayer = ExoPlayer.Builder(context).build()

    fun playBeat() {
        // Play single beat file from assets
    }

    fun playWordAudio(audioUrl: String) {
        // Play word pronunciation
    }
}
```

## Basic Rhyme Matching

```kotlin
class SimpleFinnishRhymeHandler {
    fun findRhymes(word: String): List<String> {
        // Simple rhyme matching based on ending sounds
        // Return words that rhyme with input word
    }
}
```

## Assets Needed

### Vocabulary Data
- Single JSON file with Finnish rap vocabulary
- Include word, phonetic, syllable count, rhyme group (no audio URLs needed)

### Audio Files
- Single beat file (MP3/AAC)

## API Keys/Config
- No API keys needed for MVP (no remote audio)
- No authentication needed for MVP

## Testing Strategy
- Unit tests for rhyme algorithm
- Integration tests for database operations
- Manual testing on physical devices

## Deployment
- APK generation for testing
- No Play Store submission for MVP
