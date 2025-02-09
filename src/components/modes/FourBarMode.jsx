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
 * - setWordCounter: Function to set the current word index
 * - setIsWordChanging: Function to set the word transition animation state
 * - Standard BaseTrainingMode props
 * 
 * This mode is designed for more advanced practice, allowing users
 * to build longer rhyme patterns before hitting the target word.
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';

const FourBarMode = ({ 
  currentBar,
  currentBeat,
  bpm,
  isWordChanging,
  shuffledWords,
  wordCounter,
  setWordCounter,
  setIsWordChanging,
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'four-bar').translations[language];
  const BLOCKS_PER_BAR = 4;
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
    // First try to get perfect rhymes
    const perfectRhymes = currentWord?.rhymes?.filter(rhyme => !rhyme.isSlant) || [];
    // If no perfect rhymes, fall back to slant rhymes
    const rhymeHints = perfectRhymes.length > 0 
      ? perfectRhymes 
      : (currentWord?.rhymes || []);
    
    if (rhymeHints.length > 0) {
      // Select three different rhymes if possible
      const shuffledRhymes = [...rhymeHints].sort(() => Math.random() - 0.5);
      setSelectedRhymes(shuffledRhymes.slice(0, 3));
    } else {
      setSelectedRhymes([]);
    }
  }, [wordCounter, shuffledWords]);

  // Handle word changes based on bar position
  useEffect(() => {
    // Change word every 4 bars (one complete pattern)
    if (currentBar % 4 === 0 && currentBeat === 0) {
      setIsWordChanging(true);
      setWordCounter(prev => (prev + 1) % shuffledWords.length);
      setTimeout(() => setIsWordChanging(false), 450);
    }
  }, [currentBar, currentBeat, setIsWordChanging, setWordCounter, shuffledWords.length]);

  const renderBlock = (blockIndex, line) => {
    // Calculate current position in beats (0-15 for four bars)
    const totalBeats = (currentBar * 4) + currentBeat;
    const blockPosition = blockIndex + (line - 1) * BLOCKS_PER_BAR;
    // Wrap around every 16 beats (4 bars × 4 beats)
    const isActive = blockPosition === totalBeats % 16;
    const isTarget = line === 4 && blockIndex === 3;
    const isQuestionBlock = blockIndex === 3 && line < 4;

    if (isTarget) {
      const currentWord = shuffledWords[wordCounter];
      
      return (
        <div 
          key={`block-${blockIndex}-${line}`}
          className="target-container"
        >
          <span 
            className={`block target ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
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
          key={`block-${blockIndex}-${line}`} 
          className={`block question ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
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
        key={`block-${blockIndex}-${line}`} 
        className={`block ${isActive ? 'active' : ''}`}
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
            {[0, 1, 2, 3].map((blockIndex) => renderBlock(blockIndex, line))}
          </div>
        ))}
      </div>
    </BaseTrainingMode>
  );
};

export default FourBarMode; 