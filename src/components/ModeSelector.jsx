import React from 'react';
import '../styles/ModeSelector.css';
import { trainingModes } from '../data/trainingModes';
import { useTranslation } from '../services/TranslationContext';

const ModeSelector = ({ onSelectMode }) => {
  const { translate, language } = useTranslation();

  return (
    <div className="mode-selector">
      <h2>{translate('training.modes.title')}</h2>
      <div className="mode-grid">
        {trainingModes.map((mode) => (
          <div 
            key={mode.id}
            className="mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <h3>{mode.translations[language].name}</h3>
            <p>{mode.translations[language].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector; 