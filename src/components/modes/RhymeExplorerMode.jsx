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
 * - onNextWord/onPreviousWord: Word navigation callbacks
 * - isPlaying: Beat playback state
 * - onPlayPause: Beat control callback
 * - isLoading: Loading state indicator
 */

import React, { useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/TrainingMode.css';
import './RhymeExplorerMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { useDebug } from '../../services/DebugContext';
import { trainingModes } from '../../data/trainingModes';

const RhymeExplorerMode = ({ 
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  onNextWord,
  onPreviousWord,
  isPlaying,
  onPlayPause,
  isLoading
}) => {
  const { language } = useTranslation();
  const { isDebugMode } = useDebug();
  const translations = trainingModes.find(mode => mode.id === 'rhyme-explorer').translations[language];
  const currentWord = shuffledWords[wordCounter];

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent default behavior for arrow keys and space
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowLeft':
          onPreviousWord();
          break;
        case 'ArrowRight':
          onNextWord();
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
  }, [onNextWord, onPreviousWord, onPlayPause]);

  const handleWordClick = (index) => {
    // Only allow clicking words in debug mode
    if (!isDebugMode) return;
    
    // Calculate the shortest path to the target word
    const currentPos = wordCounter;
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
        moveForward ? onNextWord() : onPreviousWord();
      }, i * 100); // Add small delay between moves for visual feedback
    }
  };

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
          {currentWord && (
            <div className="word-card">
              <div className="main-word">
                <h3>{currentWord.word.toUpperCase()}</h3>
                <span className="group-label">{currentWord.group}</span>
              </div>

              {currentWord.themed_rhymes && currentWord.themed_rhymes.length > 0 && (
                <div className="rhyme-section themed-rhymes">
                  <h4>{translations.themedRhymes}</h4>
                  <div className="rhyme-list">
                    {/* Direct rhymes first */}
                    {currentWord.themed_rhymes
                      .filter(rhyme => !rhyme.isSlant)
                      .map((rhyme, index) => (
                        <span key={`direct-${index}`} className="rhyme">
                          {rhyme.word}
                        </span>
                    ))}
                    {/* Then slant rhymes */}
                    {currentWord.themed_rhymes
                      .filter(rhyme => rhyme.isSlant)
                      .map((rhyme, index) => (
                        <span key={`slant-${index}`} className="rhyme slant-rhyme">
                          {rhyme.word}
                        </span>
                    ))}
                  </div>
                </div>
              )}

              {currentWord.rhymes && currentWord.rhymes.length > 0 && (
                <div className="rhyme-section other-rhymes">
                  <h4>{translations.otherRhymes}</h4>
                  <div className="rhyme-list">
                    {/* Direct rhymes first */}
                    {currentWord.rhymes
                      .filter(rhyme => !rhyme.isSlant)
                      .map((rhyme, index) => (
                        <span key={`direct-${index}`} className="rhyme">
                          {rhyme.word}
                        </span>
                    ))}
                    {/* Then slant rhymes */}
                    {currentWord.rhymes
                      .filter(rhyme => rhyme.isSlant)
                      .map((rhyme, index) => (
                        <span key={`slant-${index}`} className="rhyme slant-rhyme">
                          {rhyme.word}
                        </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="navigation-buttons">
                <button className="nav-button prev-button" onClick={onPreviousWord}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  {translations.prevButton}
                </button>
                <button className="nav-button next-button" onClick={onNextWord}>
                  {translations.nextButton}
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