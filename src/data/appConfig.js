/**
 * Application Feature Configuration
 * =================================
 * Central flags for language-gated features. Mode language availability
 * lives on each entry in modeRegistry.js.
 */

export const APP_FEATURES = {
  /** Languages that support user-created custom vocabularies */
  customVocabularyLanguages: ['fi'],
};

export const isCustomVocabularyEnabled = (language) =>
  APP_FEATURES.customVocabularyLanguages.includes(language);
