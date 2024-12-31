import React from 'react';
import { vocabularies } from '../data/vocabulary/vocabularyConfig';
import '../styles/VocabularySelector.css';

const VocabularySelector = ({ selectedVocabulary, onVocabularySelect }) => {
  return (
    <div className="vocabulary-selector">
      <h2>Select Vocabulary</h2>
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