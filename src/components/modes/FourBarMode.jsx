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

import React from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/TrainingMode.css';

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
  const BARS_PER_LINE = 4;

  const renderBar = (barIndex, line) => {
    const isActive = barIndex + (line - 1) * BARS_PER_LINE === currentBar;
    const isTarget = line === 4 && barIndex === 3;
    const isQuestionBlock = barIndex === 3 && line < 4;

    if (isTarget) {
      return (
        <div 
          key={`bar-${barIndex}-${line}`}
          className="target-container"
        >
          <span 
            className={`bar target ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
          >
            {shuffledWords[wordCounter]?.word}
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
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
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