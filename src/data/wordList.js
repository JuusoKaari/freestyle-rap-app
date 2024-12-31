// Import the vowel-grouped words
import twoSyllableWords from './2_syllable_words_by_vowels.json';
import threeSyllableWords from './3_syllable_words_by_vowels.json';

// Helper function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to count total words in a vowel group
const getGroupWordCount = (group) => {
  const twoSyllableCount = (twoSyllableWords[group] || []).length;
  const threeSyllableCount = (threeSyllableWords[group] || []).length;
  return twoSyllableCount + threeSyllableCount;
};

// Function to get a list of random words, ensuring equal representation from each vowel group
export const generateWordList = (options = {}) => {
  const {
    count = 100,
    selectedGroups = null,
    minWordsInGroup = 0,
    maxWordsInGroup = Infinity
  } = options;

  // Combine all vowel groups from both files
  const allVowelGroups = [...new Set([
    ...Object.keys(twoSyllableWords),
    ...Object.keys(threeSyllableWords)
  ])];

  // Use selected groups if provided, otherwise use all groups
  const initialGroups = selectedGroups || allVowelGroups;
  
  // Filter groups based on word count
  const groupsToUse = initialGroups.filter(group => {
    const wordCount = getGroupWordCount(group);
    return wordCount >= minWordsInGroup && wordCount <= maxWordsInGroup;
  });

  // If no groups match the criteria, return an empty array
  if (groupsToUse.length === 0) {
    console.warn('No vowel groups match the specified word count criteria');
    return [];
  }

  const words = [];
  for (let i = 0; i < count; i++) {
    // First randomly select a vowel group
    const randomGroup = getRandomItem(groupsToUse);
    
    // Get all words for this group from both files
    const wordsInGroup = [
      ...(twoSyllableWords[randomGroup] || []),
      ...(threeSyllableWords[randomGroup] || [])
    ];

    // Then randomly select a word from that group
    const randomWord = getRandomItem(wordsInGroup);
    // Remove hyphens and add to our list
    words.push(randomWord.replace(/-/g, ''));
  }
  return words;
}; 