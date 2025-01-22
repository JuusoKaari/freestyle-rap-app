// Finnish word list processor
const VOWELS = 'aeiouyäö';
const DIPHTHONGS = [
  'ai', 'ei', 'oi', 'ui', 'yi', 'äi', 'öi',
  'au', 'eu', 'iu', 'ou', 'ey', 'iy', 'äy',
  'öy', 'ie', 'yö', 'uo'
];

const MIN_SYLLABLES = 1;
const MAX_SYLLABLES = 10;

// Split word into syllables
export function splitIntoSyllables(word) {
  let result = '';
  let i = 0;

  while (i < word.length) {
    const char = word[i];
    result += char;

    // If character is a vowel
    if (VOWELS.includes(char)) {
      const nextChars = word.slice(i + 1, i + 4); // Check next three characters
      
      if (nextChars.length === 3 && nextChars.split('').every(c => !VOWELS.includes(c))) {
        // If next three characters are consonants, add hyphen between second and third consonant
        result += nextChars[0] + nextChars[1] + '-';
        i += 2; // Skip first two consonants
      } else if (nextChars.length >= 2 && !VOWELS.includes(nextChars[0]) && !VOWELS.includes(nextChars[1])) {
        // If next two characters are consonants, add hyphen between them
        result += nextChars[0] + '-';
        i += 1; // Skip first consonant
      } else if (i + 1 < word.length && VOWELS.includes(word[i + 1])) {
        // If next character is vowel but doesn't form diphthong or double vowel, add hyphen
        if (!DIPHTHONGS.includes(word.slice(i, i + 2)) && char !== word[i + 1]) {
          result += '-';
        }
      } else if (i + 1 < word.length && !VOWELS.includes(word[i + 1])) {
        // If next character is not a vowel, add hyphen
        result += '-';
      }
    }

    i += 1;
  }

  // Remove last hyphen if it's followed by a single consonant
  let splitResult = result.split('-');
  if (splitResult.length > 1 && 
      splitResult[splitResult.length - 1].length === 1 && 
      !VOWELS.includes(splitResult[splitResult.length - 1])) {
    splitResult[splitResult.length - 2] += splitResult[splitResult.length - 1];
    splitResult.pop();
  }

  // Process syllables with special vowel cases
  const finalSyllables = [];
  for (const syllable of splitResult) {
    // Count vowels in syllable
    const syllableVowels = syllable.split('').filter(c => VOWELS.includes(c));
    
    // Skip words with syllables that have no vowels
    if (syllableVowels.length === 0) {
      return null;
    }
    
    // Handle syllables with 3 or more vowels
    if (syllableVowels.length >= 3) {
      // Find indices of all vowels in the syllable
      const vowelIndices = syllable.split('').map((c, i) => VOWELS.includes(c) ? i : -1).filter(i => i !== -1);
      
      if (vowelIndices.length === 3) {
        // Check for "yö" case
        if (syllable.slice(vowelIndices[1], vowelIndices[2] + 1) === 'yö') {
          // Split between 1st and 2nd vowel
          const splitPoint = vowelIndices[1];
          finalSyllables.push(syllable.slice(0, splitPoint));
          finalSyllables.push(syllable.slice(splitPoint));
        } else {
          // Split between 2nd and 3rd vowel
          const splitPoint = vowelIndices[2];
          finalSyllables.push(syllable.slice(0, splitPoint));
          finalSyllables.push(syllable.slice(splitPoint));
        }
      } else {
        // More than 3 vowels, skip this word
        return null;
      }
    } else {
      finalSyllables.push(syllable);
    }
  }

  return finalSyllables.join('-');
}

// Get vowels from a syllable
function getVowelsOnly(syllable, isLastSyllable = false) {
  // Check if syllable has exactly one vowel and a single consonant after it
  // Skip this special rule for the last syllable
  if (!isLastSyllable) {
    const vowelsInSyllable = syllable.split('').filter(char => VOWELS.includes(char));
    if (vowelsInSyllable.length === 1) {
      const vowelIndex = syllable.indexOf(vowelsInSyllable[0]);
      // Check if there's any consonants after the vowel
      if (vowelIndex < syllable.length - 1 && 
          syllable.slice(vowelIndex + 1).split('').every(c => !VOWELS.includes(c))) {
        // Return the vowel twice to match rhyming pattern
        return vowelsInSyllable[0].repeat(2);
      }
    }
  }
  
  // Default case: return all vowels in sequence
  return syllable.split('').filter(char => VOWELS.includes(char)).join('');
}

// Get syllable vowel pattern for a word
export function getSyllableVowelPattern(word) {
  const syllables = word.split('-');
  const syllableCount = syllables.length;
  
  if (syllableCount < MIN_SYLLABLES || syllableCount > MAX_SYLLABLES) {
    return [null, null];
  }
  
  // Process each syllable, marking the last one
  const vowelPatterns = syllables.map((syllable, i) => 
    getVowelsOnly(syllable, i === syllables.length - 1)
  );
  
  return [vowelPatterns, syllableCount];
}

// Process a list of words into a vocabulary format
export function processWordList(wordList) {
  const processedWords = new Map(); // Using Map to store unique patterns
  const skippedWords = [];

  for (const word of wordList) {
    const cleanWord = word.trim().toLowerCase();
    if (!cleanWord || cleanWord.length < 2) {
      skippedWords.push({ word, reason: 'too_short' });
      continue;
    }

    const syllabified = splitIntoSyllables(cleanWord);
    if (!syllabified) {
      skippedWords.push({ word, reason: 'syllabification_failed' });
      continue;
    }

    const [vowelPattern, syllableCount] = getSyllableVowelPattern(syllabified);
    if (!vowelPattern || !syllableCount) {
      skippedWords.push({ word, reason: 'invalid_pattern' });
      continue;
    }

    const patternKey = vowelPattern.join('-');
    if (!processedWords.has(patternKey)) {
      processedWords.set(patternKey, {
        pattern: vowelPattern,
        syllableCount,
        words: []
      });
    }

    processedWords.get(patternKey).words.push({
      word: cleanWord,
      syllables: syllabified.split('-')
    });
  }

  if (skippedWords.length > 0) {
    console.log('Skipped words during processing:', skippedWords);
  }

  // Convert to array format matching the app's vocabulary structure
  const result = Array.from(processedWords.values())
    .map(({ pattern, syllableCount, words }) => ({
      pattern,
      syllableCount,
      words: words.map(w => ({
        word: w.word,
        syllables: w.syllables
      }))
    }));

  if (result.length === 0) {
    console.warn('No valid word patterns found in the word list');
  }

  return result;
}

// Create a vocabulary object from a word list
export function createCustomVocabulary(wordList, name = 'Custom Vocabulary') {
  const processedData = processWordList(wordList);
  const timestamp = Date.now();
  
  return {
    id: `custom-vocabulary-${timestamp}`,
    name,
    description: `Custom`,
    icon: '📝',
    data: processedData
  };
} 