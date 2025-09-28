/**
 * RhymeSearchMode Component
 * ==========================
 * 
 * A training mode that allows users to search for rhyming words.
 * This mode helps users find words that rhyme with their input in Finnish.
 * 
 * Key features:
 * - Word input for rhyme search
 * - Display of matching rhyme patterns
 * - Word list for each pattern
 * - Multiple sorting options (alphabetical, similarity, random)
 * 
 * Props:
 * - onReturnToMenu: Callback to return to main menu
 * - modeName: Name of the mode in current language
 * - helperText: Instructions in current language
 * - isPlaying: Whether the mode is currently playing
 * - onPlayPause: Callback to play or pause the mode
 * - isLoading: Whether the mode is currently loading
 */

import React, { useState, useEffect, useMemo } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/trainingModeStyles/RhymeSearchMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import FI__full_dict from '../../data/vocabulary/FI__full_dict';
import { splitIntoSyllables, getSyllableVowelPattern } from '../../utils/wordProcessor';
import { EnhancedRhymeHandler } from '../../services/rhyming/EnhancedRhymeHandler';
import { getCanonicalFullDictionary, canonicalToGroupMap } from '../../services/VocabularyService';
// Sort methods (shared)
import { SORT_METHODS, sortWordsByMode, DISTINCTIVE_WEIGHTS_FI } from '../../services/rhyming/EnhancedRhymeHandler';

const RhymeSearchMode = ({ 
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading,
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'rhyme-search').translations[language];
  
  const [searchWord, setSearchWord] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');
  const [randomSeed, setRandomSeed] = useState(Date.now());
  const [sortMethod, setSortMethod] = useState(SORT_METHODS.SIMILARITY);
  const [collectedGroups, setCollectedGroups] = useState({});

  // Use shared Finnish weights profile for similarity sorting
  const FI_WEIGHTS = DISTINCTIVE_WEIGHTS_FI;

  // Process the input word and find rhyming patterns
  const processSearch = (word) => {
    if (!word) {
      setSearchResults(null);
      setError('');
      return;
    }

    // Remove all whitespace and convert to lowercase
    const cleanWord = word.trim().toLowerCase().replace(/\s+/g, '');
    
    if (!cleanWord) {
      setSearchResults(null);
      setError('');
      return;
    }

    const syllabified = splitIntoSyllables(cleanWord);
    console.log('Syllabified word:', syllabified);

    if (!syllabified) {
      setError(translations.invalidWordError || 'Invalid word structure');
      setSearchResults(null);
      return;
    }

    const [vowelPattern, syllableCount] = getSyllableVowelPattern(syllabified);
    console.log('Vowel pattern:', vowelPattern);
    console.log('Syllable count:', syllableCount);
    
    if (!vowelPattern || !syllableCount) {
      setError(translations.invalidPatternError || 'Could not determine vowel pattern');
      setSearchResults(null);
      return;
    }

    // Find exact and extended matches
    const exactPattern = vowelPattern.join('-');
    const searchWordNoDashes = cleanWord.replace(/-/g, '');
    const results = [];

    // Unified rhyme path
      const fullCanonical = getCanonicalFullDictionary('fi_generic_rap');
      const fullDict = canonicalToGroupMap(fullCanonical);
      const themedDict = {}; // This mode has no themed context; keep empty

      const handler = new EnhancedRhymeHandler('fi');
      const { themed, full } = handler.findUnifiedRhymes(cleanWord, exactPattern, themedDict, fullDict, {
        maxPerBucket: 200, // Allow larger buckets for search mode UI
        minRequired: 1
      });

      // Transform unified results into sections expected by UI
      const exactWords = full
        .filter(r => r.group === exactPattern && !r.isSlant)
        .map(r => r.word.replace(/-/g, ''))
        .filter(w => w !== searchWordNoDashes && w !== cleanWord);

      const extendedWords = full
        .filter(r => r.isSlant && r.group)
        .map(r => r.word.replace(/-/g, ''))
        .filter(w => w !== searchWordNoDashes && w !== cleanWord);

      const partialWords = full
        .filter(r => !r.group)
        .map(r => r.word.replace(/-/g, ''))
        .filter(w => w !== searchWordNoDashes && w !== cleanWord);

      if (exactWords.length > 0) {
        results.push(['exact', { pattern: exactPattern, words: exactWords }]);
      }
      if (extendedWords.length > 0) {
        results.push(['extended', { pattern: `*-${exactPattern}`, words: Array.from(new Set(extendedWords)) }]);
      }
      if (partialWords.length > 0 && results.length === 0) {
        // Only add partial if no exact/extended, matches legacy behavior
        results.push(['partial', { pattern: `*-${vowelPattern.slice(-1).join('-')}`, words: Array.from(new Set(partialWords)) }]);
      }

      if (results.length > 0) {
        setError('');
        setSearchResults(results);
      } else {
        setError(translations.noMatchesFound || 'No rhyming words found');
        setSearchResults(null);
      }
      return;

    // Legacy search path removed; unified handler covers exact/extended/partial
  };

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      processSearch(searchWord);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchWord]);

  // Randomization is provided by the shared utilities

  const handleRandomize = () => {
    setSortMethod(SORT_METHODS.RANDOM);
    setRandomSeed(Date.now());
  };

  const sortWords = (words, method, baseWord) => {
    return sortWordsByMode(words, method, baseWord, { seed: randomSeed, weights: FI_WEIGHTS });
  };

  const renderSortControls = () => (
    <div className="sort-controls">
      {Object.entries(SORT_METHODS).map(([key, value]) => (
        <button
          key={value}
          className={`sort-button ${sortMethod === value ? 'active' : ''}`}
          onClick={() => {
            setSortMethod(value);
            if (value === SORT_METHODS.RANDOM) {
              setRandomSeed(Date.now());
            }
          }}
        >
          {value === SORT_METHODS.SIMILARITY && '🎯'}
          {value === SORT_METHODS.ALPHABETICAL && '🔤'}
          {value === SORT_METHODS.RANDOM && '🎲'}
          {translations[`sort${key.charAt(0) + key.slice(1).toLowerCase()}`] || key}
        </button>
      ))}
    </div>
  );

  // Handle word click to add/remove from collection
  const handleWordClick = (word) => {
    const cleanSearchWord = searchWord.trim().toLowerCase();
    if (!cleanSearchWord) return;

    setCollectedGroups(prev => {
      const newGroups = { ...prev };
      
      // If this word exists in any group, remove it
      let wordFound = false;
      Object.entries(newGroups).forEach(([searchTerm, words]) => {
        if (words.includes(word)) {
          newGroups[searchTerm] = words.filter(w => w !== word);
          if (newGroups[searchTerm].length === 0) {
            delete newGroups[searchTerm];
          }
          wordFound = true;
        }
      });

      // If word wasn't found in any group, add it to current search term's group
      if (!wordFound) {
        if (!newGroups[cleanSearchWord]) {
          newGroups[cleanSearchWord] = [];
        }
        newGroups[cleanSearchWord] = [...newGroups[cleanSearchWord], word];
      }

      return newGroups;
    });
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    const text = Object.entries(collectedGroups)
      .map(([searchTerm, words]) => `${searchTerm} ${words.join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard:', text);
    });
  };

  // Clear collected words
  const handleClear = () => {
    setCollectedGroups({});
  };

  // Check if any words are collected
  const hasCollectedWords = Object.keys(collectedGroups).length > 0;

  // Render collected words container
  const renderCollectedWords = () => {
    if (!hasCollectedWords) return null;

    return (
      <div className="collected-words-container">
        <div className="collected-words">
          {Object.entries(collectedGroups).map(([searchTerm, words]) => (
            <div key={searchTerm} className="collected-words-row">
              <span 
                className="collected-word base-word"
                title={translations.baseWord || "Search word"}
              >
                {searchTerm}
              </span>
              {words.map((word, index) => (
                <span 
                  key={`${word}-${index}`} 
                  className="collected-word"
                  onClick={() => handleWordClick(word)}
                  title={translations.clickToRemove || "Click to remove"}
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
        <div className="collected-words-actions">
          <button 
            className="action-button copy-button"
            onClick={handleCopy}
            title={translations.copyToClipboard || "Copy to clipboard"}
          >
            📋 {translations.copy || "Copy"}
          </button>
          <button 
            className="action-button clear-button"
            onClick={handleClear}
            title={translations.clearAll || "Clear all"}
          >
            🗑️ {translations.clear || "Clear"}
          </button>
        </div>
      </div>
    );
  };

  const renderResults = () => {
    if (!searchResults) return null;

    return (
      <div className="search-results">
        {renderSortControls()}
        {searchResults.map(([matchType, { pattern, words }]) => {
          const sortedWords = sortWords(words, sortMethod, searchWord);
          
          return (
            <div key={pattern} className="result-group">
              <h3 className="pattern-header">
                {matchType === 'exact' 
                  ? (translations.exactMatches || 'Exact matches')
                  : matchType === 'extended'
                    ? (translations.extendedMatches || 'Extended matches')
                    : (translations.partialMatches || 'Partial matches')}
                <span className="pattern-label">
                  {(matchType === 'extended' || matchType === 'partial') && '* + '}
                  {pattern.replace('*-', '')}
                </span>
                <span className="word-count">
                  ({words.length} {translations.words || 'words'})
                </span>
              </h3>
              <div className="word-list">
                {sortedWords.slice(0, 50).map((word, index) => (
                  <span 
                    key={`${word}-${index}`} 
                    className={`word ${collectedGroups[searchWord]?.includes(word) ? 'collected' : ''}`}
                    onClick={() => handleWordClick(word)}
                  >
                    {word}
                  </span>
                ))}
                {sortedWords.length > 50 && (
                  <span className="more-words">
                    +{sortedWords.length - 50} {translations.more || 'more'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
      <div className="rhyme-search">
        {renderCollectedWords()}
        <div className="search-container">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder={translations.searchPlaceholder || "Enter a word to find rhymes..."}
            className="search-input"
          />
          {error && <div className="error-message">{error}</div>}
        </div>
        {renderResults()}
      </div>
    </BaseTrainingMode>
  );
};

export default RhymeSearchMode; 