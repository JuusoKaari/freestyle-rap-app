import genericVocab from './FI_generic_rap.js';
import animalVocab from './FI_elaimet.js';

// Helper function to count total words in a vocabulary
const countWords = (vocab) => {
  return Object.values(vocab).reduce((total, words) => total + words.length, 0);
};

export const vocabularies = [
  {
    id: 'generic_rap',
    icon: '🎤',
    file: 'FI_generic_rap.js',
    wordCount: countWords(genericVocab),
    translations: {
      en: {
        name: 'Generic Rap',
        description: 'General Finnish vocabulary for rapping',
        difficulty: 'medium'
      },
      fi: {
        name: 'Yleissanasto',
        description: 'Yleissanasto räppäämiseen',
        difficulty: 'medium'
      }
    }
  },
  {
    id: 'elaimet',
    icon: '🦁',
    file: 'FI_elaimet.js',
    wordCount: countWords(animalVocab),
    translations: {
      en: {
        name: 'Animals',
        description: 'Animal-themed Finnish vocabulary',
        difficulty: 'hard AF'
      },
      fi: {
        name: 'Eläimet',
        description: 'Eläinaiheinen sanasto',
        difficulty: 'hard AF'
      }
    }
  }
];

// Helper function to get vocabulary file path
export const getVocabularyPath = (vocabId) => {
  const vocab = vocabularies.find(v => v.id === vocabId);
  return vocab ? `vocabulary/${vocab.file}` : 'vocabulary/FI_generic_rap.js';
}; 