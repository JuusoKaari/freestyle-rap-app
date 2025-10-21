# Data Persistence - MVP (Simple Room Setup)

## Overview

**MVP Scope**: Basic Room database for Finnish vocabulary storage.

## Database Configuration

### Simple Database Class
```kotlin
@Database(
    entities = [WordEntity::class, VocabularyMetadataEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {

    abstract fun wordDao(): WordDao
    abstract fun vocabularyMetadataDao(): VocabularyMetadataDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "freestyle_rap_mvp.db"
                ).build().also { INSTANCE = it }
            }
        }
    }
}
```

### Type Converters
```kotlin
class Converters {
    @TypeConverter
    fun fromString(value: String?): List<String>? {
        return value?.split(",")?.map { it.trim() }
    }

    @TypeConverter
    fun toString(list: List<String>?): String? {
        return list?.joinToString(",")
    }
}
```

## Entity Definitions

### Word Entity
```kotlin
@Entity(
    tableName = "words",
    indices = [Index("syllableCount"), Index("rhymeGroup")]
)
data class WordEntity(
    @PrimaryKey val id: String,
    val word: String,
    val phonetic: String?,
    val syllableCount: Int,
    val rhymeGroup: String,
    val frequency: Int = 1
)
```

### Metadata Entity
```kotlin
@Entity(tableName = "vocabulary_metadata")
data class VocabularyMetadataEntity(
    @PrimaryKey val id: String = "finnish_rap",
    val name: String = "Suomenkielinen rap-sanasto",
    val language: String = "fi",
    val wordCount: Int,
    val version: Int = 1,
    val lastUpdated: Long = System.currentTimeMillis()
)
```

## DAO Interfaces

### WordDao
```kotlin
@Dao
interface WordDao {

    @Query("SELECT * FROM words ORDER BY RANDOM() LIMIT :count")
    fun getRandomWords(count: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE syllableCount = :count")
    fun getWordsBySyllableCount(count: Int): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE word LIKE :query")
    fun searchWords(query: String): Flow<List<WordEntity>>

    @Query("SELECT * FROM words WHERE rhymeGroup = :rhymeGroup")
    fun getWordsByRhymeGroup(rhymeGroup: String): Flow<List<WordEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWords(words: List<WordEntity>)

    @Query("SELECT COUNT(*) FROM words")
    suspend fun getWordCount(): Int
}
```

### VocabularyMetadataDao
```kotlin
@Dao
interface VocabularyMetadataDao {

    @Query("SELECT * FROM vocabulary_metadata WHERE id = :id")
    fun getMetadata(id: String): Flow<VocabularyMetadataEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMetadata(metadata: VocabularyMetadataEntity)

    @Query("SELECT wordCount FROM vocabulary_metadata WHERE id = 'finnish_rap'")
    suspend fun getWordCount(): Int?
}
```

## Repository Implementation

### Simple Repository
```kotlin
@Singleton
class VocabularyRepository @Inject constructor(
    private val wordDao: WordDao,
    private val metadataDao: VocabularyMetadataDao,
    private val vocabularyInitializer: VocabularyInitializer
) {

    init {
        // Initialize vocabulary on first access
        CoroutineScope(Dispatchers.IO).launch {
            vocabularyInitializer.initializeIfNeeded()
        }
    }

    fun getRandomWords(count: Int): Flow<List<WordEntity>> =
        wordDao.getRandomWords(count)

    fun getWordsBySyllableCount(count: Int): Flow<List<WordEntity>> =
        wordDao.getWordsBySyllableCount(count)

    fun searchWords(query: String): Flow<List<WordEntity>> =
        wordDao.searchWords("%$query%")

    suspend fun getWordCount(): Int = wordDao.getWordCount()
}
```

## Data Initialization

### Asset Loading
```kotlin
@Singleton
class VocabularyInitializer @Inject constructor(
    private val wordDao: WordDao,
    private val metadataDao: VocabularyMetadataDao,
    @ApplicationContext private val context: Context
) {

    suspend fun initializeIfNeeded() {
        val currentCount = wordDao.getWordCount()
        if (currentCount == 0) {
            loadVocabularyFromAssets()
        }
    }

    private suspend fun loadVocabularyFromAssets() {
        val words = loadWordsFromJson()
        wordDao.insertWords(words)

        val metadata = VocabularyMetadataEntity(wordCount = words.size)
        metadataDao.insertMetadata(metadata)
    }

    private suspend fun loadWordsFromJson(): List<WordEntity> {
        return withContext(Dispatchers.IO) {
            val jsonString = context.assets
                .open("finnish_rap_vocabulary.json")
                .bufferedReader()
                .use { it.readText() }

            Gson().fromJson(jsonString, object : TypeToken<List<WordEntity>>() {}.type)
        }
    }
}
```

## Hilt Integration

### Database Module
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(
        @ApplicationContext context: Context
    ): AppDatabase = AppDatabase.getInstance(context)

    @Provides
    fun provideWordDao(database: AppDatabase): WordDao = database.wordDao()

    @Provides
    fun provideVocabularyMetadataDao(database: AppDatabase): VocabularyMetadataDao =
        database.vocabularyMetadataDao()
}
```

### Repository Module
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideVocabularyRepository(
        wordDao: WordDao,
        metadataDao: VocabularyMetadataDao,
        vocabularyInitializer: VocabularyInitializer
    ): VocabularyRepository = VocabularyRepository(wordDao, metadataDao, vocabularyInitializer)
}
```

## Simple JSON Asset Format

### finnish_rap_vocabulary.json
```json
[
  {
    "id": "sydan_001",
    "word": "sydän",
    "phonetic": "ˈsydæn",
    "syllableCount": 2,
    "rhymeGroup": "ydän",
    "frequency": 5
  },
  {
    "id": "tahti_002",
    "word": "tähti",
    "phonetic": "ˈtæhti",
    "syllableCount": 2,
    "rhymeGroup": "ähti",
    "frequency": 3
  }
]
```

## Error Handling

### Simple Error Recovery
```kotlin
suspend fun safeDatabaseOperation(operation: suspend () -> Unit) {
    try {
        operation()
    } catch (e: Exception) {
        // Log error and show user-friendly message
        Log.e("Database", "Operation failed", e)
        // Could emit error state to UI
    }
}
```

## Testing

### Database Tests
```kotlin
@RunWith(AndroidJUnit4::class)
class WordDaoTest {

    @Test
    fun insertAndRetrieveWords() {
        // Test basic CRUD operations
    }

    @Test
    fun getRandomWordsReturnsCorrectCount() {
        // Test random word selection
    }
}
```

## Migration Strategy

### Future Enhancements
- Add more vocabularies (English, other categories)
- User preferences storage
- Recording storage (for future versions)
- Vocabulary updates and versioning
