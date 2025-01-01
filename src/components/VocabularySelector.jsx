import React from 'react';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';
import { useTranslation } from '../services/TranslationContext';
import '../styles/VocabularySelector.css';

const VocabularySelector = ({ selectedVocabulary, onVocabularySelect }) => {
  const { translate, language } = useTranslation();
  const vocabularies = getVocabularies(language);

  // When language changes, select the corresponding vocabulary in the new language
  React.useEffect(() => {
    if (selectedVocabulary) {
      const currentType = selectedVocabulary.includes('generic') ? 'generic' : 'animals';
      const newVocabId = language === 'fi' ? 
        (currentType === 'generic' ? 'fi_generic_rap' : 'fi_elaimet') :
        (currentType === 'generic' ? 'en_generic_rap' : 'en_animals');
      
      if (newVocabId !== selectedVocabulary) {
        onVocabularySelect(newVocabId);
      }
    }
  }, [language, selectedVocabulary, onVocabularySelect]);

  return (
    <div className="vocabulary-selector">
      <h2>{translate('vocabulary.selector.title')}</h2>
      <div className="vocabulary-grid">
        {vocabularies.map((vocab) => (
          <button
            key={vocab.id}
            className={`vocabulary-item ${selectedVocabulary === vocab.id ? 'selected' : ''}`}
            onClick={() => onVocabularySelect(vocab.id)}
          >
            <span className="vocabulary-icon">{vocab.icon}</span>
            <span className="vocabulary-name">{vocab.name}</span>
            <span className="vocabulary-description">{vocab.description}</span>
            <div className="vocabulary-meta">
              <span className={`vocabulary-difficulty ${vocab.difficulty}`}>
                {vocab.difficulty}
              </span>
              <span className="vocabulary-word-count">
                {vocab.wordCount.toLocaleString()} words
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VocabularySelector; 