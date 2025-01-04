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
 * - Vocabulary metadata (name, description, difficulty)
 * - Word count tracking
 * - File path resolution
 */

import FI_genericVocab from './FI_generic_rap.js';
import FI_animalVocab from './FI_elaimet.js';
import EN_genericVocab from './EN_generic_rap.js';
import EN_animalVocab from './EN_animals.js';
import FI_tiedeVocab from './FI_tiede.js';
import FI_ostoslistaVocab from './FI_ostoslista.js';
import FI_autotVocab from './FI_autot.js';
import FI_numerotVocab from './FI_numerot.js';

// Helper function to count total words in a vocabulary
const countWords = (vocab) => {
  return Object.values(vocab).reduce((total, words) => total + words.length, 0);
};

const vocabularyConfigs = {
  fi: [
    {
      id: 'fi_generic_rap',
      name: 'RAP - sanasto',
      description: 'Yleissanasto räppäämiseen',
      difficulty: 'medium',
      icon: '🎤',
      file: 'FI_generic_rap.js',
      wordCount: countWords(FI_genericVocab)
    },
    {
      id: 'fi_elaimet',
      name: 'Eläimet',
      description: 'Eläinaiheinen sanasto',
      difficulty: 'medium',
      icon: '🦁',
      file: 'FI_elaimet.js',
      wordCount: countWords(FI_animalVocab)
    },
    {
      id: 'fi_tiede',
      name: 'Tiede',
      description: 'Tieteeseen liittyvä sanasto',
      difficulty: 'hard',
      icon: '🔬',
      file: 'FI_tiede.js',
      wordCount: countWords(FI_tiedeVocab)
    },
    {
      id: 'fi_ostoslista',
      name: 'Kauppalista',
      description: 'Ruokakauppaan liittyvä sanasto',
      difficulty: 'easy',
      icon: '🛒',
      file: 'FI_ostoslista.js',
      wordCount: countWords(FI_ostoslistaVocab)
    },
    {
      id: 'fi_autot',
      name: 'Autot',
      description: 'Autoihin liittyvä sanasto',
      difficulty: 'medium',
      icon: '🚗',
      file: 'FI_autot.js',
      wordCount: countWords(FI_autotVocab)
    },
    {
      id: 'fi_numerot',
      name: 'Numerot',
      description: 'Numerosanat ja lukusanat',
      difficulty: 'medium',
      icon: '🔢',
      file: 'FI_numerot.js',
      wordCount: countWords(FI_numerotVocab)
    }
  ],
  en: [
    {
      id: 'en_generic_rap',
      name: 'Generic Rap',
      description: 'General vocabulary for rapping',
      difficulty: 'medium',
      icon: '🎤',
      file: 'EN_generic_rap.js',
      wordCount: countWords(EN_genericVocab)
    },
    {
      id: 'en_animals',
      name: 'Animals',
      description: 'Animal-themed vocabulary',
      difficulty: 'medium',
      icon: '🦁',
      file: 'EN_animals.js',
      wordCount: countWords(EN_animalVocab)
    }
  ]
};

// Helper function to get vocabulary file path
export const getVocabularyPath = (vocabId) => {
  const language = vocabId.startsWith('fi_') ? 'fi' : 'en';
  const vocab = vocabularyConfigs[language].find(v => v.id === vocabId);
  return vocab ? `vocabulary/${vocab.file}` : null;
};

// Export vocabularies based on language
export const getVocabularies = (language) => {
  if (!language || !vocabularyConfigs[language]) {
    return [];
  }
  return vocabularyConfigs[language];
}; 