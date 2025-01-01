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
  onNextWord,
  isPlaying,
  onPlayPause,
  isLoading,
  bpm
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'find-rhymes').translations[language];
  
  const [surroundingWords, setSurroundingWords] = useState([]);
  const [clickedWords, setClickedWords] = useState([]);
  const [progress, setProgress] = useState(100);
  
  const currentWord = shuffledWords[wordCounter];
  const NUM_SURROUNDING_WORDS = 8; // 3x3 grid = 9 spots, minus 1 for target word
  
  // Handle play/pause with reset
  const handlePlayPause = () => {
    if (isPlaying) {
      onPlayPause(); // Just stop if we're playing
    } else {
      setClickedWords([]); // Reset clicked words
      onNextWord(); // Get a new word
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
    const barsPerWord = 2; // Each word lasts 2 bars (8 beats)
    const totalTime = (60 / bpm) * beatsPerBar * barsPerWord * 1000; // Total time in ms
    const adjustedTime = totalTime * 0.75; // Complete slightly before word change
    const decrementAmount = (interval / adjustedTime) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.max(0, prev - decrementAmount);
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, wordCounter, bpm]);

  // Reset progress when word changes
  useEffect(() => {
    setProgress(100);
  }, [wordCounter]);

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
            {isPlaying && <div className="progress-bar" style={{ width: `${progress}%` }} />}
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