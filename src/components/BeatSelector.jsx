import React, { useState, useEffect } from 'react';
import { beats } from '../data/beat_metadata/index';
import BeatSelectModal from './BeatSelectModal';
import BpmSelector from './BpmSelector';
import { useTranslation } from '../services/TranslationContext';
import audioService from '../services/AudioService';
import '../styles/BeatSelector.css';

const BeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, onPlayPause, isLoading, currentBpm, onBpmChange }) => {
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
      if (selectedBeat) {
        setIsLoadingBeat(true);
        // Use the URL for the current BPM from the files object
        const beatUrl = selectedBeat.files[currentBpm.toString()];
        if (beatUrl) {
          await audioService.loadBeat(beatUrl);
        }
        setIsLoadingBeat(false);
      }
    };

    loadBeat();
  }, [selectedBeat, currentBpm]);

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
        // Use the URL for the beat's default BPM
        const beatUrl = beat.files[beat.bpm.toString()];
        if (beatUrl) {
          await audioService.loadBeat(beatUrl);
          setIsLoadingBeat(false);
          audioService.playBeat();
        }
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
          className={`play-button ${isLoading || isLoadingBeat ? 'loading' : ''}`}
          onClick={onPlayPause}
          disabled={isLoading || isLoadingBeat || !selectedBeat}
        >
          {isLoading || isLoadingBeat ? (
            <div className="loading-spinner" />
          ) : isPlaying ? (
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M8 5v14l11-7z"
              />
            </svg>
          )}
        </button>

        <div className="beat-info">
          <div className="beat-main-info">
            <span className="beat-label">{translate('training.beats.currentBeat')}:</span>
            <span className="beat-name">
              {selectedBeat ? selectedBeat.name : translate('training.beats.noBeat')}
            </span>
          </div>
          {selectedBeat && (
            <div className="beat-details">
              <span className="beat-description">{selectedBeat.description}</span>
            </div>
          )}
        </div>

        <div className="controls-group">
          <BpmSelector
            selectedBeatId={selectedBeatId}
            currentBpm={currentBpm}
            onBpmChange={onBpmChange}
            disabled={isLoading || isLoadingBeat || isPlaying}
          />
          <button className="change-beat-button" onClick={() => setIsModalOpen(true)}>
            {translate('training.beats.changeBeat')}
          </button>
        </div>
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