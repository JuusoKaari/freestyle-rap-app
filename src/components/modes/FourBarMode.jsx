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