# Vocabulary System - MVP (Finnish Only)

## Overview

**MVP Scope**: Single Finnish vocabulary set with basic Room database storage.

## Core Components

### Single Vocabulary
- **Finnish Generic Rap**: Pre-loaded vocabulary for Finnish rap training
- **Word Count**: ~500-1000 words for basic functionality
- **No Selection UI**: Vocabulary is fixed for MVP

### Database Schema
```kotlin
@Entity(tableName = "words")
data class WordEntity(
    @PrimaryKey val id: String,
    val word: String,
    val phonetic: String?,           // IPA pronunciation
    val syllableCount: Int,          // For filtering
    val rhymeGroup: String,          // Rhyme classification
    val frequency: Int = 1           // Usage frequency
)

@Entity(tableName = "vocabulary_metadata")
data class VocabularyMetadataEntity(
    @PrimaryKey val id: String = "finnish_rap",
    val name: String = "Suomenkielinen rap-sanasto",
    val language: String = "fi",
    val wordCount: Int,
    val version: Int = 1
)
```

## Repository Pattern

### Simple Repository
```kotlin
interface VocabularyRepository {
    fun getAllWords(): Flow<List<WordEntity>>
    fun getRandomWords(count: Int): Flow<List<WordEntity>>
    fun getWordsBySyllableCount(count: Int): Flow<List<WordEntity>>
    fun searchWords(query: String): Flow<List<WordEntity>>
    fun getWordById(id: String): Flow<WordEntity?>
}

class VocabularyRepositoryImpl @Inject constructor(
    private val wordDao: WordDao
) : VocabularyRepository {
    override fun getAllWords(): Flow<List<WordEntity>> =
        wordDao.getAllWords()

    override fun getRandomWords(count: Int): Flow<List<WordEntity>> =
        wordDao.getRandomWords(count)

    override fun searchWords(query: String): Flow<List<WordEntity>> =
        wordDao.searchWords("%$query%")
}
```

## Data Access Objects

### Word DAO
```kotlin
@Dao
interface WordDao {
    @Query("SELECT * FROM words ORDER BY RANDOM() LIMIT :count")
    fun getRandomWords(count: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE syllableCount = :count")
    fun getWordsBySyllableCount(count: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE word LIKE :query")
    fun searchWords(query: String): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE id = :id")
    fun getWordById(id: String): Flow<WordEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWords(words: List<WordEntity>)

    @Query("SELECT COUNT(*) FROM words")
    suspend fun getWordCount(): Int
}
```

## Data Initialization

### Asset-Based Loading
```kotlin
class VocabularyInitializer @Inject constructor(
    private val wordDao: WordDao,
    private val metadataDao: VocabularyMetadataDao,
    @ApplicationContext private val context: Context
) {
    suspend fun initializeVocabulary() {
        val currentCount = wordDao.getWordCount()
        if (currentCount == 0) {
            // Load vocabulary from JSON asset
            val words = loadVocabularyFromAssets()
            wordDao.insertWords(words)
            metadataDao.insert(VocabularyMetadataEntity(wordCount = words.size))
        }
    }

    private suspend fun loadVocabularyFromAssets(): List<WordEntity> {
        return withContext(Dispatchers.IO) {
            val jsonString = context.assets.open("finnish_rap_vocabulary.json")
                .bufferedReader()
                .use { it.readText() }

            // Parse JSON to WordEntity list
            Gson().fromJson(jsonString, object : TypeToken<List<WordEntity>>() {}.type)
        }
    }
}
```

## Assets Required

### Finnish Rap Vocabulary JSON
```json
[
  {
    "id": "word_1",
    "word": "sydän",
    "phonetic": "ˈsydæn",
    "syllableCount": 2,
    "rhymeGroup": "ydän",
    "frequency": 5
  }
]
```

## Performance Considerations

### Simple Indexing
```kotlin
@Entity(tableName = "words",
    indices = [
        Index("syllableCount"),
        Index("rhymeGroup")
    ])
data class WordEntity(...)
```

### Caching Strategy
- No complex caching needed for MVP
- Room handles query optimization
- Single vocabulary keeps memory usage low
