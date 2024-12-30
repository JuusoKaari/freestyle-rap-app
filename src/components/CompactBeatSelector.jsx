import React, { useState } from 'react';
import { beats } from '../data/beats';
import BeatSelectModal from './BeatSelectModal';
import '../styles/CompactBeatSelector.css';

const CompactBeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, onPlayPause, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewingBeatId, setPreviewingBeatId] = useState(null);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);

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
    <div className="compact-beat-selector">
      <button 
        className="change-beat-button"
        onClick={() => setIsModalOpen(true)}
      >
        {selectedBeat?.name} - {selectedBeat?.bpm} BPM
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <BeatSelectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (previewingBeatId) {
            onPlayPause(); // Stop any preview playback
            setPreviewingBeatId(null);
          }
        }}
        onSelect={handleBeatSelect}
        currentBeatId={selectedBeatId}
        onPreviewPlay={handlePreviewPlay}
        previewingBeatId={previewingBeatId}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CompactBeatSelector; 