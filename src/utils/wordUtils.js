/**
 * Utility functions for word processing
 */

/**
 * Split a word into display and phonetic versions
 * @param {string} word - Word in display;phonetic format
 * @returns {Object} Object with display and phonetic properties
 */
export const splitWord = (word) => {
  const parts = word.split(';');
  return {
    display: parts[0],
    phonetic: parts[1] || parts[0] // If no phonetic version, use display
  };
};

/**
 * Get display version of a word
 * @param {string} word - Word to get display version of
 * @returns {string} Display version of word
 */
export const getDisplayWord = (word) => {
  const { display } = splitWord(word);
  return display.replace(/-/g, '').replace(/_/g, ' ');
};

/**
 * Count common prefix length between two words
 * @param {string} a - First word
 * @param {string} b - Second word
 * @returns {number} Length of common prefix
 */
export const commonPrefixLength = (a, b) => {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}; 