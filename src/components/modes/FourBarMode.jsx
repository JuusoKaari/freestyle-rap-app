/**
 * Four-Bar Training Mode Component
 * ============================
 * 
 * Advanced training mode for practicing four-bar rap patterns with extended
 * setup and punchline structure. Provides a larger canvas for complex rhyme schemes.
 * 
 * Features:
 * - 4x4 bar grid visualization
 * - Beat-synchronized progression
 * - Three setup bars with question marks for freestyle
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
 * This mode is designed for more advanced practice, allowing users
 * to build longer rhyme patterns before hitting the target word.
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './FourBarMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';

const FourBarMode = ({ 
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
  const translations = trainingModes.find(mode => mode.id === 'four-bar').translations[language];
  const BARS_PER_LINE = 4;
  const [selectedRhymes, setSelectedRhymes] = useState([]);
  const [showHints, setShowHints] = useState(() => {
    const saved = localStorage.getItem('showRhymeHints');
    return saved !== null ? JSON.parse(saved) : false;
  });

  // Save hint preference to localStorage
  useEffect(() => {
    localStorage.setItem('showRhymeHints', JSON.stringify(showHints));
  }, [showHints]);

  // Update selected rhymes when target word changes
  useEffect(() => {
    const currentWord = shuffledWords[wordCounter];
    const rhymeHints = currentWord?.rhymes?.filter(rhyme => !rhyme.isSlant) || [];
    
    if (rhymeHints.length > 0) {
      // Select three different rhymes if possible
      const shuffledRhymes = [...rhymeHints].sort(() => Math.random() - 0.5);
      setSelectedRhymes(shuffledRhymes.slice(0, 3));
    } else {
      setSelectedRhymes([]);
    }
  }, [wordCounter, shuffledWords]);

  const renderBar = (barIndex, line) => {
    const isActive = barIndex + (line - 1) * BARS_PER_LINE === currentBar;
    const isTarget = line === 4 && barIndex === 3;
    const isQuestionBlock = barIndex === 3 && line < 4;

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
      // Use a different rhyme for each question block
      const rhymeForLine = selectedRhymes[line - 1];
      
      return (
        <span 
          key={`bar-${barIndex}-${line}`} 
          className={`bar question ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
        >
          {showHints && rhymeForLine ? (
            <span className="rhyme-suggestion">{rhymeForLine.word}</span>
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
        {[1, 2, 3, 4].map((line) => (
          <div key={`line-${line}`} className="line">
            {[0, 1, 2, 3].map((barIndex) => renderBar(barIndex, line))}
          </div>
        ))}
      </div>
    </BaseTrainingMode>
  );
};

export default FourBarMode; 