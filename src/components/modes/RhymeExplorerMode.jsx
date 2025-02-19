/**
 * RhymeExplorerMode Component
 * ==========================
 * 
 * A training mode that allows users to explore words and their rhyming pairs.
 * This mode is designed for vocabulary building and understanding rhyme patterns.
 * 
 * Key features:
 * - Display of target word and its rhyming pairs
 * - Manual navigation through words (Previous/Next)
 * - Automatic word progression with beat
 * - Categorized display of rhymes (themed vs other)
 * - Bilingual support (FI/EN)
 * 
 * Props:
 * - shuffledWords: Array of word objects to display
 * - wordCounter: Current word index
 * - onReturnToMenu: Callback to return to main menu
 * - modeName: Name of the mode in current language
 * - helperText: Instructions in current language
 * - isPlaying: Beat playback state
 * - onPlayPause: Beat control callback
 * - isLoading: Loading state indicator
 * - selectedVocabulary: Name of the vocabulary
 * - currentBeat: Current beat position
 * - currentBar: Current bar position
 * - setWordCounter: Callback to set the current word index
 * - setIsWordChanging: Callback to set the word changing state
 * - bpm: Beats per minute
 * - onBarsPerRoundChange: Callback to handle bar length changes
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './RhymeExplorerMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { useDebug } from '../../services/DebugContext';
import { trainingModes } from '../../data/trainingModes';
import { getVocabularies } from '../../data/vocabulary/vocabularyConfig';
import { useWordAudio } from '../../hooks/useWordAudio';
import { AudioToggle } from '../AudioToggle';

const RhymeExplorerMode = ({ 
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying: isBeatPlaying,
  onPlayPause,
  isLoading,
  selectedVocabulary,
  currentBeat,
  currentBar,
  setWordCounter,
  setIsWordChanging,
  bpm,
  onBarsPerRoundChange = () => {}
}) => {
  const { language } = useTranslation();
  const { isDebugMode } = useDebug();
  const translations = trainingModes.find(mode => mode.id === 'rhyme-explorer').translations[language];
  const vocabularies = getVocabularies(language);
  const selectedVocabInfo = vocabularies.find(vocab => vocab.id === selectedVocabulary);
  const currentWord = shuffledWords[wordCounter];
  const [targetWordIndex, setTargetWordIndex] = useState(wordCounter);
  const [barsPerRound, setBarsPerRound] = useState(2);
  const [progress, setProgress] = useState(100);
  const { isAudioEnabled, isAudioAvailable, toggleAudio, playWordAudio, preloadWordAudio } = useWordAudio(selectedVocabulary);

  // Handle bar length changes
  const handleBarsChange = (value) => {
    console.debug('[RhymeExplorer] Bars per round changed:', { to: value });
    setBarsPerRound(value);
    onBarsPerRoundChange(value);
  };

  // Keep targetWordIndex in sync with wordCounter
  useEffect(() => {
    setTargetWordIndex(wordCounter);
  }, [wordCounter]);

  // Handle automatic word changes based on beat position and barsPerRound
  useEffect(() => {
    if (isBeatPlaying && currentBar % barsPerRound === 0 && currentBeat === 0) {
      setIsWordChanging?.(true);
      handleNextWord();
      setTimeout(() => setIsWordChanging?.(false), 450);
    }
  }, [currentBeat, currentBar, isBeatPlaying, barsPerRound]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default behavior for arrow keys and space
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowLeft':
          handlePreviousWord();
          break;
        case 'ArrowRight':
          handleNextWord();
          break;
        case ' ': // Spacebar
          onPlayPause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, targetWordIndex, shuffledWords.length]);

  const handleNextWord = () => {
    setTargetWordIndex((prev) => (prev + 1) % shuffledWords.length);
  };

  const handlePreviousWord = () => {
    setTargetWordIndex((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
  };

  const handleWordClick = (index) => {
    // Only allow clicking words in debug mode
    if (!isDebugMode) return;
    
    // Calculate the shortest path to the target word
    const currentPos = targetWordIndex;
    const targetPos = index;
    const totalWords = shuffledWords.length;
    
    // Calculate forward and backward distances
    const forwardDist = (targetPos - currentPos + totalWords) % totalWords;
    const backwardDist = (currentPos - targetPos + totalWords) % totalWords;
    
    // Use the shorter path
    const moveForward = forwardDist <= backwardDist;
    const steps = Math.min(forwardDist, backwardDist);
    
    // Execute the moves
    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        moveForward ? handleNextWord() : handlePreviousWord();
      }, i * 100); // Add small delay between moves for visual feedback
    }
  };

  const displayWord = shuffledWords[targetWordIndex];

  // Preload next word's audio
  useEffect(() => {
    if (!displayWord || !isAudioEnabled) return;
    
    // Calculate next word index
    const nextIndex = (targetWordIndex + 1) % shuffledWords.length;
    const nextWord = shuffledWords[nextIndex];
    
    if (nextWord) {
      // Use phonetic version if available, otherwise use display word
      const word = nextWord.phonetic || nextWord.word.toLowerCase();
      preloadWordAudio(word, language);
    }
  }, [targetWordIndex, shuffledWords, language, isAudioEnabled, preloadWordAudio]);

  // Play audio when word changes
  useEffect(() => {
    if (displayWord) {
      // Use phonetic version if available, otherwise use display word
      const word = displayWord.phonetic || displayWord.word.toLowerCase();
      
      // Add a small delay to prevent rapid playback
      const timeoutId = setTimeout(() => {
        playWordAudio(word, language);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [displayWord, playWordAudio, language]);

  // Update progress bar based on beat timing
  useEffect(() => {
    if (!isBeatPlaying) {
      setProgress(100);
      return;
    }

    const interval = 50; // Update more frequently for smoother animation
    const beatsPerBar = 4;
    const totalTime = (60 / bpm) * beatsPerBar * barsPerRound * 1000; // Total time in ms
    const adjustedTime = totalTime * 0.75; // Complete slightly before word change
    const decrementAmount = (interval / adjustedTime) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.max(0, prev - decrementAmount);
        return newProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isBeatPlaying, targetWordIndex, bpm, barsPerRound]);

  // Reset progress when word changes
  useEffect(() => {
    setProgress(100);
  }, [targetWordIndex]);

  return (
    <>
      <BaseTrainingMode
        modeName={modeName}
        helperText={helperText}
        onReturnToMenu={onReturnToMenu}
        isPlaying={isBeatPlaying}
        onPlayPause={onPlayPause}
        isLoading={isLoading}
      >
        <div className="rhyme-explorer">
          <div className="settings-row">
            <div className="bars-per-round-setting">
              <label>
                {translations.barCountLabel}
                <select 
                  value={barsPerRound} 
                  onChange={(e) => handleBarsChange(Number(e.target.value))}
                  disabled={isBeatPlaying}
                >
                  {Object.entries(translations.barLengthOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>
            <AudioToggle
              isEnabled={isAudioEnabled}
              isAvailable={isAudioAvailable}
              onToggle={toggleAudio}
            />
          </div>
          {displayWord && (
            <div className="word-card">
              <div className="main-word">
                <h3 key={`main-${displayWord.word}-${targetWordIndex}`}>{displayWord.word.toUpperCase()}</h3>
                <span className="group-label" key={`group-${displayWord.group}-${targetWordIndex}`}>{displayWord.group}</span>
                <div className="rhyme-explorer-progress-bar" style={{ width: `${progress}%` }} />
              </div>

              <div className="rhyme-section themed-rhymes">
                <h4>
                  {selectedVocabInfo && `${selectedVocabInfo.name} `}{translations.themedRhymes}
                </h4>
                <div className="rhyme-list" data-empty-text={translations.noRhymesFound}>
                  {displayWord.themed_rhymes && displayWord.themed_rhymes.length > 0 && (
                    <>
                      {/* Direct rhymes first */}
                      {displayWord.themed_rhymes
                        .filter(rhyme => !rhyme.isSlant)
                        .map((rhyme, index) => (
                          <span 
                            key={`themed-direct-${targetWordIndex}-${rhyme.word}-${index}`} 
                            className="rhyme"
                          >
                            {rhyme.word}
                          </span>
                      ))}
                      {/* Then slant rhymes */}
                      {displayWord.themed_rhymes
                        .filter(rhyme => rhyme.isSlant)
                        .map((rhyme, index) => (
                          <span 
                            key={`themed-slant-${targetWordIndex}-${rhyme.word}-${index}`} 
                            className="rhyme slant-rhyme"
                          >
                            {rhyme.word}
                          </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="rhyme-section other-rhymes">
                <h4>{translations.otherRhymes}</h4>
                <div className="rhyme-list" data-empty-text={translations.noRhymesFound}>
                  {displayWord.rhymes && displayWord.rhymes.length > 0 && (
                    <>
                      {/* Direct rhymes first */}
                      {displayWord.rhymes
                        .filter(rhyme => !rhyme.isSlant)
                        .map((rhyme, index) => (
                          <span 
                            key={`other-direct-${targetWordIndex}-${rhyme.word}-${index}`} 
                            className="rhyme"
                          >
                            {rhyme.word}
                          </span>
                      ))}
                      {/* Then slant rhymes */}
                      {displayWord.rhymes
                        .filter(rhyme => rhyme.isSlant)
                        .map((rhyme, index) => (
                          <span 
                            key={`other-slant-${targetWordIndex}-${rhyme.word}-${index}`} 
                            className="rhyme slant-rhyme"
                          >
                            {rhyme.word}
                          </span>
                      ))}
                    </>
                  )}
                </div>
              </div>

              <div className="navigation-buttons">
                <button className="nav-button prev-button" onClick={handlePreviousWord}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{translations.prevButton}</span>
                </button>
                <button className="nav-button next-button" onClick={handleNextWord}>
                  <span>{translations.nextButton}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </BaseTrainingMode>

      {isDebugMode && (
        <div className="debug-word-list">
          <h4>Debug: All Words ({targetWordIndex + 1}/{shuffledWords.length})</h4>
          <div className="word-list">
            {shuffledWords.map((word, index) => (
              <div 
                key={index} 
                className={`debug-word ${index === targetWordIndex ? 'current' : ''}`}
                onClick={() => handleWordClick(index)}
                title={`Group: ${word.group}`}
              >
                {word.word}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default RhymeExplorerMode; 