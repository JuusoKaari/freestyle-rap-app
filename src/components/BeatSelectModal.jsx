import React from 'react';
import { beats } from '../data/beats';
import { useTranslation } from '../services/TranslationContext';
import '../styles/BeatSelectModal.css';

const BeatSelectModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  currentBeatId,
  onPreviewPlay,
  previewingBeatId,
  isLoading
}) => {
  const { translate } = useTranslation();
  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{translate('training.beats.title')}</h2>
          <button className="close-button" onClick={onClose}>{translate('common.close')}</button>
        </div>
        <div className="beats-list">
          {beats.map(beat => (
            <div 
              key={beat.id} 
              className={`beat-item ${currentBeatId === beat.id ? 'current' : ''}`}
            >
              <div className="beat-item-info">
                <div className="beat-item-main">
                  <span className="beat-item-name">{beat.name}</span>
                  <span className="beat-item-bpm">- {beat.bpm} {translate('training.beats.bpmSuffix')}</span>
                </div>
                <div className="beat-item-description">
                  {beat.description}
                </div>
              </div>
              <div className="beat-item-controls">
                <button 
                  className={`preview-button ${previewingBeatId === beat.id ? 'playing' : ''} ${isLoading && previewingBeatId === beat.id ? 'loading' : ''}`}
                  onClick={() => onPreviewPlay(beat.id)}
                  disabled={isLoading && previewingBeatId === beat.id}
                >
                  {isLoading && previewingBeatId === beat.id ? (
                    <div className="loading-spinner"></div>
                  ) : previewingBeatId === beat.id ? (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16"/>
                      <rect x="14" y="4" width="4" height="16"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <button 
                  className="select-button"
                  onClick={() => onSelect(beat.id)}
                >
                  {translate('common.select')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeatSelectModal; 