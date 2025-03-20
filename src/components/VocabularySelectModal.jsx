import React, { useState, useEffect } from 'react';
import { useTranslation } from '../services/TranslationContext';
import CustomVocabularyEditor from './CustomVocabularyEditor';
import { getVocabularies, getVocabularyData } from '../data/vocabulary/vocabularyConfig';
import '../styles/VocabularySelectModal.css';

const VocabularySelectModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentVocabularyId,
  vocabularies: initialVocabularies,
  language,
  syllableRange: initialSyllableRange,
  onSyllableRangeChange
}) => {
  const { translate } = useTranslation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVocabulary, setEditingVocabulary] = useState(null);
  const [vocabularies, setVocabularies] = useState(initialVocabularies);
  const [syllableRange, setSyllableRange] = useState(initialSyllableRange || { min: 2, max: 3 });
  const [filteredStats, setFilteredStats] = useState(null);

  // Update syllable range in parent when it changes
  useEffect(() => {
    onSyllableRangeChange?.(syllableRange);
  }, [syllableRange, onSyllableRangeChange]);

  // Update vocabularies when language changes or modal is opened
  useEffect(() => {
    setVocabularies(getVocabularies(language));
  }, [language, isOpen]);

  // Calculate filtered word stats when syllable range or vocabulary changes
  useEffect(() => {
    if (currentVocabularyId) {
      const vocabData = getVocabularyData(currentVocabularyId);
      if (vocabData) {
        let totalWords = 0;
        let filteredWords = 0;

        // Handle both old (object) and new (array) formats
        if (Array.isArray(vocabData)) {
          // New format (custom vocabularies)
          vocabData.forEach(({ pattern, words }) => {
            const syllableCount = pattern.length;
            const wordCount = words.length;
            totalWords += wordCount;
            
            if (syllableCount >= syllableRange.min && syllableCount <= syllableRange.max) {
              filteredWords += wordCount;
            }
          });
        } else {
          // Old format (built-in vocabularies)
          Object.entries(vocabData).forEach(([pattern, words]) => {
            const syllableCount = pattern.split('-').length;
            const wordCount = words.length;
            totalWords += wordCount;
            
            if (syllableCount >= syllableRange.min && syllableCount <= syllableRange.max) {
              filteredWords += wordCount;
            }
          });
        }

        setFilteredStats({ filtered: filteredWords, total: totalWords });
      }
    }
  }, [currentVocabularyId, syllableRange]);

  if (!isOpen) return null;

  const handleCustomVocabularySave = (vocabulary) => {
    setIsEditorOpen(false);
    setEditingVocabulary(null);
    setVocabularies(getVocabularies(language));
    onSelect(vocabulary.id);
  };

  const handleEdit = (vocab, e) => {
    e.stopPropagation();
    setEditingVocabulary(vocab);
    setIsEditorOpen(true);
  };

  const handleDelete = (vocab, e) => {
    e.stopPropagation();
    if (window.confirm(translate('vocabulary.modal.confirm_delete'))) {
      try {
        const savedVocabularies = JSON.parse(localStorage.getItem('customVocabularies') || '[]');
        const updatedVocabularies = savedVocabularies.filter(v => v.id !== vocab.id);
        localStorage.setItem('customVocabularies', JSON.stringify(updatedVocabularies));
        setVocabularies(getVocabularies(language));
        
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

  const handleVocabularySelect = (vocabId) => {
    onSelect(vocabId);
    // Do not close the modal
  };

  return (
    <div className="vocabulary-modal-overlay" onClick={onClose}>
      <div className="vocabulary-modal-content" onClick={e => e.stopPropagation()}>
        <div className="vocabulary-modal-header">
          <h2>{translate('vocabulary.modal.title')}</h2>
          <button className="close-button" onClick={onClose} aria-label={translate('common.close')}>×</button>
        </div>

        {/* Syllable filter controls */}
        <div className="vocabulary-filter-section">
          <div className="filter-header">
            <span className="filter-title">{translate('vocabulary.filter.syllable_count')}</span>
            {filteredStats && (
              <span className="filter-stats">
                {translate('vocabulary.filter.words_selected').replace('{0}', filteredStats.filtered).replace('{1}', filteredStats.total)}
              </span>
            )}
          </div>
          <div className="syllable-range-controls">
            <input
              type="range"
              min="1"
              max="6"
              value={syllableRange.min}
              className={syllableRange.min === syllableRange.max ? 'equal-values min' : ''}
              onChange={(e) => setSyllableRange(prev => ({
                ...prev,
                min: Math.min(parseInt(e.target.value), prev.max)
              }))}
            />
            <div className="range-values">
              <span>{syllableRange.min}</span>
              <span>{translate('vocabulary.filter.to')}</span>
              <span>{syllableRange.max}</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={syllableRange.max}
              className={syllableRange.min === syllableRange.max ? 'equal-values max' : ''}
              onChange={(e) => setSyllableRange(prev => ({
                ...prev,
                max: Math.max(parseInt(e.target.value), prev.min)
              }))}
            />
          </div>
        </div>

        <div className="vocabulary-list">
          {vocabularies.map((vocab) => (
            <div
              key={vocab.id}
              className={`vocabulary-item ${vocab.id === currentVocabularyId ? 'selected' : ''}`}
              onClick={() => handleVocabularySelect(vocab.id)}
            >
              <div className="vocabulary-icon-container">
                <span className="vocabulary-icon">{vocab.icon}</span>
              </div>
              <div className="vocabulary-info">
                <span className="vocabulary-modal-name">{vocab.name}</span>
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

        {/* Moved create button to bottom */}
        {language === 'fi' && (
          <div className="vocabulary-modal-footer">
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