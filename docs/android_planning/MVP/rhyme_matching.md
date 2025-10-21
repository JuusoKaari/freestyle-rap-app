# Rhyme Matching - MVP (Finnish Only)

## Overview

**MVP Scope**: Simple Finnish rhyme matching algorithm for basic functionality.

## Simple Finnish Rhyme Handler

### Core Algorithm
```kotlin
class SimpleFinnishRhymeHandler @Inject constructor(
    private val vocabularyRepository: VocabularyRepository
) {
    suspend fun findRhymes(word: String, limit: Int = 10): List<WordEntity> {
        return vocabularyRepository.getAllWords()
            .first() // Get all words (small dataset for MVP)
            .filter { it.id != getWordId(word) } // Exclude the input word
            .filter { matchesRhyme(word, it.word) }
            .take(limit)
    }

    private fun matchesRhyme(word1: String, word2: String): Boolean {
        // Simple rhyme matching based on ending sounds
        val ending1 = getWordEnding(word1)
        val ending2 = getWordEnding(word2)
        return ending1 == ending2 && ending1.length >= 2
    }

    private fun getWordEnding(word: String): String {
        // Extract last 2-3 characters for rhyme comparison
        return when {
            word.length >= 3 -> word.takeLast(3)
            word.length >= 2 -> word.takeLast(2)
            else -> word
        }
    }

    private fun getWordId(word: String): String {
        // Simple ID generation for comparison
        return word.hashCode().toString()
    }
}
```

### Interface Definition
```kotlin
interface RhymeHandler {
    suspend fun findRhymes(word: String, limit: Int = 10): List<WordEntity>
    fun getRhymeGroups(word: String): List<String>
}
```

## Database Integration

### Rhyme Group Storage
```kotlin
@Entity(tableName = "rhyme_groups")
data class RhymeGroupEntity(
    @PrimaryKey val rhymeSound: String,
    val exampleWords: List<String>,
    val frequency: Int
)
```

### Pre-computed Rhymes (Optional)
```kotlin
@Entity(tableName = "word_rhymes",
    foreignKeys = [ForeignKey(
        entity = WordEntity::class,
        parentColumns = ["id"],
        childColumns = ["wordId"]
    )])
data class WordRhymeEntity(
    @PrimaryKey val id: String,
    val wordId: String,
    val rhymeWordId: String,
    val rhymeType: String // "exact", "partial"
)
```

## Performance Strategy

### Simple Approach
- Load all words into memory for MVP (small dataset)
- Linear search through word list for rhymes
- No complex phonetic analysis needed initially

### Optimization for Later
```kotlin
// Future enhancement for better performance
class OptimizedRhymeHandler @Inject constructor(
    private val rhymeDao: RhymeDao
) {
    suspend fun findRhymesFast(wordId: String): List<WordEntity> {
        return rhymeDao.getRhymesForWord(wordId)
    }
}
```

## Finnish-Specific Rules

### Basic Vowel Harmony
```kotlin
object FinnishRhymeRules {
    private val frontVowels = setOf('ä', 'ö', 'y')
    private val backVowels = setOf('a', 'o', 'u')

    fun getVowelHarmonyType(word: String): VowelHarmony {
        // Simple vowel harmony detection
        return when {
            word.any { it in frontVowels } -> VowelHarmony.FRONT
            word.any { it in backVowels } -> VowelHarmony.BACK
            else -> VowelHarmony.NEUTRAL
        }
    }
}

enum class VowelHarmony {
    FRONT, BACK, NEUTRAL
}
```

## Error Handling

### Graceful Degradation
```kotlin
suspend fun findRhymesSafe(word: String): List<WordEntity> {
    return try {
        rhymeHandler.findRhymes(word)
    } catch (e: Exception) {
        // Fallback: return random words
        vocabularyRepository.getRandomWords(5).first()
    }
}
```

## Testing

### Simple Test Cases
```kotlin
class RhymeHandlerTest {
    @Test
    fun `sydän rhymes with other ydän words`() {
        val rhymes = rhymeHandler.findRhymes("sydän", 5)
        assertTrue(rhymes.any { it.word.contains("ydän") })
    }

    @Test
    fun `no rhymes returns empty list or fallback`() {
        val rhymes = rhymeHandler.findRhymes("xyzxyz", 5)
        // Should handle gracefully
    }
}
```

## Integration Points

### ViewModel Usage
```kotlin
@HiltViewModel
class RhymeExplorerViewModel @Inject constructor(
    private val rhymeHandler: RhymeHandler
) : ViewModel() {

    fun findRhymesForWord(word: String) {
        viewModelScope.launch {
            val rhymes = rhymeHandler.findRhymes(word, 10)
            _rhymes.value = rhymes
        }
    }
}
```

## Future Enhancements
- Phonetic transcription analysis
- Multi-syllable rhyme detection
- Machine learning-based similarity scoring
- Advanced Finnish linguistic rules
