import React from 'react';
import '../styles/ModeSelector.css';
import { trainingModes } from '../data/trainingModes';
import { useTranslation } from '../services/TranslationContext';

const ModeSelector = ({ onSelectMode }) => {
  const { translate, language } = useTranslation();

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return language === 'fi' ? 'Helppo' : 'Easy';
      case 'medium':
        return language === 'fi' ? 'Keskitaso' : 'Medium';
      case 'hard':
        return language === 'fi' ? 'Vaikea' : 'Hard';
      default:
        return '';
    }
  };

  const getDifficultyOrder = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 0;
      case 'medium': return 1;
      case 'hard': return 2;
      default: return 3;
    }
  };

  const sortedModes = [...trainingModes].sort((a, b) => 
    getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty)
  );

  return (
    <div className="mode-selector">
      <h2>{translate('training.modes.title')}</h2>
      <div className="mode-grid">
        {sortedModes.map((mode) => (
          <div 
            key={mode.id}
            className="mode-card"
            onClick={() => onSelectMode(mode.id)}
          >
            <div className="mode-header">
              <span className="mode-icon">{mode.icon}</span>
              <div className={`difficulty-badge ${mode.difficulty}`}>
                {getDifficultyLabel(mode.difficulty)}
              </div>
            </div>
            <h3>{mode.translations[language].name}</h3>
            <p>{mode.translations[language].description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector; 