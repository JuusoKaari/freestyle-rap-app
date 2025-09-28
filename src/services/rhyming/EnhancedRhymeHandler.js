/**
 * EnhancedRhymeHandler
 * ====================
 *
 * Unified rhyme logic across languages with multi-tier matching and quality scoring.
 * Consumes canonical vocabulary shapes through VocabularyService.
 *
 * Tiers:
 * - exact: same vowel pattern group (with FI single/double vowel handling)
 * - extended: same ending pattern (last 1-2 parts)
 * - partial: similarity-based fallbacks using end-match and distinctive consonants
 */

import { EnglishRhymeHandler } from './EnglishRhymeHandler';
import { FinnishRhymeHandler } from './FinnishRhymeHandler';
import { getDisplayWord, splitWord } from '../../utils/wordUtils';

// Default distinctive consonant weights (generic)
export const DISTINCTIVE_WEIGHTS_DEFAULT = {
  'r': 1.5,
  'k': 1.2,
  't': 1.2,
  'p': 1.0,
  's': 1.0,
  'l': 0.8,
  'm': 0.8,
  'n': 0.8
};

// Finnish profile (matches RhymeSearchMode_FI behavior)
export const DISTINCTIVE_WEIGHTS_FI = {
  'r': 2.0,
  's': 1.5,
  'h': 1.2,
  'j': 1.2,
  'v': 1.1
};

export function normalizeForScoring(rawWord) {
  const { phonetic } = splitWord(rawWord);
  return phonetic.replace(/[-_]/g, '').toLowerCase();
}

export function scoreSimilarity(baseWord, candidateWord, options = {}) {
  const weights = options.weights || DISTINCTIVE_WEIGHTS_DEFAULT;
  const word1 = normalizeForScoring(baseWord);
  const word2 = normalizeForScoring(candidateWord);

  if (Math.abs(word1.length - word2.length) > 3) return 0;

  let score = 0;
  const len = Math.min(word1.length, word2.length);

  // Distinctive consonant presence/penalty
  Object.entries(weights).forEach(([consonant, weight]) => {
    const a = word1.includes(consonant);
    const b = word2.includes(consonant);
    if (a && b) score += weight;
    else if (a !== b) score -= weight * 0.5;
  });

  // End matches (double weight)
  let endMatches = 0;
  for (let i = 1; i <= len; i++) {
    const c1 = word1[word1.length - i];
    const c2 = word2[word2.length - i];
    if (c1 === c2) {
      endMatches += 1;
      if (weights[c1]) endMatches += weights[c1] * 0.5;
    } else {
      break;
    }
  }
  score += endMatches * 2;

  // Start matches (light weight)
  let startMatches = 0;
  for (let i = 0; i < len; i++) {
    const c1 = word1[i];
    const c2 = word2[i];
    if (c1 === c2) {
      startMatches += 0.5;
      if (weights[c1]) startMatches += weights[c1] * 0.25;
    } else {
      break;
    }
  }
  score += startMatches;

  return score;
}

// Seeded PRNG and shuffle for deterministic random sorting
export function seededRandomGenerator(seed) {
  let state = seed || Date.now();
  return function next() {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export function shuffleWithSeed(array, seed) {
  const shuffled = [...array];
  const rand = seededRandomGenerator(seed);
  let currentIndex = shuffled.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(rand() * currentIndex);
    currentIndex -= 1;
    const tmp = shuffled[currentIndex];
    shuffled[currentIndex] = shuffled[randomIndex];
    shuffled[randomIndex] = tmp;
  }
  return shuffled;
}

export const SORT_METHODS = {
  SIMILARITY: 'similarity',
  ALPHABETICAL: 'alphabetical',
  RANDOM: 'random'
};

export function sortWordsByMode(words, method, baseWord, options = {}) {
  const weights = options.weights || DISTINCTIVE_WEIGHTS_DEFAULT;
  const seed = options.seed || Date.now();
  switch (method) {
    case SORT_METHODS.ALPHABETICAL:
      return [...words].sort();
    case SORT_METHODS.SIMILARITY:
      return [...words].sort((a, b) => {
        const sa = scoreSimilarity(baseWord, a, { weights });
        const sb = scoreSimilarity(baseWord, b, { weights });
        return sb - sa;
      });
    case SORT_METHODS.RANDOM:
      return shuffleWithSeed(words, seed);
    default:
      return words;
  }
}

export class EnhancedRhymeHandler {
  constructor(language) {
    this.language = language === 'en' ? 'en' : 'fi';
    this.base = this.language === 'en' ? new EnglishRhymeHandler() : new FinnishRhymeHandler();
  }

  // Multi-tier matching with scoring and budgeted result sizes
  findUnifiedRhymes(word, group, themedDict, fullDict, options = {}) {
    const maxPerBucket = options.maxPerBucket ?? 6;
    const needAtLeast = options.minRequired ?? 1;

    // Exact from themed and full
    const exactThemed = this.base.findExactRhymes(word, group, themedDict, false)
      .map(r => ({ ...r, isSlant: false, isThemed: true }));
    const exactFull = this.base.findExactRhymes(word, group, fullDict, true)
      .filter(r => !exactThemed.some(t => t.word === r.word))
      .map(r => ({ ...r, isSlant: false, isThemed: false }));

    // If not enough, extended (same ending pattern)
    let extendedThemed = [];
    let extendedFull = [];
    if (exactThemed.length + exactFull.length < needAtLeast) {
      const slantThemed = this.base.findSlantRhymes(word, group, themedDict, false)
        .map(r => ({ ...r, isSlant: true, isThemed: true }));
      const slantFull = this.base.findSlantRhymes(word, group, fullDict, true)
        .filter(r => !slantThemed.some(t => t.word === r.word))
        .map(r => ({ ...r, isSlant: true, isThemed: false }));
      extendedThemed = slantThemed;
      extendedFull = slantFull;
    }

    // Partial: similarity-based
    let partialThemed = [];
    let partialFull = [];
    if (exactThemed.length + exactFull.length + extendedThemed.length + extendedFull.length < needAtLeast) {
      const themedCandidates = Object.values(themedDict).flat();
      const fullCandidates = Object.values(fullDict).flat();
      const normalizedSelf = normalizeForScoring(word);

      const pickTop = (arr) => arr
        .filter(w => normalizeForScoring(w) !== normalizedSelf)
        .map(w => ({ w, s: scoreSimilarity(word, w, { weights: this.language === 'fi' ? DISTINCTIVE_WEIGHTS_FI : DISTINCTIVE_WEIGHTS_DEFAULT }) }))
        .filter(x => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, maxPerBucket)
        .map(x => ({ word: getDisplayWord(x.w), group: null }));

      partialThemed = pickTop(themedCandidates).map(r => ({ ...r, isSlant: true, isThemed: true }));
      partialFull = pickTop(fullCandidates)
        .filter(r => !partialThemed.some(t => t.word === r.word))
        .map(r => ({ ...r, isSlant: true, isThemed: false }));
    }

    const themed = [...exactThemed, ...extendedThemed, ...partialThemed];
    const full = [...exactFull, ...extendedFull, ...partialFull];

    // Trim to budget
    const trim = (arr) => arr.slice(0, maxPerBucket);
    return { themed: trim(themed), full: trim(full) };
  }
}


