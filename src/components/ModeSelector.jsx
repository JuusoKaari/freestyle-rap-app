import React from 'react';
import '../styles/ModeSelector.css';
import { trainingModes } from '../data/trainingModes';

const ModeSelector = ({ onSelectMode }) => {
  return (
    <div className="mode-selector">
      <h2>Select Training Mode</h2>
      <div className="mode-grid">
        {trainingModes.map((mode) => (
          <div 
            key={mode.id}
            className="mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <h3>{mode.name}</h3>
            <p>{mode.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector; 