/**
 * RhymeMapMode Component
 * ==========================
 * 
 * A training mode that displays a visual grid of English phoneme rhyme patterns.
 * This mode helps users understand the structure of English rhyming patterns.
 * 
 * Key features:
 * - Grid display of phoneme patterns
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

import React, { useState, useEffect } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import './RhymeMapMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import EN__full_dict from '../../data/vocabulary/EN__full_dict';

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
  const [currentView, setCurrentView] = useState('root');
  const [patternCounts, setPatternCounts] = useState({});
  const [maxPatternCount, setMaxPatternCount] = useState(0);
  const [modalPattern, setModalPattern] = useState(null);
  const [modalWords, setModalWords] = useState([]);

  // English phonemes structure - single level for endings
  const vowelStructure = [
    'AA', 'AE', 'AH', 'AO', 'AW', 'AY',
    'EH', 'ER', 'EY',
    'IH', 'IY',
    'OW', 'OY',
    'UH', 'UW'
  ];

  // Process dictionary to get patterns and word counts
  useEffect(() => {
    const patternData = Object.entries(EN__full_dict).map(([pattern, words]) => ({
      pattern,
      wordCount: words.length,
      words
    }));
    setPatterns(patternData);

    // Pre-calculate pattern counts and max count
    const counts = {};
    vowelStructure.forEach(phone => {
      counts[phone] = patternData.filter(({ pattern }) => {
        const parts = pattern.split('-');
        // Get the last part and remove stress numbers (0,1,2)
        const lastPart = parts[parts.length - 1].toUpperCase().replace(/[0-9]/g, '');
        return lastPart === phone.toUpperCase();
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
        const randomizedWords = [...patternData.words]
          .sort(() => Math.random() - 0.5)
          .slice(0, 50);
        setModalWords(randomizedWords);
      }
    } else {
      setModalWords([]);
    }
  }, [modalPattern]);

  // Get patterns that end with a specific phoneme
  const getPatternsEndingWith = (suffix) => {
    return patterns.filter(({ pattern }) => {
      const parts = pattern.split('-');
      // Get the last part and remove stress numbers
      const lastPart = parts[parts.length - 1].toUpperCase().replace(/[0-9]/g, '');
      return lastPart === suffix.toUpperCase();
    });
  };

  // Calculate brightness based on pattern count (0-100)
  const getButtonBrightness = (count) => {
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

  // Render pattern details with stress numbers
  const renderPatternDetails = (pattern) => {
    if (!pattern) return null;
    
    // Get all patterns that match this pattern when stress numbers are removed
    const basePattern = pattern.replace(/[0-9]/g, '');
    const matchingPatterns = patterns.filter(p => 
      p.pattern.replace(/[0-9]/g, '') === basePattern
    );

    // Combine all words from matching patterns
    const allWords = matchingPatterns.reduce((acc, p) => [...acc, ...p.words], []);
    const uniqueWords = [...new Set(allWords)]; // Remove duplicates if any
    const randomizedWords = [...uniqueWords]
      .sort(() => Math.random() - 0.5)
      .slice(0, 50);

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
        <h2>{basePattern}</h2>
        <div className="word-list">
          {randomizedWords.map((word, index) => (
            <span key={index} className="word">{word.replace(/-/g, '')}</span>
          ))}
          {uniqueWords.length > 50 && (
            <span className="more-words">
              +{uniqueWords.length - 50} more
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (currentView === 'root') {
      // Show flat list of phonemes
      return (
        <div className="pattern-grid root-view">
          {vowelStructure.map(phone => {
            const count = patternCounts[phone] || 0;
            const brightness = getButtonBrightness(count);
            return (
              <div 
                key={phone}
                className={`pattern-card ${count === 0 ? 'empty' : ''}`}
                style={{
                  '--button-brightness': `${brightness}%`,
                  background: `hsl(0, 0%, var(--button-brightness))`
                }}
                onClick={() => {
                  if (count > 0) {
                    setSelectedPattern(null);
                    setCurrentView(phone);
                  }
                }}
              >
                <h3><span className="ending-dots">...</span>{phone}</h3>
                <span className="pattern-count">{count} {translations.patterns}</span>
              </div>
            );
          })}
        </div>
      );
    } else {
      // Show patterns for selected ending phoneme
      const patternsForSuffix = getPatternsEndingWith(currentView);
      const maxWordCount = Math.max(
        ...Object.values(
          patternsForSuffix.reduce((acc, { pattern, words }) => {
            const basePattern = pattern.replace(/[0-9]/g, '');
            if (!acc[basePattern]) {
              acc[basePattern] = new Set(words).size;
            }
            return acc;
          }, {})
        )
      );

      // Group patterns by their base form (without stress numbers)
      const groupedPatterns = patternsForSuffix.reduce((acc, { pattern, words }) => {
        // Remove stress numbers from the entire pattern
        const basePattern = pattern.replace(/[0-9]/g, '');
        if (!acc[basePattern]) {
          acc[basePattern] = {
            patterns: [pattern],
            words: new Set(words)
          };
        } else {
          acc[basePattern].patterns.push(pattern);
          words.forEach(word => acc[basePattern].words.add(word));
        }
        return acc;
      }, {});

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
            {Object.entries(groupedPatterns).map(([basePattern, { patterns, words }]) => {
              const uniqueWordCount = words.size;
              const brightness = uniqueWordCount === 0 ? 20 : 20 + (40 * uniqueWordCount / maxWordCount);
              const firstPattern = patterns[0]; // Keep one original pattern for reference
              return (
                <div 
                  key={basePattern}
                  className={`pattern-card ${selectedPattern === firstPattern ? 'selected' : ''}`}
                  style={{
                    '--button-brightness': `${brightness}%`,
                    background: `hsl(0, 0%, var(--button-brightness))`
                  }}
                  onClick={() => {
                    setSelectedPattern(firstPattern);
                    setModalPattern(firstPattern);
                  }}
                >
                  <h3>{basePattern}</h3>
                  <span className="word-count">{uniqueWordCount} {translations.wordCount.toLowerCase()}</span>
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
      onPlayPause();
    } else {
      setModalPattern(null);
      onPlayPause();
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