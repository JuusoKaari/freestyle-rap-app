import React from 'react';
import { vocabularies } from '../data/vocabulary/vocabularyConfig';
import { useTranslation } from '../services/TranslationContext';
import '../styles/VocabularySelector.css';

const VocabularySelector = ({ selectedVocabulary, onVocabularySelect }) => {
  const { translate, language } = useTranslation();

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
            <span className="vocabulary-name">{vocab.translations[language].name}</span>
            <span className="vocabulary-description">{vocab.translations[language].description}</span>
            <div className="vocabulary-meta">
              <span className={`vocabulary-difficulty ${vocab.translations[language].difficulty}`}>
                {vocab.translations[language].difficulty}
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