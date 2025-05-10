/**
 * Vocabulary Configuration Module
 * ============================
 * 
 * Configuration and management system for all vocabulary sets in the application.
 * Handles vocabulary metadata, file paths, and language-specific collections.
 * 
 * Features:
 * - Language-specific vocabulary sets (FI/EN)
 * - Themed collections (rap, science, shopping, etc.)
 * - Vocabulary metadata (name, description)
 * - Word count tracking
 * - File path resolution
 * - Custom vocabulary support
 */

import FI_genericVocab from './FI_generic_rap.js';
import FI_animalVocab from './FI_elaimet.js';
import EN_genericVocab from './EN_generic_rap.js';
import EN_animalVocab from './EN_animals.js';
import FI_tiedeVocab from './FI_tiede.js';
import FI_ostoslistaVocab from './FI_ostoslista.js';
import FI_autotVocab from './FI_autot.js';
import FI_numerotVocab from './FI_numerot.js';
import FI_vaatteetVocab from './FI_vaatteet_ja_asusteet.js';
import FI_lovebattleVocab from './FI_lovebattle_2025.js';
import EN_fullDict from './EN__full_dict.js';
import FI_fullDict from './FI__full_dict.js';
import EN_scienceVocab from './EN_science.js';
import EN_shoppingVocab from './EN_shopping_list.js';
import EN_carsVocab from './EN_cars.js';
import EN_numbersVocab from './EN_numbers.js';
import EN_clothesVocab from './EN_clothes_and_accessories.js';

// Helper function to count total words in a vocabulary
const countWords = (vocab) => {
  if (Array.isArray(vocab)) {
    // For custom vocabularies that use the new format
    return vocab.reduce((total, pattern) => total + pattern.words.length, 0);
  }
  // For built-in vocabularies that use the old format
  return Object.values(vocab).reduce((total, words) => total + words.length, 0);
};

// Hidden vocabularies (not shown in UI but used for rhyme hints)
const hiddenVocabularies = {
  'en_full_dict': {
    id: 'en_full_dict',
    data: EN_fullDict
  },
  'fi_full_dict': {
    id: 'fi_full_dict',
    data: FI_fullDict
  }
};

const vocabularyConfigs = {
  fi: [
    {
      id: 'fi_generic_rap',
      name: 'RAP',
      description: 'Yleissanasto räppäämiseen',
      icon: '🎤',
      file: 'FI_generic_rap.js',
      wordCount: countWords(FI_genericVocab),
      data: FI_genericVocab
    },
    {
      id: 'fi_lovebattle_2025',
      name: 'LoveBattle 2025',
      description: 'LoveBattle -sanasto',
      icon: '❤️',
      file: 'FI_lovebattle_2025.js',
      wordCount: countWords(FI_lovebattleVocab),
      data: FI_lovebattleVocab,
      link: 'https://www.instagram.com/lovebattlehelsinki/',
      linkText: 'Instagram Linkki'
    },
    {
      id: 'fi_elaimet',
      name: 'Eläimet',
      description: 'Eläinaiheinen sanasto',
      icon: '🦁',
      file: 'FI_elaimet.js',
      wordCount: countWords(FI_animalVocab),
      data: FI_animalVocab
    },
    {
      id: 'fi_tiede',
      name: 'Tiede',
      description: 'Tieteeseen liittyvä sanasto',
      icon: '🔬',
      file: 'FI_tiede.js',
      wordCount: countWords(FI_tiedeVocab),
      data: FI_tiedeVocab
    },
    {
      id: 'fi_ostoslista',
      name: 'Kauppalista',
      description: 'Ruokakauppaan liittyvä sanasto',
      icon: '🛒',
      file: 'FI_ostoslista.js',
      wordCount: countWords(FI_ostoslistaVocab),
      data: FI_ostoslistaVocab
    },
    {
      id: 'fi_autot',
      name: 'Autot',
      description: 'Autoihin liittyvä sanasto',
      icon: '🚗',
      file: 'FI_autot.js',
      wordCount: countWords(FI_autotVocab),
      data: FI_autotVocab
    },
    {
      id: 'fi_numerot',
      name: 'Numerot',
      description: 'Numerosanat ja lukusanat',
      icon: '🔢',
      file: 'FI_numerot.js',
      wordCount: countWords(FI_numerotVocab),
      data: FI_numerotVocab
    },
    {
      id: 'fi_vaatteet_ja_asusteet',
      name: 'Vaatteet',
      description: 'Vaatteisiin liittyvä sanasto',
      icon: '👕',
      file: 'FI_vaatteet_ja_asusteet.js',
      wordCount: countWords(FI_vaatteetVocab),
      data: FI_vaatteetVocab
    }
  ],
  en: [
    {
      id: 'en_generic_rap',
      name: 'Generic Rap',
      description: 'General vocabulary for rapping',
      icon: '🎤',
      file: 'EN_generic_rap.js',
      wordCount: countWords(EN_genericVocab),
      data: EN_genericVocab
    },
    {
      id: 'en_animals',
      name: 'Animals',
      description: 'Animal-themed vocabulary',
      icon: '🦁',
      file: 'EN_animals.js',
      wordCount: countWords(EN_animalVocab),
      data: EN_animalVocab
    },
    {
      id: 'en_science',
      name: 'Science',
      description: 'Science-related vocabulary',
      icon: '🔬',
      file: 'EN_science.js',
      wordCount: countWords(EN_scienceVocab),
      data: EN_scienceVocab
    },
    {
      id: 'en_shopping_list',
      name: 'Shopping List',
      description: 'Grocery and shopping related vocabulary',
      icon: '🛒',
      file: 'EN_shopping_list.js',
      wordCount: countWords(EN_shoppingVocab),
      data: EN_shoppingVocab
    },
    {
      id: 'en_cars',
      name: 'Cars',
      description: 'Car-related vocabulary',
      icon: '🚗',
      file: 'EN_cars.js',
      wordCount: countWords(EN_carsVocab),
      data: EN_carsVocab
    },
    {
      id: 'en_numbers',
      name: 'Numbers',
      description: 'Number words and numerals',
      icon: '🔢',
      file: 'EN_numbers.js',
      wordCount: countWords(EN_numbersVocab),
      data: EN_numbersVocab
    },
    {
      id: 'en_clothes_and_accessories',
      name: 'Clothes',
      description: 'Clothing and accessories vocabulary',
      icon: '👕',
      file: 'EN_clothes_and_accessories.js',
      wordCount: countWords(EN_clothesVocab),
      data: EN_clothesVocab
    }
  ]
};

// Helper function to get vocabulary data
export const getVocabularyData = (vocabId, language = 'fi') => {
  // Handle "all" vocabularies case
  if (vocabId === 'all') {
    // Only get built-in vocabularies for 'all' option
    const allVocabs = vocabularyConfigs[language];
    
    // Combine all vocabulary data
    const combinedData = {};
    allVocabs.forEach(vocab => {
      const vocabData = vocab.data;
      if (vocabData) {
        if (Array.isArray(vocabData)) {
          // Handle new format (custom vocabularies)
          vocabData.forEach(({ pattern, words }) => {
            const patternKey = pattern.join('-');
            if (!combinedData[patternKey]) {
              combinedData[patternKey] = [];
            }
            combinedData[patternKey].push(...words.map(w => w.word));
          });
        } else {
          // Handle old format (built-in vocabularies)
          Object.entries(vocabData).forEach(([pattern, words]) => {
            if (!combinedData[pattern]) {
              combinedData[pattern] = [];
            }
            combinedData[pattern].push(...words);
          });
        }
      }
    });
    return combinedData;
  }

  // First check hidden vocabularies (full dictionaries)
  if (hiddenVocabularies[vocabId]) {
    return hiddenVocabularies[vocabId].data;
  }

  // Then check built-in vocabularies
  const vocabLanguage = vocabId.startsWith('fi_') ? 'fi' : 'en';
  const builtInVocab = vocabularyConfigs[vocabLanguage].find(v => v.id === vocabId);
  if (builtInVocab) {
    return builtInVocab.data;
  }

  // Finally check custom vocabularies
  if (vocabId.startsWith('custom-vocabulary-')) {
    try {
      const customVocabs = JSON.parse(localStorage.getItem('customVocabularies') || '[]');
      const customVocab = customVocabs.find(v => v.id === vocabId);
      if (customVocab) {
        return customVocab.data;
      }
    } catch (error) {
      console.error('Error loading custom vocabulary:', error);
    }
  }

  return null;
};

// Helper function to get vocabulary file path (for backward compatibility)
export const getVocabularyPath = (vocabId) => {
  const language = vocabId.startsWith('fi_') ? 'fi' : 'en';
  const vocab = vocabularyConfigs[language].find(v => v.id === vocabId);
  return vocab ? `vocabulary/${vocab.file}` : null;
};

// Get custom vocabularies from local storage
export const getCustomVocabularies = () => {
  try {
    return JSON.parse(localStorage.getItem('customVocabularies') || '[]');
  } catch (error) {
    console.error('Error loading custom vocabularies:', error);
    return [];
  }
};

// Export vocabularies based on language
export const getVocabularies = (language) => {
  if (!language || !vocabularyConfigs[language]) {
    return [];
  }

  // Get built-in vocabularies for the language
  const builtInVocabs = vocabularyConfigs[language];

  // Get custom vocabularies if the language is Finnish
  const customVocabs = language === 'fi' ? getCustomVocabularies() : [];

  return [...builtInVocabs, ...customVocabs];
}; 