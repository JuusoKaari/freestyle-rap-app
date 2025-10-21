# Vocabulary System - Android Implementation

## Overview

The vocabulary system manages word collections, categories, and custom user-defined vocabularies. This Android implementation will use Room database for local storage and provide efficient access patterns for rhyme generation.

## Core Components

### 1. Vocabulary Models
```kotlin
@Entity(tableName = "vocabularies")
data class Vocabulary(
    @PrimaryKey val id: String,
    val name: String,
    val language: Language,
    val category: VocabularyCategory,
    val description: String,
    val wordCount: Int,
    val isCustom: Boolean,
    val createdAt: Long
)

@Entity(tableName = "words")
data class Word(
    @PrimaryKey val id: String,
    val vocabularyId: String,
    val word: String,
    val phonetic: String?,
    val syllableCount: Int,
    val rhymeGroup: String,
    val frequency: Int,
    @ColumnInfo(defaultValue = "false")
    val isFavorite: Boolean
)
```

### 2. Vocabulary Categories
- **Predefined Categories**: Animals, Science, Cars, Clothes, Numbers, Shopping List
- **Special Categories**: Generic Rap, Love Battle 2025
- **Custom Categories**: User-defined collections
- **Full Dictionary**: Complete language dictionaries

### 3. Language Support
- **Finnish**: Vowel harmony rules, compound word handling
- **English**: Phonetic transcription, stress pattern recognition

## Repository Pattern

### VocabularyRepository
```kotlin
interface VocabularyRepository {
    fun getAllVocabularies(): Flow<List<Vocabulary>>
    fun getVocabularyById(id: String): Flow<Vocabulary>
    fun getWordsByVocabularyId(vocabularyId: String): Flow<List<Word>>
    fun searchWords(query: String, language: Language): Flow<List<Word>>
    fun getWordsBySyllableCount(count: Int): Flow<List<Word>>
    suspend fun insertCustomVocabulary(vocabulary: Vocabulary, words: List<Word>)
    suspend fun updateWord(word: Word)
}
```

## Data Sources

### 1. Pre-loaded Vocabularies
- Bundle vocabulary JSON files in assets
- Parse and insert into Room database on first run
- Include metadata files for audio URLs and rhyme data

### 2. Custom Vocabularies
- User-created word collections
- Import from text files or manual entry
- Export functionality for sharing

### 3. Remote Vocabulary Updates
- Cloud sync for new vocabulary packs
- Background updates using WorkManager
- Version checking and incremental updates

## Audio Integration

### Word Audio Metadata
- Store audio URLs for each word in vocabulary
- Support multiple voice options (Harri for Finnish, Hunter for English)
- Cache management for audio files

### TTS Fallback
- Google Text-to-Speech integration for custom words
- SSML support for pronunciation enhancement
- Voice selection based on language preferences

## Performance Considerations

### Database Optimization
- Indexing on frequently queried fields (language, syllableCount, rhymeGroup)
- Pagination for large vocabulary sets
- Efficient rhyme group queries using SQL JOINs

### Memory Management
- Lazy loading of vocabulary data
- LRU cache for frequently accessed words
- Background cleanup of unused audio files

### Search Optimization
- Full-text search using FTS4 (SQLite Full Text Search)
- Phonetic search for approximate matching
- Debounced search queries for smooth UX
