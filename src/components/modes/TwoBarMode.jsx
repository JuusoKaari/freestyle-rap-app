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

import React from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/TrainingMode.css';

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
  const BARS_PER_LINE = 4;

  const renderBar = (barIndex, line) => {
    const isActive = barIndex + (line - 1) * BARS_PER_LINE === currentBar;
    const isTarget = line === 2 && barIndex === 3;
    const isQuestionBlock = line === 1 && barIndex === 3;

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