/**
 * Language Utilities
 * ================
 * 
 * Utility functions for language detection and handling across the application.
 * Centralizes language detection logic to avoid duplication and improve maintainability.
 */

/**
 * Determines the language code from a vocabulary ID
 * @param {string} vocabularyId - The vocabulary identifier (e.g., 'en_animals', 'fi_rap', 'all')
 * @returns {string} The language code ('en', 'fi', or 'mixed' for 'all')
 */
export const getLanguageFromVocabularyId = (vocabularyId) => {
  if (vocabularyId === 'all') return 'mixed';
  return vocabularyId.startsWith('en_') ? 'en' : 'fi';
};

/**
 * Checks if a vocabulary ID represents an English vocabulary
 * @param {string} vocabularyId - The vocabulary identifier
 * @returns {boolean} True if the vocabulary is English-based
 */
export const isEnglishVocabulary = (vocabularyId) => {
  return getLanguageFromVocabularyId(vocabularyId) === 'en';
};

/**
 * Checks if a vocabulary ID represents a Finnish vocabulary
 * @param {string} vocabularyId - The vocabulary identifier
 * @returns {boolean} True if the vocabulary is Finnish-based
 */
export const isFinnishVocabulary = (vocabularyId) => {
  return getLanguageFromVocabularyId(vocabularyId) === 'fi';
}; 