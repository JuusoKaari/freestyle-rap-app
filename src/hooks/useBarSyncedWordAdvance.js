/**
 * useBarSyncedWordAdvance Hook
 * ============================
 * Advances the word once when playback is on beat 0 of a bar that lines up
 * with barsPerRound. A new callback identity does not advance again, and the
 * word-change timer keeps running after the beat moves on.
 */

import { useEffect, useRef } from 'react';

export const useBarSyncedWordAdvance = ({
  isPlaying = true,
  beatInBar,
  currentBar,
  barsPerRound,
  shuffledWordsLength,
  setWordCounter,
  setIsWordChanging,
  onAdvance,
  animationDuration = 450,
}) => {
  const onAdvanceRef = useRef(onAdvance);
  const setWordCounterRef = useRef(setWordCounter);
  const setIsWordChangingRef = useRef(setIsWordChanging);
  const timerRef = useRef(null);
  const advancedForBoundaryRef = useRef(false);

  onAdvanceRef.current = onAdvance;
  setWordCounterRef.current = setWordCounter;
  setIsWordChangingRef.current = setIsWordChanging;

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    const onBoundary = isPlaying
      && shuffledWordsLength > 0
      && barsPerRound > 0
      && currentBar % barsPerRound === 0
      && beatInBar === 0;

    if (!onBoundary) {
      advancedForBoundaryRef.current = false;
      return;
    }

    if (advancedForBoundaryRef.current) return;
    advancedForBoundaryRef.current = true;

    setIsWordChangingRef.current?.(true);
    if (onAdvanceRef.current) {
      onAdvanceRef.current();
    } else {
      setWordCounterRef.current?.((prev) => (prev + 1) % shuffledWordsLength);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setIsWordChangingRef.current?.(false);
    }, animationDuration);
  }, [
    beatInBar,
    currentBar,
    isPlaying,
    barsPerRound,
    shuffledWordsLength,
    animationDuration,
  ]);
};
