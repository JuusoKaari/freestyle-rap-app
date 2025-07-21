import { RhymeHandlerBase } from './RhymeHandlerBase';
import { splitWord, getDisplayWord } from '../../utils/wordUtils';

/**
 * English-specific rhyme handler
 * Works with vowel-only patterns (e.g., "AE-AH-AH")
 */
export class EnglishRhymeHandler extends RhymeHandlerBase {
  // Helper to randomly select items
  #getRandomItems(array, n) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, n);
  }

  findExactRhymes(word, group, wordList) {
    const rhymingWords = wordList[group] || [];
    const normalizedWord = this.normalizeWord(word);
    
    return rhymingWords
      .filter(rhyme => this.normalizeWord(rhyme) !== normalizedWord)
      .map(rhyme => ({
        word: getDisplayWord(rhyme),
        group: group
      }));
  }

  findSlantRhymes(word, group, wordList) {
    // Get the vowel pattern ending (last two parts)
    const groupParts = group.split('-');
    const endPattern = groupParts.slice(-2).join('-');

    // Find all groups that end with a matching pattern
    const slantGroups = Object.keys(wordList).filter(otherGroup => {
      if (otherGroup === group) return false;

      const otherParts = otherGroup.split('-');
      const otherEndPattern = otherParts.slice(-2).join('-');
      return endPattern === otherEndPattern;
    });

    const normalizedWord = this.normalizeWord(word);

    return slantGroups.flatMap(slantGroup => 
      (wordList[slantGroup] || [])
        .filter(rhyme => this.normalizeWord(rhyme) !== normalizedWord)
        .map(rhyme => ({
          word: getDisplayWord(rhyme),
          group: slantGroup
        }))
    );
  }

  findRhymingWords(word, group, wordList, maxResults = 5) {
    // First get exact rhymes from the same vowel group
    const exactRhymes = this.findExactRhymes(word, group, wordList);

    // If we have enough exact rhymes, return random selection
    if (exactRhymes.length >= maxResults) {
      return this.#getRandomItems(exactRhymes, maxResults);
    }

    // If we need more rhymes, look for slant rhymes to fill remaining slots
    const remainingSlots = maxResults - exactRhymes.length;
    const allSlantRhymes = this.findSlantRhymes(word, group, wordList);
    const selectedSlantRhymes = this.#getRandomItems(allSlantRhymes, remainingSlots);

    // Return exact rhymes first, then fill with slant rhymes
    return [...exactRhymes, ...selectedSlantRhymes];
  }

  areExactRhymeGroups(group1, group2) {
    return group1 === group2;
  }

  normalizeWord(word) {
    const { phonetic } = splitWord(word);
    return phonetic.toLowerCase();
  }
} 