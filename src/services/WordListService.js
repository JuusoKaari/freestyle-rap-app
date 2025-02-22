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
import { getDisplayWord } from './utils/wordUtils';

// Helper function to count total words in a vowel group
const getGroupWordCount = (group, words) => {
  return (words[group] || []).length;
};

// Function to get vocabulary based on selection
const getVocabulary = (vocabulary) => {
  const vocabData = getVocabularyData(vocabulary);
  if (!vocabData) {
    console.warn('Unknown vocabulary:', vocabulary);
    return getVocabularyData('fi_generic_rap');
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
  const isEnglish = vocabulary.startsWith('en_');
  return getVocabularyData(isEnglish ? 'en_full_dict' : 'fi_full_dict');
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
  const wordsCopy = [...words];
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
  
  return shuffled;
};

// Function to get a list of words from a vocabulary
export const generateWordList = async (options = {}) => {
  const {
    minWordsInGroup = 1,
    vocabulary = 'fi_generic_rap',
    includeRhymes = false,
    rhymesPerWord = 5,
    themedRhymesPerWord = 5,
    shouldSpreadOut = true
  } = options;

  const words = getVocabulary(vocabulary);
  const fullDict = includeRhymes ? getFullDictionary(vocabulary) : null;
  
  // Create appropriate rhyme handler based on language
  const isEnglish = vocabulary.startsWith('en_');
  const rhymeHandler = isEnglish ? new EnglishRhymeHandler() : new FinnishRhymeHandler();
  
  // Get all groups that have enough words and sort them
  const groups = Object.keys(words)
    .filter(group => getGroupWordCount(group, words) >= minWordsInGroup)
    .sort();

  if (groups.length === 0) {
    console.warn('No groups with enough words found');
    return [];
  }

  const result = [];

  // Get all words from each group
  groups.forEach(group => {
    const groupWords = words[group] || [];
    
    // Sort words alphabetically within each group
    const sortedWords = [...groupWords].sort((a, b) => {
      const normalizedA = rhymeHandler.normalizeWord(a);
      const normalizedB = rhymeHandler.normalizeWord(b);
      return normalizedA.localeCompare(normalizedB);
    });
    
    sortedWords.forEach(rawWord => {
      const entry = {
        word: getDisplayWord(rawWord),
        phonetic: rhymeHandler.normalizeWord(rawWord),
        group
      };

      // If rhyming words are requested
      if (includeRhymes) {
        // First, find direct themed rhymes
        const themedRhymes = rhymeHandler.findRhymingWords(rawWord, group, words, themedRhymesPerWord, false);
        
        if (themedRhymes.length > 0) {
          entry.themed_rhymes = themedRhymes.map(rhyme => ({
            ...rhyme,
            isSlant: !rhymeHandler.areExactRhymeGroups(rhyme.group, group)
          }));
        }

        // Then find additional rhymes from the full dictionary
        if (fullDict) {
          const dictionaryRhymes = rhymeHandler.findRhymingWords(rawWord, group, fullDict, rhymesPerWord, true)
            .filter(rhyme => 
              !entry.themed_rhymes?.some(themed => 
                rhymeHandler.normalizeWord(themed.word) === rhymeHandler.normalizeWord(rhyme.word)
              )
            )
            .map(rhyme => ({
              ...rhyme,
              isSlant: !rhymeHandler.areExactRhymeGroups(rhyme.group, group)
            }));

          if (dictionaryRhymes.length > 0) {
            entry.rhymes = dictionaryRhymes;
          }
        }
      }

      result.push(entry);
    });
  });

  // Spread out words if requested
  return shouldSpreadOut ? spreadOutWords(result) : result;
}; 