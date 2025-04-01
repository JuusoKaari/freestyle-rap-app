import React from 'react';
import '../styles/ModeSelector.css';
import { trainingModes } from '../data/trainingModes';
import { useTranslation } from '../services/TranslationContext';
import { useDebug } from '../services/DebugContext';

const ModeSelector = ({ onSelectMode }) => {
  const { translate, language } = useTranslation();
  const { isDebugMode } = useDebug();

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

  // Categorize modes
  const tools = trainingModes.filter(mode => 
    (mode.id === 'rhyme-map' || (mode.id === 'rhyme-search' && language === 'fi'))
  ).sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty));

  const practiceGames = trainingModes.filter(mode => 
    mode.id !== 'rhyme-map' && mode.id !== 'rhyme-search'
  ).sort((a, b) => getDifficultyOrder(a.difficulty) - getDifficultyOrder(b.difficulty));

  const renderModeCards = (modes, showDifficulty = true) => (
    <div className="mode-grid">
      {modes.map((mode) => (
        <div 
          key={mode.id}
          className="mode-card"
          onClick={() => onSelectMode(mode.id)}
        >
          <div className="mode-header">
            <span className="mode-icon">{mode.icon}</span>
            {showDifficulty && (
              <div className={`difficulty-badge ${mode.difficulty}`}>
                {getDifficultyLabel(mode.difficulty)}
              </div>
            )}
          </div>
          <h3>{mode.translations[language].name}</h3>
          <p>{mode.translations[language].description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mode-selector">
      <section className="mode-section">
        <h2>{language === 'fi' ? 'Harjoitukset' : 'Training Modes'}</h2>
        {renderModeCards(practiceGames, true)}
      </section>

      <section className="mode-section">
        <h2>{language === 'fi' ? 'Työkalut' : 'Tools'}</h2>
        {renderModeCards(tools, false)}
      </section>
    </div>
  );
};

export default ModeSelector; 