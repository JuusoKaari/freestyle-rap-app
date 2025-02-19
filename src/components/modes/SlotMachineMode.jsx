import React, { useEffect, useState } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import { trainingModes } from '../../data/trainingModes';
import { useTranslation } from '../../services/TranslationContext';
import './SlotMachineMode.css';

// Number of words in each slot's list (total height of scrolling content)
const SLOT_SIZE = 30;

// Main spinning animation duration in milliseconds
const ANIMATION_DURATION = 1000;

// Delay between starting each slot's animation
// Makes slots start spinning one after another (150ms between each)
const SLOT_DELAY = 150;

// Additional delay before resetting everything
// Gives time for the animation to settle
const RESET_DELAY = 100;

// When to start the ending animation (slowing down)
// Starts 300ms before the main animation ends
const ENDING_ANIMATION_START = ANIMATION_DURATION - 300;

// Total time to wait before updating the word lists:
// - ANIMATION_DURATION (1000ms) for main spin
// - 2 * SLOT_DELAY (300ms) for all slots to start
// - RESET_DELAY (800ms) extra time
// = 2100ms total
const TOTAL_DELAY = ANIMATION_DURATION + (2 * SLOT_DELAY) + RESET_DELAY;

const SlotMachine = ({ 
  shuffledWords,
  wordCounter,
  onReturnToMenu,
  modeName,
  helperText,
  onNextWord,
  onPreviousWord,
  isPlaying,
  onPlayPause,
  isLoading,
  onBarsPerRoundChange = () => {},
  isDebugMode = false,
  currentBeat,
  currentBar,
  setWordCounter,
  setIsWordChanging,
  bpm
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'slot-machine').translations[language];
  const [isSpinning, setIsSpinning] = useState([false, false, false]);
  const [isEndingAnimation, setIsEndingAnimation] = useState([false, false, false]);
  const [lastWordCounter, setLastWordCounter] = useState(wordCounter);
  const [barsPerRound, setBarsPerRound] = useState(4);
  const [progress, setProgress] = useState(100);

  // Handle bar length changes
  const handleBarsChange = (value) => {
    console.debug('[SlotMachine] Bars per round changed:', { to: value });
    setBarsPerRound(value);
    onBarsPerRoundChange(value);
  };

  // Handle word changes based on bar position and barsPerRound setting
  useEffect(() => {
    if (isPlaying && currentBar % barsPerRound === 0 && currentBeat === 0) {
      setIsWordChanging(true);
      setWordCounter(prev => (prev + 1) % shuffledWords.length);
      setTimeout(() => setIsWordChanging(false), 450);
    }
  }, [currentBar, currentBeat, isPlaying, barsPerRound, setWordCounter, setIsWordChanging, shuffledWords.length]);

  // Generate a list of words for the slot machine
  const generateSlotList = (currentWord, nextWord, previousList = null, isNextList = false) => {
    const list = [];
    for (let i = 0; i < SLOT_SIZE; i++) {
      if (i === 1) {
        // Current word at position 1
        // If this is a next list and we have a previous list, use word from position 28
        if (isNextList && previousList) {
          list.push(previousList[SLOT_SIZE - 2]);  // Use word from position 28
        } else {
          list.push(currentWord);
        }
      } else if (i === SLOT_SIZE - 2) {  // position 28
        // Next word at second to last position
        list.push(nextWord);
      } else if (previousList && i === 0) {
        // Match with the third-to-last word from previous list
        list.push(previousList[SLOT_SIZE - 3]);
      } else if (previousList && i === 2) {
        // Match with the last word from previous list
        list.push(previousList[SLOT_SIZE - 1]);
      } else {
        // Random word from shuffledWords, but ensure it's not the current or next word
        let randomWord;
        do {
          const randomIndex = Math.floor(Math.random() * shuffledWords.length);
          randomWord = shuffledWords[randomIndex];
        } while (randomWord === currentWord || randomWord === nextWord);
        list.push(randomWord);
      }
    }
    return list;
  };

  // Get three consecutive words for the slots
  const getThreeWords = (baseIndex) => {
    return [
      shuffledWords[(baseIndex) % shuffledWords.length],
      shuffledWords[(baseIndex + 10) % shuffledWords.length],
      shuffledWords[(baseIndex + 20) % shuffledWords.length]
    ];
  };

  // Create two lists for each slot machine
  const [currentLists, setCurrentLists] = useState(() => {
    const [word1, word2, word3] = getThreeWords(wordCounter);
    const [nextWord1, nextWord2, nextWord3] = getThreeWords(wordCounter + 1);
    return [
      generateSlotList(word1, nextWord1),
      generateSlotList(word2, nextWord2),
      generateSlotList(word3, nextWord3)
    ];
  });

  const [nextLists, setNextLists] = useState(() => {
    const [word1, word2, word3] = getThreeWords(wordCounter + 1);
    const [nextWord1, nextWord2, nextWord3] = getThreeWords(wordCounter + 2);
    return [
      generateSlotList(word1, nextWord1, currentLists[0]),
      generateSlotList(word2, nextWord2, currentLists[1]),
      generateSlotList(word3, nextWord3, currentLists[2])
    ];
  });

  // Handle word changes
  useEffect(() => {
    if (wordCounter !== lastWordCounter) {
      console.debug('[SlotMachine] Word counter changed:', { from: lastWordCounter, to: wordCounter });
      // Start spinning each slot machine with a delay
      [0, 1, 2].forEach((index) => {
        setTimeout(() => {
          setIsSpinning(prev => {
            const newState = [...prev];
            newState[index] = true;
            return newState;
          });
          setIsEndingAnimation(prev => {
            const newState = [...prev];
            newState[index] = false;
            return newState;
          });

          // Start ending animation earlier
          setTimeout(() => {
            setIsEndingAnimation(prev => {
              const newState = [...prev];
              newState[index] = true;
              return newState;
            });
          }, ENDING_ANIMATION_START);
        }, index * SLOT_DELAY);
      });

      // After all animations complete, update everything at once
      setTimeout(() => {
        console.debug('[SlotMachine] Updating lists after animation');
        // Update lists first
        setCurrentLists(nextLists);
        const [word1, word2, word3] = getThreeWords(wordCounter + 1);
        const [nextWord1, nextWord2, nextWord3] = getThreeWords(wordCounter + 2);
        setNextLists([
          generateSlotList(word1, nextWord1, nextLists[0], true),
          generateSlotList(word2, nextWord2, nextLists[1], true),
          generateSlotList(word3, nextWord3, nextLists[2], true)
        ]);

        // Then reset animation states
        setIsSpinning([false, false, false]);
        setIsEndingAnimation([false, false, false]);
      }, TOTAL_DELAY);
      
      setLastWordCounter(wordCounter);
    }
  }, [wordCounter, lastWordCounter, shuffledWords]);

  // Update progress bar based on beat timing
  useEffect(() => {
    if (!isPlaying) {
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
  }, [isPlaying, wordCounter, bpm, barsPerRound]);

  // Reset progress when word changes
  useEffect(() => {
    setProgress(100);
  }, [wordCounter]);

  return (
    <BaseTrainingMode
      modeName={modeName}
      helperText={helperText}
      onReturnToMenu={onReturnToMenu}
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      isLoading={isLoading}
    >
      <div className="slot-machine-container">
        <div className="slot-machines-wrapper">
          {[0, 1, 2].map((index) => (
            <div key={index} className="slot-machine">
              <div className={`slot-window ${isSpinning[index] ? 'spinning' : ''} ${isEndingAnimation[index] ? 'ending-spin' : ''}`}>
                <div className="slot-list">
                  {currentLists[index].map((word, wordIndex) => (
                    <div 
                      key={`${word.word}-${wordIndex}`}
                      className={`slot-item ${wordIndex === 1 ? 'current' : ''}`}
                      data-length={word.word.length > 12 ? 'very-long' : word.word.length > 8 ? 'long' : 'normal'}
                    >
                      {word.word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="slot-machine-progress-container">
          <div className="slot-machine-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {/* Debug information */}
      {isDebugMode && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'rgba(0,0,0,0.5)', 
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          textAlign: 'left'
        }}>
          <div>Current lists:</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {[0, 1, 2].map((index) => (
              <div key={index} style={{ flex: 1 }}>
                <div>Slot {index + 1}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[0, 1, 2].map((index) => (
              <div key={index} style={{ flex: 1 }}>
                {currentLists[index].map((word, wordIndex) => (
                  <div key={wordIndex} style={{ 
                    color: wordIndex === 1 ? '#7c82ff' : 'inherit'
                  }}>
                    [{wordIndex}]: {word.word}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1rem' }}>Next lists:</div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            {[0, 1, 2].map((index) => (
              <div key={index} style={{ flex: 1 }}>
                <div>Slot {index + 1}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[0, 1, 2].map((index) => (
              <div key={index} style={{ flex: 1 }}>
                {nextLists[index].map((word, wordIndex) => (
                  <div key={wordIndex} style={{ 
                    color: wordIndex === 1 ? '#7c82ff' : 'inherit'
                  }}>
                    [{wordIndex}]: {word.word}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="slot-machine-settings">
        <label>
          {translations.barLengthLabel}
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
    </BaseTrainingMode>
  );
};

export default SlotMachine; 