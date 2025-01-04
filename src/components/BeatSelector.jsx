import React, { useState, useEffect } from 'react';
import { beats } from '../data/beats';
import BeatSelectModal from './BeatSelectModal';
import { useTranslation } from '../services/TranslationContext';
import audioService from '../services/AudioService';
import '../styles/BeatSelector.css';

const BeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, onPlayPause, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewingBeatId, setPreviewingBeatId] = useState(null);
  const [isLoadingBeat, setIsLoadingBeat] = useState(false);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
  const { translate } = useTranslation();

  useEffect(() => {
    // Initialize audio service on mount
    audioService.initialize();

    // Cleanup on unmount
    return () => {
      audioService.dispose();
    };
  }, []);

  useEffect(() => {
    const loadBeat = async () => {
      if (selectedBeat && selectedBeat.file) {
        setIsLoadingBeat(true);
        const beatUrl = `/freestyle-rap-app/beats/${selectedBeat.file}`;
        await audioService.loadBeat(beatUrl);
        setIsLoadingBeat(false);
      }
    };

    loadBeat();
  }, [selectedBeat]);

  useEffect(() => {
    if (isPlaying) {
      audioService.playBeat();
    } else {
      audioService.stopBeat();
    }
  }, [isPlaying]);

  const handlePreviewPlay = async (beatId) => {
    if (previewingBeatId === beatId) {
      setPreviewingBeatId(null);
      audioService.stopBeat();
    } else {
      setPreviewingBeatId(beatId);
      const beat = beats.find(b => b.id === beatId);
      if (beat) {
        setIsLoadingBeat(true);
        const beatUrl = `/freestyle-rap-app/beats/${beat.file}`;
        await audioService.loadBeat(beatUrl);
        setIsLoadingBeat(false);
        audioService.playBeat();
      }
    }
  };

  const handleBeatSelect = (beatId) => {
    if (previewingBeatId) {
      audioService.stopBeat();
      setPreviewingBeatId(null);
    }
    onBeatSelect(beatId);
    setIsModalOpen(false);
  };

  return (
    <div className="beat-selector-container">
      <div className="beat-player">
        <button 
          className={`play-button ${isPlaying ? 'playing' : ''} ${isLoadingBeat ? 'loading' : ''}`} 
          onClick={onPlayPause}
          disabled={isLoadingBeat}
        >
          {isLoadingBeat ? (
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
        isLoading={isLoadingBeat}
      />
    </div>
  );
};

export default BeatSelector; 