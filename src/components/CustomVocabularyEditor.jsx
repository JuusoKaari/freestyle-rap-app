import React, { useState, useEffect } from 'react';
import { useTranslation } from '../services/TranslationContext';
import { createCustomVocabulary } from '../utils/wordProcessor';
import StorageService from '../services/StorageService.js';
import { showUserError } from '../services/ErrorService.js';
import '../styles/CustomVocabularyEditor.css';

const CustomVocabularyEditor = ({ isOpen, onClose, onSave, vocabulary }) => {
  const [wordList, setWordList] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { translate } = useTranslation();

  // Load vocabulary data when editing
  useEffect(() => {
    if (vocabulary) {
      setName(vocabulary.name);
      // Convert the vocabulary data back to a word list
      const words = vocabulary.data.flatMap(pattern => 
        pattern.words.map(w => w.word)
      );
      setWordList(words.join('\n'));
    } else {
      setName('');
      setWordList('');
    }
  }, [vocabulary]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsProcessing(true);
    try {
      // Split the text into words and filter out empty lines
      const words = wordList
        .split('\n')
        .map(word => word.trim())
        .filter(word => word.length > 0);

      if (words.length === 0) {
        showUserError(translate('vocabulary.editor.no_words'));
        setIsProcessing(false);
        return;
      }

      // Get existing vocabularies
      const savedVocabularies = StorageService.get('customVocabularies', []);
      
      // Create new vocabulary object
      const newVocabulary = createCustomVocabulary(words, name || undefined);

      if (vocabulary) {
        // If editing, keep the same ID
        newVocabulary.id = vocabulary.id;
        // Update existing vocabulary
        const updatedVocabularies = savedVocabularies.map(v => 
          v.id === vocabulary.id ? newVocabulary : v
        );
        StorageService.set('customVocabularies', updatedVocabularies);
      } else {
        // Add new vocabulary
        savedVocabularies.push(newVocabulary);
        StorageService.set('customVocabularies', savedVocabularies);
      }

      // Call the onSave callback with the new/updated vocabulary
      onSave(newVocabulary);
      onClose();
    } catch (error) {
      console.error('Error processing word list:', error);
      showUserError(translate('vocabulary.editor.error'), error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="vocabulary-modal-overlay" onClick={onClose}>
      <div className="vocabulary-modal-content custom-vocabulary-editor" onClick={e => e.stopPropagation()}>
        <div className="vocabulary-modal-header">
          <h2>
            {vocabulary 
              ? translate('vocabulary.editor.title_edit') 
              : translate('vocabulary.editor.title_create')}
          </h2>
          <button className="close-button" onClick={onClose} aria-label={translate('common.close')}>×</button>
        </div>

        <div className="editor-content">
          <div className="name-input-container">
            <label htmlFor="vocabulary-name">{translate('vocabulary.editor.name_label')}</label>
            <input
              id="vocabulary-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={translate('vocabulary.editor.name_placeholder')}
            />
          </div>

          <div className="word-list-container">
            <label htmlFor="word-list">{translate('vocabulary.editor.instructions')}</label>
            <textarea
              id="word-list"
              value={wordList}
              onChange={(e) => setWordList(e.target.value)}
              placeholder={translate('vocabulary.editor.placeholder')}
              rows={10}
            />
          </div>

          <div className="editor-controls">
            <button 
              className="save-button" 
              onClick={handleSave}
              disabled={isProcessing || !wordList.trim()}
            >
              {isProcessing ? translate('common.processing') : translate('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomVocabularyEditor; 