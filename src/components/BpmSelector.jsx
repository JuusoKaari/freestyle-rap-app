import React from 'react';
import { beats } from '../data/beat_metadata/index';
import '../styles/BpmSelector.css';

const BpmSelector = ({ selectedBeatId, currentBpm, onBpmChange, disabled }) => {
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
  const availableBpms = selectedBeat ? Object.keys(selectedBeat.files).map(Number).sort((a, b) => a - b) : [];

  const handleBpmChange = (event) => {
    const newBpm = parseInt(event.target.value, 10);
    onBpmChange(newBpm);
  };

  if (!selectedBeat || availableBpms.length === 0) return null;

  return (
    <div className="bpm-selector">
      <select 
        value={currentBpm} 
        onChange={handleBpmChange}
        disabled={disabled}
      >
        {availableBpms.map(bpm => (
          <option key={bpm} value={bpm}>
            {bpm} BPM
          </option>
        ))}
      </select>
    </div>
  );
};

export default BpmSelector; 