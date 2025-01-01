import FI_genericVocab from './FI_generic_rap.js';
import FI_animalVocab from './FI_elaimet.js';
import EN_genericVocab from './EN_generic_rap.js';
import EN_animalVocab from './EN_animals.js';

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
      difficulty: 'hard AF',
      icon: '🦁',
      file: 'FI_elaimet.js',
      wordCount: countWords(FI_animalVocab)
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
      difficulty: 'hard AF',
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
  return vocab ? `vocabulary/${vocab.file}` : 'vocabulary/FI_generic_rap.js';
};

// Export vocabularies based on language
export const getVocabularies = (language) => {
  return vocabularyConfigs[language] || vocabularyConfigs.fi;
}; 