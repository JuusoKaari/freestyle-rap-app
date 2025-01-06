import React, { useState } from 'react';
import { beats } from '../data/beat_metadata/index';
import BeatSelectModal from './BeatSelectModal';
import BpmSelector from './BpmSelector';
import '../styles/CompactBeatSelector.css';

const CompactBeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, isLoading, currentBpm, onBpmChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);

  return (
    <div className="compact-beat-selector">
      <button 
        className="current-beat"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        {selectedBeat?.name || 'Select Beat'}
        <svg viewBox="0 0 24 24" className="dropdown-icon">
          <path
            fill="currentColor"
            d="M7 10l5 5 5-5z"
          />
        </svg>
      </button>

      <BpmSelector
        selectedBeatId={selectedBeatId}
        currentBpm={currentBpm}
        onBpmChange={onBpmChange}
        disabled={isLoading || isPlaying}
      />

      <BeatSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onBeatSelect}
        currentBeatId={selectedBeatId}
      />
    </div>
  );
};

export default CompactBeatSelector; 