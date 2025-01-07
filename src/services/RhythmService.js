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
 * - Quarter note: One main beat (what we visually show as a "bar" in the UI)
 * - Bar/Measure: 4 quarter notes (traditional music theory definition)
 * - Sixteenth note: 1/4 of a quarter note (used for internal timing)
 */

export class RhythmService {
  // Musical constants
  static QUARTER_NOTES_PER_BAR = 4;  // Number of quarter notes in a bar/measure
  static SIXTEENTH_NOTES_PER_QUARTER = 4;  // Number of sixteenth notes in a quarter note
  static SIXTEENTH_NOTES_PER_BAR = RhythmService.QUARTER_NOTES_PER_BAR * RhythmService.SIXTEENTH_NOTES_PER_QUARTER;
  static TICK_INTERVAL = 25;  // Milliseconds between tick checks

  /**
   * Create a tick function for managing rhythm timing
   * @param {Object} config - Tick configuration
   * @param {number} config.bpm - Beats per minute
   * @param {number} config.totalQuarterNotes - Total quarter notes in sequence
   * @param {Function} config.onTick - Callback for timing updates
   * @param {Function} config.onQuarterNoteChange - Callback for quarter note changes
   * @param {Object} config.nextNoteTimeRef - Reference for next note timing
   * @param {Function} config.setTimerRef - Function to set the timer reference
   * @returns {Function} Tick function
   */
  static createTick({ 
    bpm, 
    totalQuarterNotes, 
    onTick, 
    onQuarterNoteChange, 
    nextNoteTimeRef,
    setTimerRef
  }) {
    const beatInterval = this.calculateBeatInterval(bpm);
    let lastProcessedTime = 0;

    const tickFunction = () => {
      const currentTime = Date.now() / 1000;
      
      // Only process if we haven't already processed this time window
      if (nextNoteTimeRef.current <= currentTime + 0.1 && currentTime > lastProcessedTime) {
        lastProcessedTime = currentTime;
        onTick(prev => {
          const nextBeat = this.getNextSixteenthNote(prev.beat);
          
          // Only update quarter note position on the fourth sixteenth note
          if (this.isQuarterNoteChange(nextBeat)) {
            const nextQuarterNote = this.getNextQuarterNote(prev.bar, totalQuarterNotes);
            const debug = this.formatTimingDebug(prev, nextBeat, nextQuarterNote);
            //console.log(debug.sixteenthNote);
            //console.log(debug.quarterNote);
            if (onQuarterNoteChange) {
              onQuarterNoteChange(nextQuarterNote);
            }
            return { beat: nextBeat, bar: nextQuarterNote };
          }
          
          //console.log(`Sixteenth note: ${prev.beat} -> ${nextBeat}`);
          return { ...prev, beat: nextBeat };
        });

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
    return 60.0 / bpm / RhythmService.SIXTEENTH_NOTES_PER_QUARTER;
  }

  /**
   * Get the next sixteenth note in the sequence
   * @param {number} current - Current sixteenth note (0-3)
   * @returns {number} Next sixteenth note
   */
  static getNextSixteenthNote(current) {
    return (current + 1) % RhythmService.SIXTEENTH_NOTES_PER_QUARTER;
  }

  /**
   * Check if the current sixteenth note marks a quarter note change
   * @param {number} sixteenthNote - Current sixteenth note (0-3)
   * @returns {boolean} True if this marks a quarter note change
   */
  static isQuarterNoteChange(sixteenthNote) {
    return sixteenthNote === 0;
  }

  /**
   * Get the next quarter note position
   * @param {number} current - Current quarter note position
   * @param {number} total - Total quarter notes in the sequence
   * @returns {number} Next quarter note position
   */
  static getNextQuarterNote(current, total) {
    return (current + 1) % total;
  }

  /**
   * Calculate total quarter notes needed for a given mode
   * @param {string} mode - Training mode ID
   * @param {number} quarterNotesPerRound - Quarter notes per round (for slot machine mode)
   * @returns {number} Total quarter notes in the sequence
   */
  static getTotalQuarterNotes(mode, quarterNotesPerRound = 2) {
    switch (mode) {
      case 'two-bar':
        return 8;  // 2 lines * 4 quarter notes
      case 'four-bar':
        return 16;  // 4 lines * 4 quarter notes
      case 'slot-machine':
        return quarterNotesPerRound * 4;  // Convert to quarter notes
      default:
        return 8;  // Default to 2 lines * 4 quarter notes
    }
  }

  /**
   * Format timing values for debug output
   * @param {Object} timing - Current timing state
   * @param {number} timing.beat - Current sixteenth note (0-3)
   * @param {number} timing.bar - Current quarter note position
   * @returns {Object} Formatted timing strings
   */
  static formatTimingDebug(timing, nextBeat, nextQuarterNote) {
    return {
      sixteenthNote: `Sixteenth note: ${timing.beat} -> ${nextBeat}`,
      quarterNote: `Quarter note: ${timing.bar} -> ${nextQuarterNote}`
    };
  }
} 