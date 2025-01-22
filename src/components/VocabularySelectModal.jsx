import React, { useState, useEffect } from 'react';
import { useTranslation } from '../services/TranslationContext';
import CustomVocabularyEditor from './CustomVocabularyEditor';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';
import '../styles/VocabularySelectModal.css';

const VocabularySelectModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentVocabularyId,
  vocabularies: initialVocabularies,
  language
}) => {
  const { translate } = useTranslation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState(null);
  const [vocabularies, setVocabularies] = useState(initialVocabularies);

  // Update vocabularies when language changes or modal is opened
  useEffect(() => {
    setVocabularies(getVocabularies(language));
  }, [language, isOpen]);

  if (!isOpen) return null;

  const handleCustomVocabularySave = (vocabulary) => {
    // Close the editor and select the new vocabulary
    setIsEditorOpen(false);
    setEditingVocabulary(null);
    // Update vocabularies list
    setVocabularies(getVocabularies(language));
    onSelect(vocabulary.id);
  };

  const handleEdit = (vocab, e) => {
    e.stopPropagation(); // Prevent selection of vocabulary
    setEditingVocabulary(vocab);
    setIsEditorOpen(true);
  };

  const handleDelete = (vocab, e) => {
    e.stopPropagation(); // Prevent selection of vocabulary
    if (window.confirm(translate('vocabulary.modal.confirm_delete'))) {
      try {
        const savedVocabularies = JSON.parse(localStorage.getItem('customVocabularies') || '[]');
        const updatedVocabularies = savedVocabularies.filter(v => v.id !== vocab.id);
        localStorage.setItem('customVocabularies', JSON.stringify(updatedVocabularies));
        
        // Update the vocabularies state to trigger re-render
        setVocabularies(getVocabularies(language));
        
        // If the deleted vocabulary was selected, select the first available one
        if (currentVocabularyId === vocab.id && vocabularies.length > 1) {
          const firstVocab = vocabularies.find(v => v.id !== vocab.id);
          if (firstVocab) {
            onSelect(firstVocab.id);
          }
        }
      } catch (error) {
        console.error('Error deleting vocabulary:', error);
        alert(translate('vocabulary.modal.delete_error'));
      }
    }
  };

  const isCustomVocabulary = (vocab) => vocab.id.startsWith('custom-vocabulary-');

  return (
    <div className="vocabulary-modal-overlay" onClick={onClose}>
      <div className="vocabulary-modal-content" onClick={e => e.stopPropagation()}>
        <div className="vocabulary-modal-header">
          <h2>{translate('vocabulary.modal.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label={translate('common.close')}>×</button>
        </div>

        {language === 'fi' && (
          <div className="vocabulary-modal-actions">
            <button 
              className="create-vocabulary-button"
              onClick={() => {
                setEditingVocabulary(null);
                setIsEditorOpen(true);
              }}
            >
              {translate('vocabulary.modal.create_custom')}
            </button>
          </div>
        )}

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
              {isCustomVocabulary(vocab) && (
                <div className="vocabulary-actions">
                  <button
                    className="edit-button"
                    onClick={(e) => handleEdit(vocab, e)}
                    aria-label={translate('common.edit')}
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-button"
                    onClick={(e) => handleDelete(vocab, e)}
                    aria-label={translate('common.delete')}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <CustomVocabularyEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingVocabulary(null);
          }}
          onSave={handleCustomVocabularySave}
          vocabulary={editingVocabulary}
        />
      </div>
    </div>
  );
};

export default VocabularySelectModal; 