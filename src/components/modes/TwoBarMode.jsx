/**
 * Two-Bar Training Mode Component
 * ============================
 * 
 * Training mode for practicing two-bar rap patterns with setup and punchline structure.
 * Displays a visual grid of bars with timing indicators and target words.
 * 
 * Features:
 * - 2x4 bar grid visualization
 * - Beat-synchronized progression
 * - Setup bar with question marks for freestyle
 * - Target word display with preview
 * - Active bar highlighting
 * - Word change animations
 * 
 * Props:
 * - currentBar: Currently active bar index
 * - currentBeat: Current beat within the bar
 * - bpm: Beats per minute for timing
 * - isWordChanging: Word transition animation state
 * - shuffledWords: Array of words to use as targets
 * - wordCounter: Current word index
 * - Standard BaseTrainingMode props
 * 
 * The mode helps users practice basic setup-punchline patterns
 * with one freestyle rhyme followed by a target word.
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';

const TwoBarMode = ({ 
  currentBar,
  currentBeat,
  bpm,
  isWordChanging,
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'two-bar').translations[language];
  const BARS_PER_LINE = 4;
  const [selectedRhyme, setSelectedRhyme] = useState(null);
  const [showHints, setShowHints] = useState(() => {
    const saved = localStorage.getItem('showRhymeHints');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save hint preference to localStorage
  useEffect(() => {
    localStorage.setItem('showRhymeHints', JSON.stringify(showHints));
  }, [showHints]);

  // Update selected rhyme when target word changes
  useEffect(() => {
    const currentWord = shuffledWords[wordCounter];
    const rhymeHints = currentWord?.rhymes?.filter(rhyme => !rhyme.isSlant) || [];
    if (rhymeHints.length > 0) {
      const randomIndex = Math.floor(Math.random() * rhymeHints.length);
      setSelectedRhyme(rhymeHints[randomIndex]);
    } else {
      setSelectedRhyme(null);
    }
  }, [wordCounter, shuffledWords]);

  const renderBar = (barIndex, line) => {
    const isActive = barIndex + (line - 1) * BARS_PER_LINE === currentBar;
    const isTarget = line === 2 && barIndex === 3;
    const isQuestionBlock = line === 1 && barIndex === 3;

    if (isTarget) {
      const currentWord = shuffledWords[wordCounter];
      
      return (
        <div 
          key={`bar-${barIndex}-${line}`}
          className="target-container"
        >
          <span 
            className={`bar target ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
          >
            {currentWord?.word}
          </span>
          <span className="next-word">
            Next: {shuffledWords[wordCounter + 1]?.word}
          </span>
        </div>
      );
    }

    if (isQuestionBlock) {
      return (
        <span 
          key={`bar-${barIndex}-${line}`} 
          className={`bar question ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
        >
          {showHints && selectedRhyme ? (
            <span className="rhyme-suggestion">{selectedRhyme.word}</span>
          ) : (
            <>
              <span className="floating-mark">?</span>
              <span className="floating-mark">?</span>
              <span className="floating-mark">?</span>
              <span className="floating-mark">?</span>
            </>
          )}
        </span>
      );
    }

    return (
      <span 
        key={`bar-${barIndex}-${line}`} 
        className={`bar ${isActive ? 'active' : ''}`}
      >
        - - - -
      </span>
    );
  };

  return (
    <BaseTrainingMode
      modeName={modeName}
      helperText={helperText}
      onReturnToMenu={onReturnToMenu}
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      isLoading={isLoading}
    >
      <div className="hint-toggle">
        <label>
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => setShowHints(e.target.checked)}
          />
          {translations.showHints}
        </label>
      </div>
      <div className="rhyme-pattern">
        <div className="line">
          {[0, 1, 2, 3].map((barIndex) => renderBar(barIndex, 1))}
        </div>
        <div className="line">
          {[0, 1, 2, 3].map((barIndex) => renderBar(barIndex, 2))}
        </div>
      </div>
    </BaseTrainingMode>
  );
};

export default TwoBarMode; 