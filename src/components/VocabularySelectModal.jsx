import React from 'react';
import { useTranslation } from '../services/TranslationContext';
import '../styles/VocabularySelectModal.css';

const VocabularySelectModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentVocabularyId,
  vocabularies,
  language
}) => {
  const { translate } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="vocabulary-modal-overlay" onClick={onClose}>
      <div className="vocabulary-modal-content" onClick={e => e.stopPropagation()}>
        <div className="vocabulary-modal-header">
          <h2>{translate('vocabulary.modal.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label={translate('common.close')}>×</button>
        </div>

        <div className="vocabulary-list">
          {vocabularies.map((vocab) => (
            <div
              key={vocab.id}
              className={`vocabulary-item ${vocab.id === currentVocabularyId ? 'selected' : ''}`}
              onClick={() => onSelect(vocab.id)}
            >
              <div className="vocabulary-icon-container">
                <span className="vocabulary-icon">{vocab.icon}</span>
              </div>
              <div className="vocabulary-info">
                <span className="vocabulary-name">{vocab.name}</span>
                <span className="vocabulary-description">{vocab.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VocabularySelectModal; 