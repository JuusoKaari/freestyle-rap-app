import React, { useState } from 'react';
import { beats } from '../data/beats';
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
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Select Beat</h2>
          <button className="close-button" onClick={onClose}>×</button>
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
                  <span className="beat-item-bpm">- {beat.bpm} BPM</span>
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
                  Select
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