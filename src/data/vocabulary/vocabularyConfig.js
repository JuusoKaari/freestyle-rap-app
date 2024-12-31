import genericVocab from './FI_generic_rap.js';
import animalVocab from './FI_elaimet.js';

// Helper function to count total words in a vocabulary
const countWords = (vocab) => {
  return Object.values(vocab).reduce((total, words) => total + words.length, 0);
};

export const vocabularies = [
  {
    id: 'generic_rap',
    name: 'Generic Rap',
    description: 'Yleissanasto räppäämiseen',
    difficulty: 'medium',
    icon: '🎤',
    file: 'FI_generic_rap.js',
    wordCount: countWords(genericVocab)
  },
  {
    id: 'elaimet',
    name: 'Eläimet',
    description: 'Eläinaiheinen sanasto',
    difficulty: 'hard AF',
    icon: '🦁',
    file: 'FI_elaimet.js',
    wordCount: countWords(animalVocab)
  }
];

// Helper function to get vocabulary file path
export const getVocabularyPath = (vocabId) => {
  const vocab = vocabularies.find(v => v.id === vocabId);
  return vocab ? `vocabulary/${vocab.file}` : 'vocabulary/FI_generic_rap.js';
}; 