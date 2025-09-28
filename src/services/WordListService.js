/**
 * Word List Service
 * ================
 * 
 * Service responsible for word list generation and management.
 * Handles word selection, rhyme grouping, and vocabulary management.
 * 
 * Key responsibilities:
 * - Dynamic word list generation based on selected vocabulary
 * - Rhyme group management and filtering
 * - Support for different vocabulary sets (rap, animals, full dictionary)
 * - Word shuffling and randomization
 * - Minimum word group size enforcement
 * 
 * The service ensures that generated word lists:
 * - Contain sufficient rhyming pairs
 * - Are properly shuffled for training
 * - Match the selected language and vocabulary set
 * - Meet minimum group size requirements for training modes
 */

import { getVocabularyData } from '../data/vocabulary/vocabularyConfig';
import { FinnishRhymeHandler } from './rhyming/FinnishRhymeHandler';
import { EnglishRhymeHandler } from './rhyming/EnglishRhymeHandler';
import { EnhancedRhymeHandler } from './rhyming/EnhancedRhymeHandler';
import { getCanonicalVocabulary, getCanonicalFullDictionary, canonicalToGroupMap } from './VocabularyService';
import { scoreSimilarity, DISTINCTIVE_WEIGHTS_FI, DISTINCTIVE_WEIGHTS_DEFAULT } from './rhyming/EnhancedRhymeHandler';
import { getDisplayWord, splitWord } from '../utils/wordUtils';
import { isEnglishVocabulary } from '../utils/languageUtils';

// Helper function to count total words in a vowel group
const getGroupWordCount = (group, words) => {
  return (words[group] || []).length;
};

// Function to get vocabulary based on selection
const getVocabulary = (vocabulary, language) => {
  // For 'all' case, we need to determine language from the current context
  if (vocabulary === 'all') {
    // Default to 'fi' if we can't determine the language
    const vocabData = getVocabularyData(vocabulary, language);
    if (!vocabData) {
      console.warn('Unknown vocabulary:', vocabulary);
      return getVocabularyData('fi_generic_rap', 'fi');
    }
    return vocabData;
  }

  // For regular vocabularies, determine language from the ID
  const isEnglish = isEnglishVocabulary(vocabulary);
  const vocabData = getVocabularyData(vocabulary, isEnglish ? 'en' : 'fi');
  if (!vocabData) {
    console.warn('Unknown vocabulary:', vocabulary);
    return getVocabularyData('fi_generic_rap', 'fi');
  }
  
  // Convert the new vocabulary format to the old format
  if (Array.isArray(vocabData)) {
    // New format (custom vocabularies)
    const result = {};
    vocabData.forEach(({ pattern, words }) => {
      const patternKey = pattern.join('-');
      result[patternKey] = words.map(w => w.word);
    });
    return result;
  }
  
  // Old format (built-in vocabularies)
  return vocabData;
};

// Function to get the full dictionary based on language
const getFullDictionary = (vocabulary) => {
  const isEnglish = isEnglishVocabulary(vocabulary);
  return getVocabularyData(isEnglish ? 'en_full_dict' : 'fi_full_dict', isEnglish ? 'en' : 'fi');
};

// Helper function to randomly select N items from an array
const getRandomItems = (array, n) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
};

// Helper function to spread out words considering alphabetical distance
const spreadOutWords = (words, lookbackWindow = 5) => {
  if (words.length === 0) return [];

  // If we're dealing with word objects, extract just the words for sorting
  const isWordObjects = typeof words[0] === 'object' && words[0].word;
  const wordStrings = isWordObjects ? words.map(w => w.word) : words;
  
  const wordsCopy = [...wordStrings];
  let shuffled = [];
  let remainingWords = new Set(wordsCopy);

  // Start with a random word
  let currentWord = wordsCopy[Math.floor(Math.random() * wordsCopy.length)];
  shuffled.push(currentWord);
  remainingWords.delete(currentWord);

  while (remainingWords.size > 0) {
    let possibleWords = Array.from(remainingWords);
    possibleWords.sort(() => Math.random() - 0.5);
    
    let selectedWord = null;
    
    for (let candidate of possibleWords) {
      if (shuffled.slice(-lookbackWindow).every(prev => 
        Math.abs(wordsCopy.indexOf(candidate) - wordsCopy.indexOf(prev)) > lookbackWindow)) {
        selectedWord = candidate;
        break;
      }
    }

    if (!selectedWord) {
      selectedWord = possibleWords[0];
    }

    shuffled.push(selectedWord);
    remainingWords.delete(selectedWord);
  }
  
  // If we're dealing with word objects, map the shuffled words back to their original objects
  if (isWordObjects) {
    const wordMap = new Map(words.map(w => [w.word, w]));
    return shuffled.map(word => wordMap.get(word));
  }
  
  return shuffled;
};

// Function to get a list of words from a vocabulary
export const generateWordList = async ({
  minWordsInGroup = 1,
  vocabulary,
  includeRhymes = false,
  syllableRange = { min: 1, max: 10 },
  language = 'fi'  // Add language parameter with default value
}) => {
  const useUnified = true;

  // When unified flag is on, obtain canonical then adapt to group map
  const vocabData = useUnified
    ? canonicalToGroupMap(getCanonicalVocabulary(vocabulary))
    : getVocabulary(vocabulary, language);
  if (!vocabData) return [];

  // Filter patterns based on syllable count
  const filteredVocab = {};
  Object.entries(vocabData).forEach(([pattern, words]) => {
    const syllableCount = pattern.split('-').length;
    if (syllableCount >= syllableRange.min && syllableCount <= syllableRange.max) {
      filteredVocab[pattern] = words;
    }
  });

  // Get all words from filtered patterns
  const allWords = [];
  Object.entries(filteredVocab).forEach(([pattern, words]) => {
    words.forEach(word => {
      const { display, phonetic } = splitWord(word);
      allWords.push({
        word: display.replace(/-/g, '').replace(/_/g, ' '),
        phonetic: phonetic.replace(/_/g, ''),
        group: pattern
      });
    });
  });

  if (allWords.length === 0) return [];

  // If rhymes are not needed, just return shuffled words
  if (!includeRhymes) {
    const wordObjects = allWords.map(({ word, phonetic, group }) => ({
      word: word,
      phonetic: phonetic,
      group: group,
      rhymes: []
    }));
    return spreadOutWords(wordObjects);
  }

  // Get rhyming handler based on language
  const isEnglish = isEnglishVocabulary(vocabulary);
  const rhymeHandler = useUnified
    ? new EnhancedRhymeHandler(isEnglish ? 'en' : 'fi')
    : (isEnglish ? new EnglishRhymeHandler() : new FinnishRhymeHandler());

  // Get full dictionary for rhyme hints
  const fullDict = useUnified
    ? canonicalToGroupMap(getCanonicalFullDictionary(vocabulary))
    : getFullDictionary(vocabulary);

  // Process each word to find its rhyming pairs
  const processedWords = allWords.map(({ word, phonetic, group }) => {
    if (!group) return { word, phonetic, group, rhymes: [] };

    if (useUnified && rhymeHandler.findUnifiedRhymes) {
      const { themed, full } = rhymeHandler.findUnifiedRhymes(
        word,
        group,
        filteredVocab,
        fullDict,
        { maxPerBucket: 6, minRequired: minWordsInGroup }
      );

      const filterBySyllables = (arr) => arr.filter(r => {
        const rhymePattern = r.group;
        if (!rhymePattern) return true; // allow partials without groups
        const syllableCount = rhymePattern.split('-').length;
        return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
      });

      const filteredThemed = filterBySyllables(themed);
      const filteredFull = filterBySyllables(full);

      // Default random ordering for other modes
      const merged = [...filteredThemed, ...filteredFull];
      const shuffledAll = getRandomItems(merged, merged.length);
      const selected = shuffledAll.slice(0, 12);

      return { word, phonetic, group, rhymes: selected };
    }

    // Legacy path (kept for safety; should not be used with unified handler enabled)
    // Find exact rhymes from the same group in filtered vocabulary (themed)
    const exactThemedRhymes = rhymeHandler.findExactRhymes(word, group, filteredVocab, false);
    const exactFullRhymes = rhymeHandler.findExactRhymes(word, group, fullDict, true);
    const allExactRhymes = [
      ...exactThemedRhymes.map(rhyme => ({ ...rhyme, isSlant: false, isThemed: true })),
      ...exactFullRhymes
        .filter(rhyme => !exactThemedRhymes.some(tr => tr.word === rhyme.word))
        .map(rhyme => ({ ...rhyme, isSlant: false, isThemed: false }))
    ];

    let slantRhymes = [];
    if (allExactRhymes.length < minWordsInGroup) {
      const slantThemedRhymes = rhymeHandler.findSlantRhymes(word, group, filteredVocab, false);
      const slantFullRhymes = rhymeHandler.findSlantRhymes(word, group, fullDict, true);
      slantRhymes = [
        ...slantThemedRhymes.map(rhyme => ({ ...rhyme, isSlant: true, isThemed: true })),
        ...slantFullRhymes
          .filter(rhyme => !slantThemedRhymes.some(tr => tr.word === rhyme.word))
          .map(rhyme => ({ ...rhyme, isSlant: true, isThemed: false }))
      ];
    }

    const allThemedRhymes = [
      ...allExactRhymes.filter(rhyme => rhyme.isThemed),
      ...slantRhymes.filter(rhyme => rhyme.isThemed)
    ].filter(rhyme => {
      const rhymePattern = rhyme.group;
      if (!rhymePattern) return false;
      const syllableCount = rhymePattern.split('-').length;
      return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
    });

    const allFullRhymes = [
      ...allExactRhymes.filter(rhyme => !rhyme.isThemed),
      ...slantRhymes.filter(rhyme => !rhyme.isThemed)
    ].filter(rhyme => {
      const rhymePattern = rhyme.group;
      if (!rhymePattern) return false;
      const syllableCount = rhymePattern.split('-').length;
      return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
    });

    const merged = [...allThemedRhymes, ...allFullRhymes];
    const selected = merged.length > 12 ? getRandomItems(merged, 12) : merged;
    return { word, phonetic, group, rhymes: selected };
  });

  // Filter words that have enough rhyming pairs (considering both themed and full rhymes)
  const wordsWithRhymes = processedWords.filter(item => 
    (item.rhymes.length) >= minWordsInGroup - 1
  );

  if (wordsWithRhymes.length === 0) return [];

  // Return shuffled words with their rhymes
  return spreadOutWords(wordsWithRhymes);
}; 