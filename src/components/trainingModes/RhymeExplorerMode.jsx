/**
 * Single Rhymes Mode (rhyme-explorer)
 * ===================================
 *
 * Centered word with radial rhyme bubbles, beat-synced auto-advance,
 * and manual navigation. wordCounter from App is the single source of truth.
 */

import React, { useState, useEffect, useCallback } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/trainingModeStyles/RhymeExplorerMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { useDebug } from '../../services/DebugContext';
import { trainingModes } from '../../data/trainingModes';
import { useWordAudio } from '../../hooks/useWordAudio';
import { useBarSyncedWordAdvance } from '../../hooks/useBarSyncedWordAdvance';
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
  beatInBar,
  currentBar,
  setWordCounter,
  setIsWordChanging,
  bpm,
}) => {
  const { language } = useTranslation();
  const { isDebugMode } = useDebug();
  const translations = trainingModes.find((mode) => mode.id === 'rhyme-explorer').translations[language];
  const [barsPerRound, setBarsPerRound] = useState(2);
  const [progress, setProgress] = useState(100);
  const { isAudioEnabled, isAudioAvailable, toggleAudio, playWordAudio, preloadWordAudio } = useWordAudio(selectedVocabulary);
  const [showHints, setShowHints] = useState(true);

  const handleNextWord = useCallback(() => {
    setWordCounter((prev) => (prev + 1) % shuffledWords.length);
  }, [setWordCounter, shuffledWords.length]);

  const handlePreviousWord = useCallback(() => {
    setWordCounter((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
  }, [setWordCounter, shuffledWords.length]);

  useBarSyncedWordAdvance({
    isPlaying: isBeatPlaying,
    beatInBar,
    currentBar,
    barsPerRound,
    shuffledWordsLength: shuffledWords.length,
    setIsWordChanging,
    onAdvance: handleNextWord,
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
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
        case ' ':
          onPlayPause();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayPause, handleNextWord, handlePreviousWord]);

  const handleWordClick = (index) => {
    if (!isDebugMode) return;

    const currentPos = wordCounter;
    const targetPos = index;
    const totalWords = shuffledWords.length;
    const forwardDist = (targetPos - currentPos + totalWords) % totalWords;
    const backwardDist = (currentPos - targetPos + totalWords) % totalWords;
    const moveForward = forwardDist <= backwardDist;
    const steps = Math.min(forwardDist, backwardDist);

    for (let i = 0; i < steps; i++) {
      setTimeout(() => {
        if (moveForward) {
          handleNextWord();
        } else {
          handlePreviousWord();
        }
      }, i * 100);
    }
  };

  const displayWord = shuffledWords[wordCounter];
  const generalRhymes = displayWord?.rhymes || [];
  const totalBubbleSlots = 6;
  const bubbleSlots = Array.from({ length: totalBubbleSlots }, (_, i) => generalRhymes[i] || null);
  const angleOffset = Math.PI / 6;

  useEffect(() => {
    if (!displayWord || !isAudioEnabled) return;

    const nextIndex = (wordCounter + 1) % shuffledWords.length;
    const nextWord = shuffledWords[nextIndex];

    if (nextWord) {
      const word = nextWord.phonetic || nextWord.word.toLowerCase();
      preloadWordAudio(word, language);
    }
  }, [wordCounter, shuffledWords, language, isAudioEnabled, preloadWordAudio, displayWord]);

  useEffect(() => {
    if (displayWord) {
      const word = displayWord.phonetic || displayWord.word.toLowerCase();
      const timeoutId = setTimeout(() => {
        playWordAudio(word, language);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [displayWord, playWordAudio, language]);

  useEffect(() => {
    if (!isBeatPlaying) {
      setProgress(100);
      return;
    }

    const interval = 50;
    const beatsPerBar = 4;
    const totalTime = (60 / bpm) * beatsPerBar * barsPerRound * 1000;
    const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
    const adjustedTime = totalTime * (isFirefox ? 0.75 : 0.95);
    const decrementAmount = (interval / adjustedTime) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => Math.max(0, prev - decrementAmount));
    }, interval);

    return () => clearInterval(timer);
  }, [isBeatPlaying, wordCounter, bpm, barsPerRound]);

  useEffect(() => {
    setProgress(100);
  }, [wordCounter]);

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
          {displayWord && (
            <>
              <div className="rhyme-explorer-stage">
                <div className="center-word">
                  <h3 key={`main-${displayWord.word}-${wordCounter}`}>{displayWord.word.toUpperCase()}</h3>
                </div>
                <div
                  key={`circle-${wordCounter}`}
                  className="rhyme-progress-circle"
                  style={{ ['--circle-scale']: progress / 100 }}
                />
                <div className={`rhyme-bubbles ${showHints ? 'hints-visible' : ''}`}>
                  {bubbleSlots.map((rhyme, index) => {
                    const count = totalBubbleSlots;
                    const angle = (index / count) * Math.PI * 2 + angleOffset;
                    const radius = 38;
                    const x = 50 + radius * Math.cos(angle);
                    const y = 50 + radius * Math.sin(angle);
                    const style = {
                      '--final-left': `${x}%`,
                      '--final-top': `${y}%`,
                      animationDelay: `${index * 50}ms`
                    };
                    const content = showHints && rhyme ? rhyme.word : '?';
                    const classes = `rhyme-bubble ${rhyme?.isSlant ? 'slant-rhyme' : ''}`.trim();
                    return (
                      <div className={classes} style={style} key={`bubble-${wordCounter}-${rhyme?.word || 'placeholder'}-${index}`}>
                        {content}
                      </div>
                    );
                  })}
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

              <div className="settings-row">
                <div className="bars-per-round-setting">
                  <label>
                    {translations.barCountLabel}
                    <select
                      value={barsPerRound}
                      onChange={(e) => setBarsPerRound(Number(e.target.value))}
                      disabled={isBeatPlaying}
                    >
                      {Object.entries(translations.barLengthOptions).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="settings-toggles">
                  <AudioToggle
                    isEnabled={isAudioEnabled}
                    isAvailable={isAudioAvailable}
                    onToggle={toggleAudio}
                  />
                  <div className="hint-toggle">
                    <span className="toggle-label">{translations.showHints}</span>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={showHints}
                        onChange={() => setShowHints((prev) => !prev)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </BaseTrainingMode>

      {isDebugMode && (
        <div className="debug-word-list">
          <h4>Debug: All Words ({wordCounter + 1}/{shuffledWords.length})</h4>
          <div className="word-list">
            {shuffledWords.map((word, index) => (
              <div
                key={index}
                className={`debug-word ${index === wordCounter ? 'current' : ''}`}
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
