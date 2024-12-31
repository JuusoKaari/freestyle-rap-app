// Helper function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to count total words in a vowel group
const getGroupWordCount = (group, words) => {
  return (words[group] || []).length;
};

// Function to get vocabulary module based on selection
const getVocabularyModule = async (vocabulary) => {
  switch (vocabulary) {
    case 'generic_rap':
      return import('./vocabulary/FI_generic_rap.js');
    case 'elaimet':
      return import('./vocabulary/FI_elaimet.js');
    default:
      console.warn('Unknown vocabulary:', vocabulary);
      return import('./vocabulary/FI_generic_rap.js');
  }
};

// Function to get a list of random words, ensuring equal representation from each vowel group
export const generateWordList = async (options = {}) => {
  const {
    count = 100,
    selectedGroups = null,
    minWordsInGroup = 0,
    maxWordsInGroup = Infinity,
    vocabulary = 'generic_rap' // Default to generic vocabulary
  } = options;

  try {
    // Import the vocabulary file
    const module = await getVocabularyModule(vocabulary);
    const words = module.default;

    // Get all vowel groups
    const allVowelGroups = Object.keys(words);

    // Use selected groups if provided, otherwise use all groups
    const initialGroups = selectedGroups || allVowelGroups;
    
    // Filter groups based on word count
    const groupsToUse = initialGroups.filter(group => {
      const wordCount = getGroupWordCount(group, words);
      return wordCount >= minWordsInGroup && wordCount <= maxWordsInGroup;
    });

    // If no groups match the criteria, return an empty array
    if (groupsToUse.length === 0) {
      console.warn('No vowel groups match the specified word count criteria');
      return [];
    }

    const selectedWords = [];
    for (let i = 0; i < count; i++) {
      // First randomly select a vowel group
      const randomGroup = getRandomItem(groupsToUse);
      
      // Get all words for this group
      const wordsInGroup = words[randomGroup] || [];

      // Then randomly select a word from that group
      const randomWord = getRandomItem(wordsInGroup);
      // Remove hyphens and add to our list
      selectedWords.push(randomWord.replace(/-/g, ''));
    }
    return selectedWords;
  } catch (error) {
    console.error('Error loading vocabulary:', error);
    return [];
  }
}; 