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
import './RhymeSearchMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import FI__full_dict from '../../data/vocabulary/FI__full_dict';
import { splitIntoSyllables, getSyllableVowelPattern } from '../../utils/wordProcessor';

// Sort methods
const SORT_METHODS = {
  SIMILARITY: 'similarity',
  ALPHABETICAL: 'alphabetical',
  RANDOM: 'random'
};

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

  // Distinctive consonants that heavily influence the word's sound
  const DISTINCTIVE_CONSONANTS = {
    'r': 2.0,  // Rolling R is very distinctive
    's': 1.5,  // Sibilant S is quite distinctive
    'h': 1.2,  // Aspirated H is somewhat distinctive
    'j': 1.2,  // Approximant J is somewhat distinctive
    'v': 1.1   // Voiced V is slightly distinctive
  };

  // Calculate similarity score between two words
  const calculateSimilarity = (word1, word2) => {
    // If words are of very different lengths, they're not similar
    if (Math.abs(word1.length - word2.length) > 3) {
      return 0;
    }

    let matches = 0;
    const len = Math.min(word1.length, word2.length);
    
    // First, check for distinctive consonant presence
    Object.entries(DISTINCTIVE_CONSONANTS).forEach(([consonant, weight]) => {
      const inWord1 = word1.includes(consonant);
      const inWord2 = word2.includes(consonant);
      
      if (inWord1 && inWord2) {
        // Both words have the distinctive consonant
        matches += weight;
      } else if (inWord1 !== inWord2) {
        // One has it, the other doesn't - penalize
        matches -= weight * 0.5;
      }
    });
    
    // Count matching characters from the end (more important for rhyming)
    let endMatches = 0;
    for (let i = 1; i <= len; i++) {
      const char1 = word1[word1.length - i];
      const char2 = word2[word2.length - i];
      
      if (char1 === char2) {
        endMatches += 1;
        // Give extra weight if it's a distinctive consonant
        if (DISTINCTIVE_CONSONANTS[char1]) {
          endMatches += DISTINCTIVE_CONSONANTS[char1] * 0.5;
        }
      } else {
        break;
      }
    }
    matches += endMatches * 2; // End matches are worth double
    
    // Count matching characters from the start
    let startMatches = 0;
    for (let i = 0; i < len; i++) {
      const char1 = word1[i];
      const char2 = word2[i];
      
      if (char1 === char2) {
        startMatches += 0.5;
        // Give extra weight if it's a distinctive consonant
        if (DISTINCTIVE_CONSONANTS[char1]) {
          startMatches += DISTINCTIVE_CONSONANTS[char1] * 0.25;
        }
      } else {
        break;
      }
    }
    matches += startMatches;

    return matches;
  };

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

    if (!syllabified) {
      setError(translations.invalidWordError || 'Invalid word structure');
      setSearchResults(null);
      return;
    }

    const [vowelPattern, syllableCount] = getSyllableVowelPattern(syllabified);
    
    if (!vowelPattern || !syllableCount) {
      setError(translations.invalidPatternError || 'Could not determine vowel pattern');
      setSearchResults(null);
      return;
    }

    // Find exact and extended matches
    const exactPattern = vowelPattern.join('-');
    const searchWordNoDashes = cleanWord.replace(/-/g, '');
    const results = [];

    // Find exact matches
    if (FI__full_dict[exactPattern]) {
      const exactWords = FI__full_dict[exactPattern]
        .map(w => w.replace(/-/g, '')) // Remove dashes from all words
        .filter(w => w !== searchWordNoDashes && w !== cleanWord); // Exclude search word in both forms

      if (exactWords.length > 0) {
        results.push(['exact', { pattern: exactPattern, words: exactWords }]);
      }
    }

    // Find extended matches (patterns that end with the same vowels)
    const extendedWords = new Set();
    const searchVowels = vowelPattern.join('-');
    
    Object.entries(FI__full_dict).forEach(([pattern, words]) => {
      // Skip the exact pattern we already processed
      if (pattern === exactPattern) return;
      
      // Check if this pattern ends with our search pattern
      if (pattern.endsWith(searchVowels)) {
        words.forEach(word => {
          const cleanWord = word.replace(/-/g, '');
          extendedWords.add(cleanWord);
        });
      }
    });

    // Add extended matches if any were found
    if (extendedWords.size > 0) {
      results.push(['extended', { 
        pattern: `*-${exactPattern}`, 
        words: Array.from(extendedWords)
      }]);
    }

    if (results.length > 0) {
      setError('');
      setSearchResults(results);
    } else {
      setError(translations.noMatchesFound || 'No rhyming words found');
      setSearchResults(null);
    }
  };

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      processSearch(searchWord);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchWord]);

  // Shuffle an array using Fisher-Yates algorithm with seed
  const shuffleArray = (array, seed) => {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let temporaryValue, randomIndex;

    // Create a seeded random number generator
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    while (currentIndex !== 0) {
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = shuffled[currentIndex];
      shuffled[currentIndex] = shuffled[randomIndex];
      shuffled[randomIndex] = temporaryValue;
    }

    return shuffled;
  };

  const handleRandomize = () => {
    setSortMethod(SORT_METHODS.RANDOM);
    setRandomSeed(Date.now());
  };

  const sortWords = (words, method, baseWord) => {
    switch (method) {
      case SORT_METHODS.ALPHABETICAL:
        return [...words].sort();
      case SORT_METHODS.SIMILARITY:
        return [...words].sort((a, b) => {
          const simA = calculateSimilarity(baseWord, a);
          const simB = calculateSimilarity(baseWord, b);
          return simB - simA;
        });
      case SORT_METHODS.RANDOM:
        return shuffleArray(words, randomSeed);
      default:
        return words;
    }
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
                  : (translations.extendedMatches || 'Extended matches')}
                <span className="pattern-label">
                  {matchType === 'extended' && '* + '}
                  {pattern.replace('*-', '')}
                </span>
                <span className="word-count">
                  ({words.length} {translations.words || 'words'})
                </span>
              </h3>
              <div className="word-list">
                {sortedWords.slice(0, 50).map((word, index) => (
                  <span key={`${word}-${index}`} className="word">{word}</span>
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