/**
 * Setup & Punchline Training Mode Component
 * ====================================
 * 
 * Training mode for practicing rap patterns with setup and punchline structure.
 * Displays a dynamic grid of bars with configurable length (2, 4, or 8 bars).
 * 
 * Features:
 * - Configurable bar length (2, 4, 8 bars)
 * - Beat-synchronized progression
 * - Setup bars with question marks for freestyle
 * - Target word display with preview
 * - Active bar highlighting
 * - Word change animations
 * - Rhyme hints for setup bars
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
 * - onBarsPerRoundChange: Function to handle bar length changes
 * - Standard BaseTrainingMode props
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import StorageService from '../../services/StorageService.js';
import '../../styles/trainingModeStyles/SetupPunchlineMode.css';

const SetupPunchlineMode = ({ 
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
  isLoading,
  onBarsPerRoundChange = () => {}
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'setup-punchline').translations[language];
  const BLOCKS_PER_BAR = 4;
  const [selectedRhymes, setSelectedRhymes] = useState([]);
  const [showHints, setShowHints] = useState(() => {
    return StorageService.get('showRhymeHints', false);
  });
  const [barsPerRound, setBarsPerRound] = useState(2);
  const [isNextWordChanging, setIsNextWordChanging] = useState(false);

  // Save hint preference to localStorage
  useEffect(() => {
    StorageService.set('showRhymeHints', showHints);
  }, [showHints]);

  // Handle bar length changes
  const handleBarsChange = (value) => {
    console.debug('[SetupPunchline] Bars per round changed:', { to: value });
    setBarsPerRound(value);
    onBarsPerRoundChange(value);
  };

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
      // Select rhymes based on bars per round (need one less than total bars)
      const numRhymes = barsPerRound - 1;
      const shuffledRhymes = [...rhymeHints].sort(() => Math.random() - 0.5);
      setSelectedRhymes(shuffledRhymes.slice(0, numRhymes));
    } else {
      setSelectedRhymes([]);
    }
  }, [wordCounter, shuffledWords, barsPerRound]);

  // Handle word changes based on bar position
  useEffect(() => {
    // Change word based on selected bar length
    if (currentBar % barsPerRound === 0 && currentBeat === 0) {
      setIsWordChanging(true);
      setIsNextWordChanging(true);
      setWordCounter(prev => (prev + 1) % shuffledWords.length);
      
      // Target word animation
      setTimeout(() => setIsWordChanging(false), 450);
      
      // Next word animation (matches CSS animation duration)
      setTimeout(() => setIsNextWordChanging(false), 2000);
    }
  }, [currentBar, currentBeat, setIsWordChanging, setWordCounter, shuffledWords.length, barsPerRound]);

  const renderBlock = (blockIndex, line) => {
    // Calculate current position in beats
    const totalBeats = (currentBar * 4) + currentBeat;
    const blockPosition = blockIndex + (line - 1) * BLOCKS_PER_BAR;
    // Wrap around based on total bars
    const isActive = blockPosition === totalBeats % (barsPerRound * 4);
    const isTarget = line === barsPerRound && blockIndex === 3;
    const isQuestionBlock = line < barsPerRound && blockIndex === 3;

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
        </div>
      );
    }

    if (isQuestionBlock) {
      const rhymeIndex = line - 1;
      const rhymeHint = showHints && selectedRhymes[rhymeIndex];
      // Calculate delay based on position from bottom
      const delayIndex = barsPerRound - line;

      return (
        <span 
          key={`block-${blockIndex}-${line}`} 
          className={`block question ${isActive ? 'active' : ''} ${isWordChanging ? `changing delay-${delayIndex}` : ''}`}
        >
          {rhymeHint ? (
            <span className="rhyme-suggestion">{rhymeHint.word}</span>
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
      <div className="rhyme-pattern">
        {Array.from({ length: barsPerRound }, (_, i) => (
          <div key={`line-${i + 1}`} className="line">
            {[0, 1, 2, 3].map((blockIndex) => renderBlock(blockIndex, i + 1))}
          </div>
        ))}
        <div className="line next-word-row">
          <div className="block"></div>
          <div className="block"></div>
          <div className="block"></div>
          <div className={`next-word-container ${isNextWordChanging ? 'entering' : ''}`}>
            <span className="next-word-label">NEXT</span>
            <div className="block next-word">
              {shuffledWords[(wordCounter + 1) % shuffledWords.length]?.word}
            </div>
          </div>
        </div>
      </div>
      <div className="settings-row">
        <div className="bars-per-round-setting">
          <label>
            {translations.barCountLabel}
            <select 
              value={barsPerRound} 
              onChange={(e) => handleBarsChange(Number(e.target.value))}
              disabled={isPlaying}
            >
              <option value="2">2 bars</option>
              <option value="4">4 bars</option>
            </select>
          </label>
        </div>
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
      </div>
    </BaseTrainingMode>
  );
};

export default SetupPunchlineMode; 