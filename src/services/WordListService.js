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

// Function to find slant rhymes by looking at groups with matching end patterns
const findSlantRhymes = (word, group, wordList, isFullDict = false) => {
  // Get the vowel pattern ending
  const groupParts = group.split('-');
  const endPattern = groupParts.slice(-2).join('-'); // Take last two parts

  // Find all groups that end with the same pattern
  const slantGroups = Object.keys(wordList).filter(otherGroup => {
    if (otherGroup === group) return false; // Skip the original group
    return otherGroup.endsWith(endPattern);
  });

  // Get words from all matching groups
  return slantGroups.flatMap(slantGroup => 
    (wordList[slantGroup] || []).filter(rhyme => {
      // Don't include the original word
      if (normalizeWord(rhyme) === normalizeWord(word)) return false;

      // For themed vocabulary, apply prefix filter
      if (!isFullDict) {
        const wordNormalized = normalizeWord(word);
        const rhymeNormalized = normalizeWord(rhyme);
        return commonPrefixLength(rhymeNormalized, wordNormalized) < 4;
      }

      return true;
    }).map(rhyme => ({
      word: rhyme,
      group: slantGroup
    }))
  );
};

// Function to check if two groups are exact rhyme groups
export const areExactRhymeGroups = (group1, group2) => {
  const parts1 = group1.split('-');
  const parts2 = group2.split('-');
  
  // Must have same number of parts
  if (parts1.length !== parts2.length) return false;
  
  // All parts must match
  return parts1.every((part, index) => part === parts2[index]);
};

// Helper function to randomly select N items from an array
const getRandomItems = (array, n) => {
  // Create a copy of the array to avoid modifying the original
  const shuffled = [...array];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, n);
};

// Function to find rhyming words from a word list
const findRhymingWords = (word, group, wordList, maxResults = 5, isFullDict = false) => {
  const rhymingWords = wordList[group] || [];
  
  // First get exact rhymes from the same vowel group
  const exactRhymes = rhymingWords
    .filter(rhyme => {
      // Don't include the original word - compare normalized versions
      if (normalizeWord(rhyme) === normalizeWord(word)) return false;
      
      // For themed vocabulary, filter out words that share too many starting letters
      if (!isFullDict) {
        const baseWord = normalizeWord(word);
        const rhymeNormalized = normalizeWord(rhyme);
        const commonPrefix = baseWord.split('').reduce((count, char, i) => {
          return rhymeNormalized[i] === char ? count + 1 : count;
        }, 0);
        return commonPrefix < 4;
      }
      
      return true;
    })
    .map(rhyme => ({
      word: rhyme,
      group: group
    }));

  // If we have enough exact rhymes, return random selection
  if (exactRhymes.length >= maxResults) {
    return getRandomItems(exactRhymes, maxResults);
  }

  // If we need more rhymes, look for slant rhymes to fill remaining slots
  const remainingSlots = maxResults - exactRhymes.length;
  const allSlantRhymes = findSlantRhymes(word, group, wordList, isFullDict);
  const selectedSlantRhymes = getRandomItems(allSlantRhymes, remainingSlots);

  // Return exact rhymes first, then fill with slant rhymes
  return [...exactRhymes, ...selectedSlantRhymes];
};

// Helper function to count common prefix length
const commonPrefixLength = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
};

// Helper function to split word into display and phonetic versions (display;phonetic format)
const splitWord = (word) => {
  const parts = word.split(';');
  return {
    display: parts[0],
    phonetic: parts[1] || parts[0] // If no phonetic version, use display
  };
};

// Function to normalize a word for sorting (remove dashes and underscores)
const normalizeWord = (word) => {
  // If word contains a semicolon, use the phonetic part
  const { phonetic } = splitWord(word);
  return phonetic.replace(/-/g, '').replace(/_/g, ' ').toLowerCase();
};

// Function to get display version of a word
const getDisplayWord = (word) => {
  const { display } = splitWord(word);
  return display.replace(/-/g, '').replace(/_/g, ' ');
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
    // Shuffle the order randomly first
    possibleWords.sort(() => Math.random() - 0.5);
    
    let selectedWord = null;
    
    for (let candidate of possibleWords) {
      // Check if this candidate maintains enough distance from recent words
      if (shuffled.slice(-lookbackWindow).every(prev => 
        Math.abs(wordsCopy.indexOf(candidate) - wordsCopy.indexOf(prev)) > lookbackWindow)) {
        selectedWord = candidate;
        break;
      }
    }

    // If no valid candidate is found, relax the constraint and pick any remaining word
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
    shouldSpreadOut = true // New option to control word spreading
  } = options;

  const words = getVocabulary(vocabulary);
  const fullDict = includeRhymes ? getFullDictionary(vocabulary) : null;
  
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
    
    // Sort words alphabetically within each group, ignoring dashes and underscores
    const sortedWords = [...groupWords].sort((a, b) => {
      const normalizedA = normalizeWord(a);
      const normalizedB = normalizeWord(b);
      return normalizedA.localeCompare(normalizedB);
    });
    
    sortedWords.forEach(rawWord => {
      // Get display and phonetic versions of word
      const { display, phonetic } = splitWord(rawWord);
      const entry = {
        word: display.replace(/-/g, '').replace(/_/g, ' '),  // Clean display version
        phonetic: phonetic.replace(/-/g, '').replace(/_/g, '').replace(/\s+/g, ''),  // Clean phonetic version
        group
      };

      // If rhyming words are requested
      if (includeRhymes) {
        // First, find direct themed rhymes from the themed vocabulary
        const themedDirectRhymes = findRhymingWords(rawWord, group, words, themedRhymesPerWord, false)
          .filter(rhyme => areExactRhymeGroups(rhyme.group, group));
        
        // Then find themed slant rhymes if we need more
        let themedSlantRhymes = [];
        if (themedDirectRhymes.length < themedRhymesPerWord) {
          const remainingSlots = themedRhymesPerWord - themedDirectRhymes.length;
          themedSlantRhymes = findSlantRhymes(rawWord, group, words, false)
            // Filter out any words that are already in direct rhymes
            .filter(rhyme => !themedDirectRhymes.some(direct => 
              normalizeWord(direct.word) === normalizeWord(rhyme.word)
            ))
            .slice(0, remainingSlots)
            .map(rhyme => ({
              word: getDisplayWord(rhyme.word),
              group: rhyme.group,
              isSlant: true
            }));
        }

        // Combine and sort all themed rhymes
        const allThemedRhymes = [
          ...themedDirectRhymes.map(rhyme => ({
            ...rhyme,
            word: getDisplayWord(rhyme.word),
            isSlant: false
          })),
          ...themedSlantRhymes
        ].sort((a, b) => {
          const normalizedA = normalizeWord(a.word);
          const normalizedB = normalizeWord(b.word);
          return normalizedA.localeCompare(normalizedB);
        });

        if (allThemedRhymes.length > 0) {
          entry.themed_rhymes = allThemedRhymes;
        }

        // Then find additional rhymes from the full dictionary
        if (fullDict) {
          // Get only exact rhymes from the full dictionary
          const exactRhymes = findRhymingWords(rawWord, group, fullDict, rhymesPerWord, true)
            // Filter out any words that are in themed rhymes (both direct and slant)
            .filter(rhyme => 
              areExactRhymeGroups(rhyme.group, group) &&
              !allThemedRhymes.some(themed => 
                normalizeWord(themed.word) === normalizeWord(rhyme.word)
              )
            )
            .map(rhyme => ({
              word: getDisplayWord(rhyme.word),
              group: rhyme.group,
              isSlant: false
            }));

          if (exactRhymes.length > 0) {
            entry.rhymes = exactRhymes;
          }

          // If we need more rhymes, add slant rhymes
          if (exactRhymes.length < rhymesPerWord) {
            const remainingSlots = rhymesPerWord - exactRhymes.length;
            const slantRhymes = findSlantRhymes(rawWord, group, fullDict, true)
              // Filter out any words that are in themed rhymes or exact rhymes
              .filter(rhyme => 
                !areExactRhymeGroups(rhyme.group, group) &&
                !allThemedRhymes.some(themed => 
                  normalizeWord(themed.word) === normalizeWord(rhyme.word)
                ) &&
                !exactRhymes.some(exact => 
                  normalizeWord(exact.word) === normalizeWord(rhyme.word)
                )
              )
              .slice(0, remainingSlots)
              .map(rhyme => ({
                word: getDisplayWord(rhyme.word),
                group: rhyme.group,
                isSlant: true
              }));

            if (slantRhymes.length > 0) {
              entry.rhymes = entry.rhymes ? [...entry.rhymes, ...slantRhymes] : slantRhymes;
            }
          }
        }
      }

      result.push(entry);
    });
  });

  // Spread out words if requested
  return shouldSpreadOut ? spreadOutWords(result) : result;
}; 