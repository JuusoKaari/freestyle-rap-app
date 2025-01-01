// Import vocabularies
import FI_genericVocab from './vocabulary/FI_generic_rap.js';
import FI_animalVocab from './vocabulary/FI_elaimet.js';
import EN_genericVocab from './vocabulary/EN_generic_rap.js';
import EN_animalVocab from './vocabulary/EN_animals.js';

// Helper function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to count total words in a vowel group
const getGroupWordCount = (group, words) => {
  return (words[group] || []).length;
};

// Function to get vocabulary based on selection
const getVocabulary = (vocabulary) => {
  switch (vocabulary) {
    case 'fi_generic_rap':
      return FI_genericVocab;
    case 'fi_elaimet':
      return FI_animalVocab;
    case 'en_generic_rap':
      return EN_genericVocab;
    case 'en_animals':
      return EN_animalVocab;
    default:
      console.warn('Unknown vocabulary:', vocabulary);
      return FI_genericVocab;
  }
};

// Function to get a list of random words, ensuring equal representation from each vowel group
export const generateWordList = async (options = {}) => {
  const {
    count = 100,
    minWordsInGroup = 3,
    vocabulary = 'fi_generic_rap'
  } = options;

  const words = getVocabulary(vocabulary);
  const groups = Object.keys(words).filter(group => 
    getGroupWordCount(group, words) >= minWordsInGroup
  );

  if (groups.length === 0) {
    console.warn('No groups with enough words found');
    return [];
  }

  const wordsPerGroup = Math.ceil(count / groups.length);
  const result = [];

  groups.forEach(group => {
    const groupWords = words[group] || [];
    for (let i = 0; i < wordsPerGroup && result.length < count; i++) {
      const rawWord = getRandomItem(groupWords);
      if (rawWord) {
        // Remove dashes from all words
        const word = rawWord.replace(/-/g, '');
        result.push({
          word,
          group
        });
      }
    }
  });

  return result;
}; 