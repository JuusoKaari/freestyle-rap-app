/**
 * Accumulates visible time spent inside a training mode.
 * Time on the main menu, and time while the tab is hidden, is not counted.
 * The returned ref is updated when a session segment ends, including the
 * moment training stops, so callers can read it in an effect that runs after.
 */

import { useEffect, useRef } from 'react';

export const useTrainingActivity = (isTraining) => {
  const totalMsRef = useRef(0);

  useEffect(() => {
    if (!isTraining) return undefined;

    let segmentStart = document.hidden ? null : Date.now();

    const commitSegment = () => {
      if (segmentStart == null) return;
      totalMsRef.current += Date.now() - segmentStart;
      segmentStart = null;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        commitSegment();
      } else if (segmentStart == null) {
        segmentStart = Date.now();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      commitSegment();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isTraining]);

  return totalMsRef;
};
