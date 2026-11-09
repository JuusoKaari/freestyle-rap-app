/**
 * ModeSelector Component
 * ======================
 * Displays training modes and tools from modeRegistry.
 * Debug-only modes stay hidden until debug mode is on.
 */

import React from 'react';
import '../styles/ModeSelector.css';
import { trainingModes } from '../data/trainingModes';
import { getModesByCategory, MODE_CATEGORY } from '../data/modeRegistry';
import { useTranslation } from '../services/TranslationContext';
import { useDebug } from '../services/DebugContext';

const ModeSelector = ({ onSelectMode }) => {
  const { translate, language } = useTranslation();
  const { isDebugMode } = useDebug();

  const getModeConfig = (modeId) => trainingModes.find((mode) => mode.id === modeId);

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

  const sortByDifficulty = (entries) =>
    [...entries].sort((a, b) => {
      const configA = getModeConfig(a.id);
      const configB = getModeConfig(b.id);
      return getDifficultyOrder(configA?.difficulty) - getDifficultyOrder(configB?.difficulty);
    });

  const practiceGames = sortByDifficulty(getModesByCategory(MODE_CATEGORY.TRAINING, language, isDebugMode));
  const tools = sortByDifficulty(getModesByCategory(MODE_CATEGORY.TOOL, language, isDebugMode));

  const renderModeCards = (entries, showDifficulty = true) => (
    <div className="mode-grid">
      {entries.map((entry) => {
        const mode = getModeConfig(entry.id);
        const translations = mode?.translations?.[language];
        if (!mode || !translations) return null;

        return (
          <div
            key={entry.id}
            className="mode-card"
            onClick={() => onSelectMode(entry.id)}
          >
            <div className="mode-header">
              <span className="mode-icon">{mode.icon}</span>
              {showDifficulty && (
                <div className={`difficulty-badge ${mode.difficulty}`}>
                  {getDifficultyLabel(mode.difficulty)}
                </div>
              )}
            </div>
            <h3>{translations.name}</h3>
            <p>{translations.description}</p>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="mode-selector">
      <section className="mode-section">
        <h2>{translate('training.modes.title')}</h2>
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
