/**
 * Rhythm Service
 * =============
 * 
 * Service responsible for handling musical timing and rhythm calculations.
 * Provides utilities for managing beats, bars, and musical time.
 * 
 * Key responsibilities:
 * - BPM and timing calculations
 * - Beat and bar progression logic
 * - Musical time unit conversions
 * - Rhythm-related constants
 * - Tick creation and timing management
 * 
 * Terminology:
 * - Beat: One quarter note (main pulse)
 * - Bar: One measure (4 beats/quarter notes)
 * - Sixteenth note: 1/4 of a beat (used for internal timing precision)
 */

export class RhythmService {
  // Musical constants
  static BEATS_PER_BAR = 4;  // Number of beats (quarter notes) in a bar/measure
  static SIXTEENTH_NOTES_PER_BEAT = 4;  // Number of sixteenth notes in one beat
  static SIXTEENTH_NOTES_PER_BAR = RhythmService.BEATS_PER_BAR * RhythmService.SIXTEENTH_NOTES_PER_BEAT;
  static TICK_INTERVAL = 25;  // Milliseconds between tick checks

  /**
   * Create a tick function for managing rhythm timing
   * @param {Object} config - Tick configuration
   * @param {number} config.bpm - Beats per minute
   * @param {number} config.totalBeats - Total beats (quarter notes) in sequence
   * @param {Function} config.onTick - Callback for timing updates
   * @param {Object} config.nextNoteTimeRef - Reference for next note timing
   * @param {Function} config.setTimerRef - Function to set the timer reference
   * @returns {Function} Tick function
   */
  static createTick({ 
    bpm, 
    totalBeats, 
    onTick,
    nextNoteTimeRef,
    setTimerRef
  }) {
    const beatInterval = this.calculateBeatInterval(bpm);
    let lastProcessedTime = 0;

    // Initialize timing state
    let timingState = {
      sixteenthNote: 0,
      beat: 0
    };

    const tickFunction = () => {
      const currentTime = Date.now() / 1000;
      
      // Only process if we haven't already processed this time window
      if (nextNoteTimeRef.current <= currentTime + 0.1 && currentTime > lastProcessedTime) {
        lastProcessedTime = currentTime;
        
        // Update timing state
        const nextSixteenth = this.getNextSixteenthNote(timingState.sixteenthNote);
        
        // Only update beat position on the fourth sixteenth note
        if (this.isBeatChange(nextSixteenth)) {
          const nextBeat = (timingState.beat + 1) % totalBeats;
          timingState = { 
            sixteenthNote: nextSixteenth, 
            beat: nextBeat 
          };
        } else {
          timingState = { 
            ...timingState, 
            sixteenthNote: nextSixteenth 
          };
        }

        // Call onTick with the new state
        onTick(timingState);
        nextNoteTimeRef.current += beatInterval;
      }

      setTimerRef(setTimeout(tickFunction, this.TICK_INTERVAL));
    };

    return tickFunction;
  }

  /**
   * Calculate the interval between sixteenth notes based on BPM
   * @param {number} bpm - Beats per minute
   * @returns {number} Interval in seconds
   */
  static calculateBeatInterval(bpm) {
    return 60.0 / bpm / RhythmService.SIXTEENTH_NOTES_PER_BEAT;
  }

  /**
   * Get the next sixteenth note in the sequence
   * @param {number} current - Current sixteenth note (0-3)
   * @returns {number} Next sixteenth note
   */
  static getNextSixteenthNote(current) {
    return (current + 1) % RhythmService.SIXTEENTH_NOTES_PER_BEAT;
  }

  /**
   * Check if the current sixteenth note marks a new beat
   * @param {number} sixteenthNote - Current sixteenth note (0-3)
   * @returns {boolean} True if this marks a new beat
   */
  static isBeatChange(sixteenthNote) {
    return sixteenthNote === 0;
  }

  /**
   * Format timing values for debug output
   * @param {Object} timing - Current timing state
   * @param {number} timing.sixteenthNote - Current sixteenth note (0-3)
   * @param {number} timing.beat - Current beat number
   * @returns {Object} Formatted timing strings
   */
  static formatTimingDebug(timing, nextSixteenth, nextBeat) {
    return {
      sixteenthNote: `Sixteenth note: ${timing.sixteenthNote} -> ${nextSixteenth}`,
      beat: `Beat: ${timing.beat} -> ${nextBeat}`
    };
  }
} 