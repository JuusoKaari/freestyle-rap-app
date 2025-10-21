# Rhyme Matching Engine - Android Implementation

## Overview

The rhyme matching system implements sophisticated algorithms for detecting rhymes in both Finnish and English, adapting the web-based rhyme handlers to run efficiently on Android devices.

## Core Architecture

### RhymeHandler Interface
```kotlin
interface RhymeHandler {
    fun findRhymes(word: String, vocabularyId: String): List<RhymeMatch>
    fun calculateSimilarity(word1: String, word2: String): Double
    fun getRhymeGroups(word: String): List<String>
    fun findMultiSyllableRhymes(word: String, syllableCount: Int): List<RhymeMatch>
}
```

### RhymeMatch Model
```kotlin
data class RhymeMatch(
    val word: String,
    val phonetic: String?,
    val similarity: Double,
    val rhymeType: RhymeType,
    val syllableMatch: Boolean,
    val stressPattern: String?
)

enum class RhymeType {
    EXACT,      // Same rhyme group
    EXTENDED,   // Same ending sound
    PARTIAL     // Similarity-based matching
}
```

## Language-Specific Implementations

### 1. Finnish Rhyme Handler
- **Vowel Harmony**: Implement Finnish vowel harmony rules
- **Compound Words**: Handle Finnish compound word structures
- **Consonant Gradation**: Account for consonant changes in different cases
- **Distinctive Weights**: Custom scoring for Finnish phonetics

### 2. English Rhyme Handler
- **Phonetic Transcription**: Use IPA or custom phonetic system
- **Stress Patterns**: Consider syllable stress for rhyme quality
- **Multi-syllable Rhymes**: Support for rhymes across multiple syllables
- **Regional Variations**: Account for different English accents

### 3. Enhanced Rhyme Handler
- **Unified Interface**: Common API for both languages
- **Multi-tier Matching**: Exact → Extended → Partial rhyme detection
- **Similarity Scoring**: Advanced algorithm with configurable weights
- **Performance Optimization**: Caching and indexing for fast lookups

## Algorithm Details

### Similarity Scoring
- **End-match Emphasis**: Higher weight for ending sound matches
- **Vowel Quality**: Consider vowel sound similarity
- **Consonant Clusters**: Analyze consonant groupings
- **Length Bonus**: Prefer longer matching segments

### Multi-tier Rhyme Detection
1. **Exact Rhymes**: Same rhyme group/phonetic ending
2. **Extended Rhymes**: Similar ending sounds with slight variations
3. **Partial Rhymes**: Similarity-based matches using phonetic distance

## Database Integration

### Rhyme Data Storage
```kotlin
@Entity(tableName = "rhyme_groups")
data class RhymeGroup(
    @PrimaryKey val id: String,
    val language: Language,
    val phoneticPattern: String,
    val exampleWords: List<String>
)

@Entity(tableName = "word_rhymes",
        foreignKeys = [ForeignKey(
            entity = Word::class,
            parentColumns = ["id"],
            childColumns = ["wordId"]
        )])
data class WordRhyme(
    @PrimaryKey val id: String,
    val wordId: String,
    val rhymeGroupId: String,
    val similarity: Double,
    val rhymeType: RhymeType
)
```

### Query Optimization
- Pre-computed rhyme relationships in database
- Indexed queries for fast rhyme lookup
- Batch processing for rhyme calculation
- Incremental updates for new vocabulary

## Performance Considerations

### Caching Strategy
- In-memory LRU cache for frequent rhyme queries
- Persistent cache for expensive calculations
- Background pre-computation for common words

### Background Processing
- Use WorkManager for rhyme calculation tasks
- Prioritize user-facing rhyme queries
- Batch process large vocabulary updates
- Progress tracking for long-running operations

### Memory Management
- Streaming results for large rhyme sets
- Cleanup of unused rhyme data
- Efficient data structures for rhyme graphs
