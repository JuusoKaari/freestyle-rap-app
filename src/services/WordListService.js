/**
 * Word List Service
 * ================
 *
 * Generates shuffled word lists with rhyme groups from canonical vocabulary data.
 */

import { EnhancedRhymeHandler } from './rhyming/EnhancedRhymeHandler';
import { getCanonicalVocabulary, getCanonicalFullDictionary, canonicalToGroupMap } from './VocabularyService';
import { splitWord } from '../utils/wordUtils';
import { isEnglishVocabulary } from '../utils/languageUtils';

const getRandomItems = (array, n) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
};

const spreadOutWords = (words, lookbackWindow = 5) => {
  if (words.length === 0) return [];

  const isWordObjects = typeof words[0] === 'object' && words[0].word;
  const wordStrings = isWordObjects ? words.map((w) => w.word) : words;

  const wordsCopy = [...wordStrings];
  let shuffled = [];
  let remainingWords = new Set(wordsCopy);

  let currentWord = wordsCopy[Math.floor(Math.random() * wordsCopy.length)];
  shuffled.push(currentWord);
  remainingWords.delete(currentWord);

  while (remainingWords.size > 0) {
    const possibleWords = Array.from(remainingWords).sort(() => Math.random() - 0.5);
    let selectedWord = null;

    for (const candidate of possibleWords) {
      if (shuffled.slice(-lookbackWindow).every((prev) =>
        Math.abs(wordsCopy.indexOf(candidate) - wordsCopy.indexOf(prev)) > lookbackWindow
      )) {
        selectedWord = candidate;
        break;
      }
    }

    if (!selectedWord) {
      selectedWord = possibleWords[0];
    }

    shuffled.push(selectedWord);
    remainingWords.delete(selectedWord);
  }

  if (isWordObjects) {
    const wordMap = new Map(words.map((w) => [w.word, w]));
    return shuffled.map((word) => wordMap.get(word));
  }

  return shuffled;
};

export const generateWordList = async ({
  minWordsInGroup = 1,
  vocabulary,
  includeRhymes = false,
  syllableRange = { min: 1, max: 10 },
  language = 'fi'
}) => {
  const vocabData = canonicalToGroupMap(getCanonicalVocabulary(vocabulary));
  if (!vocabData) return [];

  const filteredVocab = {};
  Object.entries(vocabData).forEach(([pattern, words]) => {
    const syllableCount = pattern.split('-').length;
    if (syllableCount >= syllableRange.min && syllableCount <= syllableRange.max) {
      filteredVocab[pattern] = words;
    }
  });

  const allWords = [];
  Object.entries(filteredVocab).forEach(([pattern, words]) => {
    words.forEach((word) => {
      const { display, phonetic } = splitWord(word);
      allWords.push({
        word: display.replace(/-/g, '').replace(/_/g, ' '),
        phonetic: phonetic.replace(/_/g, ''),
        group: pattern
      });
    });
  });

  if (allWords.length === 0) return [];

  if (!includeRhymes) {
    const wordObjects = allWords.map(({ word, phonetic, group }) => ({
      word,
      phonetic,
      group,
      rhymes: []
    }));
    return spreadOutWords(wordObjects);
  }

  const isEnglish = isEnglishVocabulary(vocabulary);
  const rhymeHandler = new EnhancedRhymeHandler(isEnglish ? 'en' : 'fi');
  const fullDict = canonicalToGroupMap(getCanonicalFullDictionary(vocabulary));

  const processedWords = allWords.map(({ word, phonetic, group }) => {
    if (!group) return { word, phonetic, group, rhymes: [] };

    const { themed, full } = rhymeHandler.findUnifiedRhymes(
      word,
      group,
      filteredVocab,
      fullDict,
      { maxPerBucket: 6, minRequired: minWordsInGroup }
    );

    const filterBySyllables = (arr) => arr.filter((r) => {
      const rhymePattern = r.group;
      if (!rhymePattern) return true;
      const syllableCount = rhymePattern.split('-').length;
      return syllableCount >= syllableRange.min && syllableCount <= syllableRange.max;
    });

    const merged = [...filterBySyllables(themed), ...filterBySyllables(full)];
    const shuffledAll = getRandomItems(merged, merged.length);
    const selected = shuffledAll.slice(0, 12);

    return { word, phonetic, group, rhymes: selected };
  });

  const wordsWithRhymes = processedWords.filter(
    (item) => item.rhymes.length >= minWordsInGroup - 1
  );

  if (wordsWithRhymes.length === 0) return [];

  return spreadOutWords(wordsWithRhymes);
};
