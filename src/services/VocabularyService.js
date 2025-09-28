/**
 * VocabularyService (Canonical API)
 * ================================
 *
 * Provides canonical shape for vocabulary consumption across the app.
 * Adapts existing sources from `src/data/vocabulary/vocabularyConfig` into
 * a stable structure to support the unified rhyme system.
 */

import { getVocabularyData } from '../data/vocabulary/vocabularyConfig';
import { isEnglishVocabulary } from '../utils/languageUtils';

/**
 * CanonicalVocabulary shape:
 * Array<{
 *   pattern: string[]; // vowel pattern per syllable
 *   syllableCount: number;
 *   words: Array<{ word: string; syllables?: string[] }>
 * }>
 */

function toCanonicalShape(raw) {
  if (!raw) return [];

  if (Array.isArray(raw)) {
    // Already in canonical-like shape (custom vocabs)
    return raw.map(({ pattern, words }) => ({
      pattern,
      syllableCount: pattern.length,
      words: words.map(w => (typeof w === 'string' ? { word: w } : w))
    }));
  }

  // Old format: { 'A-A': ['koira', 'soira'] }
  return Object.entries(raw).map(([patternKey, words]) => {
    const pattern = patternKey.split('-');
    return {
      pattern,
      syllableCount: pattern.length,
      words: words.map(w => ({ word: w }))
    };
  });
}

export function getCanonicalVocabulary(vocabularyId) {
  const language = isEnglishVocabulary(vocabularyId) ? 'en' : 'fi';
  const data = getVocabularyData(vocabularyId, language);
  return toCanonicalShape(data);
}

export function getCanonicalFullDictionary(vocabularyId) {
  const isEnglish = isEnglishVocabulary(vocabularyId);
  const data = getVocabularyData(isEnglish ? 'en_full_dict' : 'fi_full_dict', isEnglish ? 'en' : 'fi');
  return toCanonicalShape(data);
}

export function canonicalToGroupMap(canonical) {
  const result = {};
  canonical.forEach(({ pattern, words }) => {
    const key = pattern.join('-');
    result[key] = words.map(w => (typeof w === 'string' ? w : w.word));
  });
  return result;
}


