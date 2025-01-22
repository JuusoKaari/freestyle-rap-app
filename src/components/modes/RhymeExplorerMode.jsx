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
 */

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './RhymeExplorerMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { useDebug } from '../../services/DebugContext';
import { trainingModes } from '../../data/trainingModes';
import { getVocabularies } from '../../data/vocabulary/vocabularyConfig';

const RhymeExplorerMode = ({ 
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading,
  selectedVocabulary
}) => {
  const { language } = useTranslation();
  const { isDebugMode } = useDebug();
  const translations = trainingModes.find(mode => mode.id === 'rhyme-explorer').translations[language];
  const vocabularies = getVocabularies(language);
  const selectedVocabInfo = vocabularies.find(vocab => vocab.id === selectedVocabulary);
  const currentWord = shuffledWords[wordCounter];
  const [targetWordIndex, setTargetWordIndex] = useState(wordCounter);

  // Keep targetWordIndex in sync with wordCounter
  useEffect(() => {
    setTargetWordIndex(wordCounter);
  }, [wordCounter]);

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

  return (
    <>
      <BaseTrainingMode
        modeName={modeName}
        helperText={helperText}
        onReturnToMenu={onReturnToMenu}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        isLoading={isLoading}
      >
        <div className="rhyme-explorer">
          {displayWord && (
            <div className="word-card">
              <div className="main-word">
                <h3 key={`main-${displayWord.word}-${targetWordIndex}`}>{displayWord.word.toUpperCase()}</h3>
                <span className="group-label" key={`group-${displayWord.group}-${targetWordIndex}`}>{displayWord.group}</span>
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