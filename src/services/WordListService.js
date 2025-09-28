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
  const vocabData = getVocabulary(vocabulary, language);
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
      rhymes: [],
      themed_rhymes: []
    }));
    return spreadOutWords(wordObjects);
  }

  // Get rhyming handler based on language
  const isEnglish = isEnglishVocabulary(vocabulary);
  const rhymeHandler = isEnglish ? new EnglishRhymeHandler() : new FinnishRhymeHandler();

  // Get full dictionary for rhyme hints
  const fullDict = getFullDictionary(vocabulary);

  // Process each word to find its rhyming pairs
  const processedWords = allWords.map(({ word, phonetic, group }) => {
    if (!group) return { word, phonetic, group, rhymes: [], themed_rhymes: [] };

    // Find exact rhymes from the same group in filtered vocabulary (themed)
    const exactThemedRhymes = rhymeHandler.findExactRhymes(word, group, filteredVocab, false);
    
    // Find exact rhymes from full dictionary
    const exactFullRhymes = rhymeHandler.findExactRhymes(word, group, fullDict, true);
    
    // Combine exact rhymes, prioritizing themed ones
    const allExactRhymes = [
      ...exactThemedRhymes.map(rhyme => ({ ...rhyme, isSlant: false, isThemed: true })),
      ...exactFullRhymes
        .filter(rhyme => !exactThemedRhymes.some(tr => tr.word === rhyme.word))
        .map(rhyme => ({ ...rhyme, isSlant: false, isThemed: false }))
    ];

    // Only look for slant rhymes if we don't have enough exact rhymes
    let slantRhymes = [];
    if (allExactRhymes.length < minWordsInGroup) {
      // First try slant rhymes from filtered vocabulary
      const slantThemedRhymes = rhymeHandler.findSlantRhymes(word, group, filteredVocab, false);
      
      // Then try slant rhymes from full dictionary
      const slantFullRhymes = rhymeHandler.findSlantRhymes(word, group, fullDict, true);
      
      // Combine slant rhymes, prioritizing themed ones
      slantRhymes = [
        ...slantThemedRhymes.map(rhyme => ({ ...rhyme, isSlant: true, isThemed: true })),
        ...slantFullRhymes
          .filter(rhyme => !slantThemedRhymes.some(tr => tr.word === rhyme.word))
          .map(rhyme => ({ ...rhyme, isSlant: true, isThemed: false }))
      ];
    }

    // Combine and filter themed rhymes
    const allThemedRhymes = [
      ...allExactRhymes.filter(rhyme => rhyme.isThemed),
      ...slantRhymes.filter(rhyme => rhyme.isThemed)
    ].filter(rhyme => {
      const rhymePattern = rhyme.group;
      if (!rhymePattern) return false;
      const syllableCount = rhymePattern.split('-').length;
      return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
    });

    // Combine and filter full dictionary rhymes
    const allFullRhymes = [
      ...allExactRhymes.filter(rhyme => !rhyme.isThemed),
      ...slantRhymes.filter(rhyme => !rhyme.isThemed)
    ].filter(rhyme => {
      const rhymePattern = rhyme.group;
      if (!rhymePattern) return false;
      const syllableCount = rhymePattern.split('-').length;
      return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
    });

    // Get random selection if we have too many rhymes
    const selectedThemedRhymes = allThemedRhymes.length > 6 ? 
      getRandomItems(allThemedRhymes, 6) : allThemedRhymes;

    const selectedFullRhymes = allFullRhymes.length > 6 ? 
      getRandomItems(allFullRhymes, 6) : allFullRhymes;

    return {
      word,
      phonetic,
      group,
      rhymes: selectedFullRhymes,
      themed_rhymes: selectedThemedRhymes
    };
  });

  // Filter words that have enough rhyming pairs (considering both themed and full rhymes)
  const wordsWithRhymes = processedWords.filter(item => 
    (item.themed_rhymes.length + item.rhymes.length) >= minWordsInGroup - 1
  );

  if (wordsWithRhymes.length === 0) return [];

  // Return shuffled words with their rhymes
  return spreadOutWords(wordsWithRhymes);
}; 