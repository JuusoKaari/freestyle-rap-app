# Data Persistence - Android Implementation

## Overview

The data persistence layer manages all local storage needs including vocabulary data, user preferences, recordings, and training progress. Uses Room database as the primary storage solution with SharedPreferences for simple key-value data.

## Core Architecture

### Database Schema Design
```kotlin
@Database(
    entities = [
        VocabularyEntity::class,
        WordEntity::class,
        RhymeGroupEntity::class,
        WordRhymeEntity::class,
        RecordingEntity::class,
        UserPreferencesEntity::class,
        TrainingProgressEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class FreestyleRapDatabase : RoomDatabase() {

    abstract fun vocabularyDao(): VocabularyDao
    abstract fun wordDao(): WordDao
    abstract fun rhymeDao(): RhymeDao
    abstract fun recordingDao(): RecordingDao
    abstract fun userPreferencesDao(): UserPreferencesDao
    abstract fun trainingProgressDao(): TrainingProgressDao
}
```

### Type Converters
```kotlin
class Converters {
    @TypeConverter
    fun fromLanguage(value: Language): String = value.code

    @TypeConverter
    fun toLanguage(value: String): Language = Language.fromCode(value)

    @TypeConverter
    fun fromList(value: List<String>): String = Gson().toJson(value)

    @TypeConverter
    fun toList(value: String): List<String> = Gson().fromJson(value, object : TypeToken<List<String>>() {}.type)
}
```

## Entity Definitions

### Vocabulary Entities
```kotlin
@Entity(tableName = "vocabularies")
data class VocabularyEntity(
    @PrimaryKey val id: String,
    val name: String,
    val language: String, // Language enum converted to string
    val category: String,
    val description: String,
    val wordCount: Int,
    val isCustom: Boolean,
    val createdAt: Long,
    val version: Int,
    val lastModified: Long
)

@Entity(
    tableName = "words",
    foreignKeys = [ForeignKey(
        entity = VocabularyEntity::class,
        parentColumns = ["id"],
        childColumns = ["vocabularyId"],
        onDelete = CASCADE
    )],
    indices = [Index("vocabularyId"), Index("rhymeGroup")]
)
data class WordEntity(
    @PrimaryKey val id: String,
    val vocabularyId: String,
    val word: String,
    val phonetic: String?,
    val syllableCount: Int,
    val rhymeGroup: String,
    val frequency: Int,
    val isFavorite: Boolean = false,
    val audioUrl: String?,
    val lastAccessed: Long = System.currentTimeMillis()
)
```

### User Data Entities
```kotlin
@Entity(tableName = "user_preferences")
data class UserPreferencesEntity(
    @PrimaryKey val userId: String = "default_user",
    val selectedLanguage: String,
    val selectedVocabularyId: String?,
    val bpm: Int,
    val selectedBeatId: String?,
    val volumeLevel: Float,
    val audioEnabled: Boolean,
    val recordingEnabled: Boolean,
    val theme: String,
    val lastModified: Long
)

@Entity(tableName = "training_progress")
data class TrainingProgressEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val trainingMode: String,
    val vocabularyId: String,
    val sessionDate: Long,
    val duration: Long,
    val wordsPracticed: Int,
    val rhymesFound: Int,
    val recordingsMade: Int,
    val achievements: List<String> // JSON string of achievement IDs
)
```

## Repository Pattern Implementation

### Base Repository
```kotlin
abstract class BaseRepository<T>(
    private val dao: BaseDao<T>
) {
    fun getAll(): Flow<List<T>> = dao.getAll()

    fun getById(id: String): Flow<T?> = dao.getById(id)

    suspend fun insert(item: T): Long = dao.insert(item)

    suspend fun insertAll(items: List<T>) = dao.insertAll(items)

    suspend fun update(item: T) = dao.update(item)

    suspend fun delete(item: T) = dao.delete(item)

    suspend fun deleteById(id: String) = dao.deleteById(id)
}
```

### Specific Repositories
```kotlin
class VocabularyRepository(
    private val vocabularyDao: VocabularyDao,
    private val wordDao: WordDao
) {
    fun getVocabulariesWithWordCounts(): Flow<List<VocabularyWithWordCount>> =
        vocabularyDao.getVocabulariesWithWordCounts()

    fun getWordsByVocabulary(vocabularyId: String): Flow<List<WordEntity>> =
        wordDao.getWordsByVocabulary(vocabularyId)

    fun searchWords(query: String, language: Language): Flow<List<WordEntity>> =
        wordDao.searchWords(query, language.code)

    suspend fun insertVocabularyWithWords(vocabulary: VocabularyEntity, words: List<WordEntity>) {
        vocabularyDao.insert(vocabulary)
        wordDao.insertAll(words)
    }
}
```

## Migration Strategy

### Data Migration from Web Version
1. **Vocabulary Files**: Parse JavaScript vocabulary files and convert to Room entities
2. **Audio Metadata**: Import audio URL mappings for word pronunciation
3. **User Preferences**: Migrate localStorage preferences to SharedPreferences
4. **Recordings**: Convert web-based recordings to Android-compatible format

### Database Migrations
```kotlin
val MIGRATION_1_2 = object : Migration(1, 2) {
    override fun migrate(database: SupportSQLiteDatabase) {
        database.execSQL(
            "ALTER TABLE words ADD COLUMN audioUrl TEXT"
        )
    }
}
```

## SharedPreferences for Simple Data

### Preferences Manager
```kotlin
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs = context.getSharedPreferences("freestyle_rap_prefs", Context.MODE_PRIVATE)

    var selectedLanguage: Language
        get() = Language.fromCode(prefs.getString("selectedLanguage", "fi") ?: "fi")
        set(value) = prefs.edit().putString("selectedLanguage", value.code).apply()

    var bpm: Int
        get() = prefs.getInt("bpm", 90)
        set(value) = prefs.edit().putInt("bpm", value).apply()

    var audioEnabled: Boolean
        get() = prefs.getBoolean("audioEnabled", true)
        set(value) = prefs.edit().putBoolean("audioEnabled", value).apply()
}
```

## Data Synchronization

### Remote Sync
- **Cloud Backup**: Sync user data and recordings to cloud
- **Vocabulary Updates**: Download new vocabulary packs
- **Cross-device Sync**: Share progress across devices
- **Conflict Resolution**: Handle concurrent modifications

### Background Sync with WorkManager
```kotlin
@HiltWorker
class DataSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val syncRepository: SyncRepository
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            syncRepository.syncUserData()
            syncRepository.syncVocabularyUpdates()
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

## Performance Optimization

### Database Optimization
- **Indexing**: Strategic indexes on frequently queried columns
- **Pagination**: Implement pagination for large result sets
- **Query Optimization**: Use EXPLAIN QUERY PLAN for performance analysis
- **Connection Pooling**: Configure appropriate connection pool size

### Caching Strategy
- **Memory Cache**: LRU cache for frequently accessed data
- **Disk Cache**: Persistent cache for expensive operations
- **Invalidation**: Smart cache invalidation strategies

### Background Processing
- **Database Operations**: Move heavy operations to background threads
- **Batch Operations**: Group multiple operations for efficiency
- **Progress Tracking**: Provide feedback for long-running operations
