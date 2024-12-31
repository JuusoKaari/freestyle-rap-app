import React, { useState } from 'react';
import { beats } from '../data/beats';
import BeatSelectModal from './BeatSelectModal';
import { useTranslation } from '../services/TranslationContext';
import '../styles/BeatSelector.css';

const BeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, onPlayPause, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewingBeatId, setPreviewingBeatId] = useState(null);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
  const { translate } = useTranslation();

  const handlePreviewPlay = (beatId) => {
    if (previewingBeatId === beatId) {
      setPreviewingBeatId(null);
      onPlayPause(); // Stop current playback
    } else {
      setPreviewingBeatId(beatId);
      onBeatSelect(beatId);
      onPlayPause(); // Start playing the new beat
    }
  };

  const handleBeatSelect = (beatId) => {
    if (previewingBeatId) {
      onPlayPause(); // Stop any preview playback
      setPreviewingBeatId(null);
    }
    onBeatSelect(beatId);
    setIsModalOpen(false);
  };

  return (
    <div className="beat-selector-container">
      <div className="beat-player">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`} 
          onClick={onPlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : isPlaying ? (
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

        <div className="beat-info">
          <div className="beat-main-info">
            <span className="beat-label">{translate('training.beats.beatLabel')}:</span>
            <span className="beat-name">{selectedBeat?.name}</span>
            <span className="beat-bpm">- {selectedBeat?.bpm} {translate('training.beats.bpmSuffix')}</span>
          </div>
          <div className="beat-details">
            <span className="beat-description">{selectedBeat?.description}</span>
          </div>
        </div>

        <button 
          className="change-beat-button"
          onClick={() => setIsModalOpen(true)}
        >
          {translate('training.beats.changeBeat')}
        </button>
      </div>

      <BeatSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleBeatSelect}
        currentBeatId={selectedBeatId}
        onPreviewPlay={handlePreviewPlay}
        previewingBeatId={previewingBeatId}
        isLoading={isLoading}
      />
    </div>
  );
};

export default BeatSelector; 