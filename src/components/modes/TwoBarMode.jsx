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
            {shuffledWords[wordCounter]}
          </span>
          <span className="next-word">
            Next: {shuffledWords[wordCounter + 1]}
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