import React, { useState, useEffect } from 'react';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';
import { useTranslation } from '../services/TranslationContext';
import VocabularySelectModal from './VocabularySelectModal';
import { FaDice } from 'react-icons/fa';
import '../styles/VocabularySelector.css';

const VocabularySelector = ({ selectedVocabulary, onVocabularySelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { translate, language } = useTranslation();
  const vocabularies = getVocabularies(language);

  // Find the currently selected vocabulary info
  const selectedVocabInfo = vocabularies.find(vocab => vocab.id === selectedVocabulary);

  // When language changes or if selected vocabulary is not available in current language,
  // select the first vocabulary of the current language
  useEffect(() => {
    if (!selectedVocabInfo && vocabularies.length > 0) {
      const defaultVocab = vocabularies[0];
      onVocabularySelect(defaultVocab.id);
    }
  }, [language, selectedVocabInfo, vocabularies, onVocabularySelect]);

  const handleVocabularySelect = (vocabId) => {
    onVocabularySelect(vocabId);
    setIsModalOpen(false);
  };

  const handleRandomize = () => {
    const availableVocabs = vocabularies.filter(vocab => vocab.id !== selectedVocabulary);
    if (availableVocabs.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableVocabs.length);
      onVocabularySelect(availableVocabs[randomIndex].id);
    }
  };

  // If no vocabularies are available for the current language, show a message
  if (vocabularies.length === 0) {
    return (
      <div className="vocabulary-selector-container">
        <div className="vocabulary-player empty-state">
          <p>{translate('vocabulary.selector.no_vocabularies')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vocabulary-selector-container">
      <div className="vocabulary-player">
        <div className="vocabulary-icon-container">
          {selectedVocabInfo && (
            <span className="vocabulary-icon">{selectedVocabInfo.icon}</span>
          )}
        </div>

        <div className="vocabulary-info">
          <div className="vocabulary-main-info">
            <span className="vocabulary-label">{translate('vocabulary.selector.title')}:</span>
            <span className="vocabulary-name">{selectedVocabInfo?.name}</span>
          </div>
          <div className="vocabulary-details">
            <span className="vocabulary-description">{selectedVocabInfo?.description}</span>
          </div>
        </div>

        <div className="vocabulary-controls">
          <button 
            className="change-vocabulary-button"
            onClick={() => setIsModalOpen(true)}
            aria-label={translate('vocabulary.selector.change')}
          >
            {translate('vocabulary.selector.change')}
          </button>
          <button 
            className="randomize-vocabulary-button"
            onClick={handleRandomize}
            aria-label="Randomize vocabulary"
          >
            <FaDice />
          </button>
        </div>
      </div>

      <VocabularySelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleVocabularySelect}
        currentVocabularyId={selectedVocabulary}
        vocabularies={vocabularies}
        language={language}
      />
    </div>
  );
};

export default VocabularySelector; 