/**
 * FindRhymesMode Component
 * ======================
 * 
 * Interactive training mode where users identify rhyming words against a timer.
 * Helps develop quick rhyme recognition and vocabulary recall.
 * 
 * Key features:
 * - Target word display
 * - Multiple word choices
 * - Timer-based gameplay
 * - Score tracking
 * - Beat-synchronized timing
 * - Difficulty progression
 * 
 * Props:
 * - shuffledWords: Array of word options
 * - wordCounter: Current word index
 * - onReturnToMenu: Menu return callback
 * - modeName: Mode name in current language
 * - helperText: Instructions text
 * - isPlaying/onPlayPause: Beat control
 * - isLoading: Loading state
 * - bpm: Beats per minute for timing
 * - currentBeat: Current beat position
 * - currentBar: Current bar position
 * - setWordCounter: Function to update word index
 * - setIsWordChanging: Function to handle word change animation
 * - onBarsPerRoundChange: Function to handle bar length change
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './FindRhymesMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';

const FindRhymesMode = ({
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading,
  bpm,
  currentBeat,
  currentBar,
  setWordCounter,
  setIsWordChanging,
  onBarsPerRoundChange = () => {}
}) => {
  const { language } = useTranslation();
  const mode = trainingModes.find(mode => mode.id === 'find-rhymes');
  const translations = mode?.translations?.[language] || {
    barCountLabel: 'Bars per round:',
    barLengthOptions: {
      '1': '1 bar',
      '2': '2 bars',
      '4': '4 bars',
      '8': '8 bars'
    }
  };
  
  const [surroundingWords, setSurroundingWords] = useState([]);
  const [clickedWords, setClickedWords] = useState([]);
  const [progress, setProgress] = useState(100);
  const [barsPerRound, setBarsPerRound] = useState(2);
  
  const currentWord = shuffledWords[wordCounter];
  const NUM_SURROUNDING_WORDS = 8; // 3x3 grid = 9 spots, minus 1 for target word
  
  // Handle bar length changes
  const handleBarsChange = (value) => {
    console.debug('[FindRhymes] Bars per round changed:', { to: value });
    setBarsPerRound(value);
    onBarsPerRoundChange(value);
  };
  
  // Handle play/pause with reset
  const handlePlayPause = () => {
    if (isPlaying) {
      onPlayPause(); // Just stop if we're playing
    } else {
      setClickedWords([]); // Reset clicked words
      onPlayPause(); // Start playing
    }
  };
  
  useEffect(() => {
    if (!currentWord) return;
    
    // Reset clicked words when current word changes
    setClickedWords([]);
    
    // Get all rhyming words (both priority and regular)
    const allRhymes = [
      ...(currentWord.priority_rhymes || []),
      ...(currentWord.rhymes || [])
    ].map((rhyme, idx) => ({
      word: rhyme.word,
      group: rhyme.group,
      isSlant: Boolean(rhyme.isSlant),
      isRhyme: true,
      originalIndex: idx
    }));
    
    // Get some random words from the full dictionary that don't rhyme
    const nonRhymingWords = shuffledWords
      .filter(word => 
        word.word !== currentWord.word && 
        !allRhymes.some(rhyme => rhyme.word === word.word)
      )
      .slice(0, NUM_SURROUNDING_WORDS - Math.min(allRhymes.length, NUM_SURROUNDING_WORDS))
      .map((word, idx) => ({
        word: word.word,
        isRhyme: false,
        group: word.group || null,
        isSlant: false,
        originalIndex: idx + allRhymes.length
      }));
    
    // Combine and shuffle all surrounding words
    const combined = [...allRhymes, ...nonRhymingWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, NUM_SURROUNDING_WORDS);
    
    setSurroundingWords(combined);
  }, [currentWord, wordCounter, shuffledWords]);

  const handleWordClick = (word, index) => {
    console.log('Clicked word:', word, 'at index:', index);
    if (clickedWords.includes(index)) {
      console.log('Word already clicked');
      return;
    }
    
    setClickedWords(prev => {
      const newClickedWords = [...prev, index];
      console.log('New clicked words:', newClickedWords);
      return newClickedWords;
    });
  };

  // Update progress bar based on beat timing
  useEffect(() => {
    if (!isPlaying) {
      setProgress(100);
      return;
    }

    const interval = 50; // Update more frequently for smoother animation
    const beatsPerBar = 4;
    const totalTime = (60 / bpm) * beatsPerBar * barsPerRound * 1000; // Total time in ms
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const adjustedTime = totalTime * (isFirefox ? 0.75 : 0.95); // Apply adjustment only for Firefox
    const decrementAmount = (interval / adjustedTime) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.max(0, prev - decrementAmount);
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, wordCounter, bpm, barsPerRound]);

  // Reset progress when word changes
  useEffect(() => {
    setProgress(100);
  }, [wordCounter]);

  // Handle word changes based on bar position and barsPerRound setting
  useEffect(() => {
    if (isPlaying && currentBar % barsPerRound === 0 && currentBeat === 0) {
      setIsWordChanging(true);
      setWordCounter(prev => (prev + 1) % shuffledWords.length);
      setClickedWords([]); // Reset clicked words for the new round
      setTimeout(() => setIsWordChanging(false), 450);
    }
  }, [currentBar, currentBeat, isPlaying, barsPerRound, setWordCounter, setIsWordChanging, shuffledWords.length]);

  const renderGrid = () => {
    const cells = [];
    let wordIndex = 0;
    const gridPositions = Array(9).fill(null).map((_, i) => i !== 4 ? wordIndex++ : null);

    // Create 9 cells (3x3 grid)
    for (let i = 0; i < 9; i++) {
      if (i === 4) { // Center cell
        cells.push(
          <div key="target" className="target-word">
            <h2>{isPlaying ? currentWord?.word.toUpperCase() : '?'}</h2>
            {isPlaying && <div className="find-rhymes-progress-bar" style={{ width: `${progress}%` }} />}
          </div>
        );
      } else {
        const currentWordIndex = gridPositions[i];
        if (currentWordIndex < surroundingWords.length) {
          const word = surroundingWords[currentWordIndex];
          const isClicked = clickedWords.includes(currentWordIndex);
          const className = `word-button ${
            isPlaying ? (
              isClicked 
                ? word.isRhyme 
                  ? `correct${word.isSlant ? ' slant' : ''}`
                  : 'incorrect'
                : ''
            ) : 'hidden'
          }`;
          
          cells.push(
            <button
              key={`word-${i}`}
              className={className}
              onClick={() => isPlaying && handleWordClick(word, currentWordIndex)}
              disabled={!isPlaying || isClicked}
            >
              {isPlaying ? word.word : '?'}
            </button>
          );
        } else {
          cells.push(<div key={`empty-${i}`} />);
        }
      }
    }
    return cells;
  };

  return (
    <BaseTrainingMode
      modeName={modeName}
      helperText={helperText}
      onReturnToMenu={onReturnToMenu}
      isPlaying={isPlaying}
      onPlayPause={handlePlayPause}
      isLoading={isLoading}
    >
      <div className="find-rhymes-container">
        <div className="settings-row">
          <div className="bars-per-round-setting">
            <label>
              {translations.barCountLabel}
              <select 
                value={barsPerRound} 
                onChange={(e) => handleBarsChange(Number(e.target.value))}
                disabled={isPlaying}
              >
                {Object.entries(translations.barLengthOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {currentWord && (
          <div className="word-grid">
            {renderGrid()}
          </div>
        )}
      </div>
    </BaseTrainingMode>
  );
};

export default FindRhymesMode; 