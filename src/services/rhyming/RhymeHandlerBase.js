/**
 * Base class for language-specific rhyme handlers
 * Defines the interface that all language-specific handlers must implement
 */
export class RhymeHandlerBase {
  /**
   * Find exact rhyming words for the given word
   * @param {string} word - The word to find rhymes for
   * @param {string} group - The vowel pattern group
   * @param {Object} wordList - Dictionary of words grouped by vowel pattern
   * @param {boolean} isFullDict - Whether we're searching in full dictionary
   * @returns {Array} Array of rhyming words
   */
  findExactRhymes(word, group, wordList, isFullDict) {
    throw new Error('findExactRhymes must be implemented by language-specific handler');
  }

  /**
   * Find slant rhymes for the given word
   * @param {string} word - The word to find slant rhymes for
   * @param {string} group - The vowel pattern group
   * @param {Object} wordList - Dictionary of words grouped by vowel pattern
   * @param {boolean} isFullDict - Whether we're searching in full dictionary
   * @returns {Array} Array of slant rhyming words
   */
  findSlantRhymes(word, group, wordList, isFullDict) {
    throw new Error('findSlantRhymes must be implemented by language-specific handler');
  }

  /**
   * Check if two groups are exact rhyme groups
   * @param {string} group1 - First vowel pattern group
   * @param {string} group2 - Second vowel pattern group
   * @returns {boolean} Whether the groups are exact rhyme groups
   */
  areExactRhymeGroups(group1, group2) {
    throw new Error('areExactRhymeGroups must be implemented by language-specific handler');
  }

  /**
   * Normalize a word for comparison
   * @param {string} word - Word to normalize
   * @returns {string} Normalized word
   */
  normalizeWord(word) {
    throw new Error('normalizeWord must be implemented by language-specific handler');
  }
} 