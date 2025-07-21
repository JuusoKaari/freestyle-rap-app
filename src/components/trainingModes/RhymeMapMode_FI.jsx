/**
 * RhymeMapMode Component
 * ==========================
 * 
 * A training mode that displays a visual grid of vowel rhyme patterns.
 * This mode helps users understand the structure of Finnish rhyming patterns.
 * 
 * Key features:
 * - Grid display of vowel patterns
 * - Pattern filtering and search
 * - Word count for each pattern
 * - Detailed view of words for selected pattern
 * 
 * Props:
 * - onReturnToMenu: Callback to return to main menu
 * - modeName: Name of the mode in current language
 * - helperText: Instructions in current language
 * - isPlaying: Whether the mode is currently playing
 * - onPlayPause: Callback to play or pause the mode
 * - isLoading: Whether the mode is currently loading
 * - bpm: Current beats per minute
 */

import React, { useState, useEffect, useRef } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './RhymeMapMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import FI__full_dict from '../../data/vocabulary/FI__full_dict';

const RhymeMapMode = ({ 
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading,
  bpm
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'rhyme-map').translations[language];
  
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [currentView, setCurrentView] = useState('root'); // 'root' or specific ending
  const [patternCounts, setPatternCounts] = useState({});
  const [maxPatternCount, setMaxPatternCount] = useState(0);
  const [modalPattern, setModalPattern] = useState(null);
  const [modalWords, setModalWords] = useState([]);

  // Process dictionary to get patterns and word counts
  useEffect(() => {
    const patternData = Object.entries(FI__full_dict).map(([pattern, words]) => ({
      pattern,
      wordCount: words.length,
      words
    }));
    setPatterns(patternData);

    // Pre-calculate pattern counts and max count
    const counts = {};
    Object.values(vowelStructure).flat().forEach(combo => {
      counts[combo] = patternData.filter(({ pattern }) => {
        const parts = pattern.split('-');
        const lastPart = parts[parts.length - 1].toUpperCase();
        return lastPart === combo.toUpperCase();
      }).length;
    });
    setPatternCounts(counts);
    setMaxPatternCount(Math.max(...Object.values(counts)));
  }, []);

  // Update modal words when pattern changes
  useEffect(() => {
    if (modalPattern) {
      const patternData = patterns.find(p => p.pattern === modalPattern);
      if (patternData) {
        // Randomize words only when modal is opened
        const randomizedWords = [...patternData.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
        setModalWords(randomizedWords);
      }
    } else {
      setModalWords([]); // Clear words when modal closes
    }
  }, [modalPattern]);

  // Get unique last vowel combinations (e.g., "AA", "EE", "II")
  const getLastVowelCombinations = () => {
    const combinations = new Set();
    patterns.forEach(({ pattern }) => {
      const parts = pattern.split('-');
      const lastPart = parts[parts.length - 1].toUpperCase();
      combinations.add(lastPart);
    });
    return Array.from(combinations).sort();
  };

  // Hardcoded vowel structure
  const vowelStructure = {
    'A': ['A', 'AA', 'AE', 'AI', 'AO', 'AU', 'AY', 'AÄ', 'AÖ'],
    'E': ['E', 'EE', 'EA', 'EI', 'EO', 'EU', 'EY', 'EÄ', 'EÖ'],
    'I': ['I', 'II', 'IA', 'IE', 'IO', 'IU', 'IY', 'IÄ', 'IÖ'],
    'O': ['O', 'OO', 'OA', 'OE', 'OI', 'OU', 'OY', 'OÄ', 'OÖ'],
    'U': ['U', 'UU', 'UA', 'UE', 'UI', 'UO', 'UY', 'UÄ', 'UÖ'],
    'Y': ['Y', 'YY', 'YA', 'YE', 'YI', 'YO', 'YU', 'YÄ', 'YÖ'],
    'Ä': ['Ä', 'ÄÄ', 'ÄA', 'ÄE', 'ÄI', 'ÄO', 'ÄU', 'ÄY', 'ÄÖ'],
    'Ö': ['Ö', 'ÖÖ', 'ÖA', 'ÖE', 'ÖI', 'ÖO', 'ÖU', 'ÖY', 'ÖÄ']
  };

  // Get patterns that end with a specific combination
  const getPatternsEndingWith = (suffix) => {
    return patterns.filter(({ pattern }) => {
      const parts = pattern.split('-');
      const lastPart = parts[parts.length - 1].toUpperCase();
      return lastPart === suffix.toUpperCase();
    });
  };

  // Calculate brightness based on pattern count (0-100)
  const getButtonBrightness = (count) => {
    // Calculate brightness: 60% for max count, 20% for 0 count
    const brightness = count === 0 ? 20 : 20 + (40 * count / maxPatternCount);
    return brightness;
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalPattern && !e.target.closest('.pattern-details-modal')) {
        setModalPattern(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalPattern]);

  const renderPatternDetails = (pattern) => {
    if (!pattern) return null;
    const patternData = patterns.find(p => p.pattern === pattern);
    if (!patternData) return null;

    return (
      <div 
        className="pattern-details-modal"
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1080px'
        }}
      >
        <button 
          className="modal-close-button"
          onClick={(e) => {
            e.stopPropagation();
            setModalPattern(null);
          }}
        >
          ×
        </button>
        <h2>{pattern}</h2>
        <div className="word-list">
          {modalWords.map((word, index) => (
            <span key={index} className="word">{word.replace(/-/g, '')}</span>
          ))}
          {patternData.words.length > 50 && (
            <span className="more-words">
              +{patternData.words.length - 50} more
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (currentView === 'root') {
      // Show structured vowel combinations
      return (
        <div className="pattern-grid root-view structured">
          {Object.entries(vowelStructure).map(([baseVowel, combinations]) => (
            <div key={baseVowel} className="vowel-group">
              {combinations.map(combo => {
                const count = patternCounts[combo] || 0;
                const brightness = getButtonBrightness(count);
                return (
                  <div 
                    key={combo}
                    className={`pattern-card ${count === 0 ? 'empty' : ''}`}
                    style={{
                      '--button-brightness': `${brightness}%`,
                      background: `hsl(0, 0%, var(--button-brightness))`
                    }}
                    onClick={() => {
                      if (count > 0) {
                        setSelectedPattern(null);
                        setCurrentView(combo);
                      }
                    }}
                  >
                    <h3><span className="ending-dots">...</span>{combo}</h3>
                    <span className="pattern-count">{count} {translations.patterns}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    } else {
      // Show patterns for selected ending combination
      const patternsForSuffix = getPatternsEndingWith(currentView);
      const maxWordCount = Math.max(...patternsForSuffix.map(p => p.wordCount));

      return (
        <>
          <div className="navigation-header">
            <button 
              className="back-button" 
              onClick={() => {
                setSelectedPattern(null);
                setCurrentView('root');
                setModalPattern(null);
              }}
            >
              {translations.backButton}
            </button>
          </div>
          <div className="pattern-grid">
            {patternsForSuffix.map(({ pattern, wordCount, words }) => {
              const brightness = wordCount === 0 ? 20 : 20 + (40 * wordCount / maxWordCount);
              return (
                <div 
                  key={pattern}
                  className={`pattern-card ${selectedPattern === pattern ? 'selected' : ''}`}
                  style={{
                    '--button-brightness': `${brightness}%`,
                    background: `hsl(0, 0%, var(--button-brightness))`
                  }}
                  onClick={() => {
                    setSelectedPattern(pattern);
                    setModalPattern(pattern);
                  }}
                >
                  <h3>{pattern.toUpperCase()}</h3>
                  <span className="word-count">{wordCount} {translations.wordCount.toLowerCase()}</span>
                </div>
              );
            })}
          </div>
        </>
      );
    }
  };

  // Handle play/pause with reset
  const handlePlayPause = () => {
    if (isPlaying) {
      onPlayPause(); // Just stop if we're playing
    } else {
      setModalPattern(null); // Close any open modal
      onPlayPause(); // Start playing
    }
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
      <div className="rhyme-map">
        <div className="content-container">
          {renderContent()}
          {modalPattern && renderPatternDetails(modalPattern)}
        </div>
      </div>
    </BaseTrainingMode>
  );
};

export default RhymeMapMode; 