import { RhymeHandlerBase } from './RhymeHandlerBase';
import { splitWord, getDisplayWord } from '../utils/wordUtils';

/**
 * Finnish-specific rhyme handler
 * Implements Finnish-specific rules for rhyming including:
 * - Long vs short vowel distinctions
 * - First syllable stress patterns
 */
export class FinnishRhymeHandler extends RhymeHandlerBase {
  // Helper to check if patterns match considering single/double vowel endings
  #doVowelPatternsMatch(pattern1, pattern2) {
    // If patterns are identical, they match
    if (pattern1 === pattern2) return true;

    // Check if one ends with single vowel and other with double of same vowel
    const vowels = ['A', 'E', 'I', 'O', 'U', 'Y', 'Ä', 'Ö'];
    for (const vowel of vowels) {
      if ((pattern1 === vowel && pattern2 === vowel + vowel) ||
          (pattern2 === vowel && pattern1 === vowel + vowel)) {
        return true;
      }
    }

    return false;
  }

  // Helper function to randomly select N items from an array
  #getRandomItems(array, n) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  findExactRhymes(word, group, wordList, isFullDict) {
    const rhymingWords = wordList[group] || [];
    const normalizedWord = this.normalizeWord(word);
    
    // Get exact rhymes from the same vowel group
    return rhymingWords
      .filter(rhyme => {
        const normalizedRhyme = this.normalizeWord(rhyme);
        
        // Don't include the original word
        if (normalizedRhyme === normalizedWord) return false;
        
        // For themed vocabulary, filter out words that share too many starting letters
        if (!isFullDict) {
          const commonPrefix = normalizedWord.split('').reduce((count, char, i) => {
            return normalizedRhyme[i] === char ? count + 1 : count;
          }, 0);
          return commonPrefix < 4;
        }
        
        return true;
      })
      .map(rhyme => ({
        word: getDisplayWord(rhyme),
        group: group
      }));
  }

  findSlantRhymes(word, group, wordList, isFullDict) {
    // Get the vowel pattern ending (last two parts for Finnish)
    const groupParts = group.split('-');
    const endPattern = groupParts.slice(-2).join('-');

    // Find all groups that end with a matching pattern
    const slantGroups = Object.keys(wordList).filter(otherGroup => {
      if (otherGroup === group) return false;

      const otherParts = otherGroup.split('-');
      const otherEndPattern = otherParts.slice(-2).join('-');

      // Check if the patterns match considering single/double vowel endings
      if (endPattern === otherEndPattern) return true;

      // If patterns differ only in last part, check if they match with single/double vowel rule
      const mainParts = endPattern.split('-');
      const otherParts2 = otherEndPattern.split('-');
      if (mainParts.length === otherParts2.length) {
        // Check if all parts except last match exactly
        for (let i = 0; i < mainParts.length - 1; i++) {
          if (mainParts[i] !== otherParts2[i]) return false;
        }
        // Check if last parts match considering single/double vowels
        return this.#doVowelPatternsMatch(
          mainParts[mainParts.length - 1], 
          otherParts2[otherParts2.length - 1]
        );
      }

      return false;
    });

    const normalizedWord = this.normalizeWord(word);

    // Get words from all matching groups
    return slantGroups.flatMap(slantGroup => 
      (wordList[slantGroup] || [])
        .filter(rhyme => {
          const normalizedRhyme = this.normalizeWord(rhyme);
          
          // Don't include the original word
          if (normalizedRhyme === normalizedWord) return false;
          
          // For themed vocabulary, filter out words that share too many starting letters
          if (!isFullDict) {
            const commonPrefix = normalizedWord.split('').reduce((count, char, i) => {
              return normalizedRhyme[i] === char ? count + 1 : count;
            }, 0);
            return commonPrefix < 4;
          }
          
          return true;
        })
        .map(rhyme => ({
          word: getDisplayWord(rhyme),
          group: slantGroup
        }))
    );
  }

  findRhymingWords(word, group, wordList, maxResults = 5, isFullDict = false) {
    // First get exact rhymes from the same vowel group
    const exactRhymes = this.findExactRhymes(word, group, wordList, isFullDict);

    // If we have enough exact rhymes, return random selection
    if (exactRhymes.length >= maxResults) {
      return this.#getRandomItems(exactRhymes, maxResults);
    }

    // If we need more rhymes, look for slant rhymes to fill remaining slots
    const remainingSlots = maxResults - exactRhymes.length;
    const allSlantRhymes = this.findSlantRhymes(word, group, wordList, isFullDict);
    const selectedSlantRhymes = this.#getRandomItems(allSlantRhymes, remainingSlots);

    // Return exact rhymes first, then fill with slant rhymes
    return [...exactRhymes, ...selectedSlantRhymes];
  }

  areExactRhymeGroups(group1, group2) {
    const parts1 = group1.split('-');
    const parts2 = group2.split('-');
    
    // Must have same number of parts for Finnish
    if (parts1.length !== parts2.length) return false;
    
    // All parts except last must match exactly
    for (let i = 0; i < parts1.length - 1; i++) {
      if (parts1[i] !== parts2[i]) return false;
    }

    // Last parts can match with single/double vowel rule
    return this.#doVowelPatternsMatch(
      parts1[parts1.length - 1], 
      parts2[parts2.length - 1]
    );
  }

  normalizeWord(word) {
    const { phonetic } = splitWord(word);
    // For Finnish, we keep the word mostly as is, just clean up formatting
    return phonetic.replace(/-/g, '').replace(/_/g, ' ').toLowerCase();
  }
} 