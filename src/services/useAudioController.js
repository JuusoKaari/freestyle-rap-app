/**
 * Audio Controller Hook (useAudioController.js)
 * ==========================================
 * 
 * React hook that provides high-level control of audio playback and musical timing.
 * Acts as a bridge between UI components and the AudioService, managing state
 * and synchronization of musical events.
 * 
 * Key responsibilities:
 * - Musical timing management (sixteenth notes and quarter notes)
 * - Beat selection and BPM control
 * - Playback state management
 * - Precise timing using setTimeout and time tracking
 * 
 * Musical timing structure:
 * - Smallest unit: Sixteenth note (1/16)
 * - Base unit: Quarter note (1/4)
 * - BPM: Refers to quarter notes per minute
 * 
 * The hook uses refs for precise timing control and state for UI updates,
 * ensuring smooth playback and accurate visual feedback.
 */

import { useState, useEffect, useRef } from 'react';
import audioService from './AudioService';
import { beats } from '../data/beat_metadata/index';

export const useAudioController = () => {
  const [isWebAudioSupported, setIsWebAudioSupported] = useState(true);
  const [bpm, setBpm] = useState(90);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBeatId, setSelectedBeatId] = useState('long_road');
  const [currentSixteenthNote, setCurrentSixteenthNote] = useState(0);
  const [currentQuarterNote, setCurrentQuarterNote] = useState(0);
  
  const timerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);
  const currentSixteenthNoteRef = useRef(0);
  const currentQuarterNoteRef = useRef(0);

  // Keep refs in sync with state
  useEffect(() => {
    currentSixteenthNoteRef.current = currentSixteenthNote;
  }, [currentSixteenthNote]);

  useEffect(() => {
    currentQuarterNoteRef.current = currentQuarterNote;
  }, [currentQuarterNote]);

  // Check Web Audio API support
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        setIsWebAudioSupported(false);
      }
    } catch (error) {
      setIsWebAudioSupported(false);
    }
  }, []);

  // Initialize audio service
  useEffect(() => {
    audioService.initialize();

    // Load default beat
    const defaultBeat = beats.find(beat => beat.id === selectedBeatId);
    if (defaultBeat) {
      const beatUrl = defaultBeat.files[defaultBeat.bpm.toString()];
      if (beatUrl) {
        audioService.loadBeat(beatUrl);
      }
    }

    return () => {
      audioService.dispose();
    };
  }, [selectedBeatId]);

  const stopPlayback = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    audioService.stopBeat();
    setCurrentSixteenthNote(0);
    setCurrentQuarterNote(0);
    currentSixteenthNoteRef.current = 0;
    currentQuarterNoteRef.current = 0;
    setIsPlaying(false);
  };

  const createTick = (totalQuarterNotes, onQuarterNoteChange) => {
    const sixteenthNoteInterval = 60.0 / bpm / 4; // Time for one sixteenth note

    const tickFunction = () => {
      const currentTime = Date.now() / 1000;
      
      if (nextNoteTimeRef.current <= currentTime + 0.1) {
        // Get current states from refs
        let nextSixteenthNote = ((currentSixteenthNoteRef.current + 1) % 4);
        let nextQuarterNote = currentQuarterNoteRef.current;

        // If we're moving to the next quarter note
        if (nextSixteenthNote === 0) {
          nextQuarterNote = (currentQuarterNoteRef.current + 1) % totalQuarterNotes;
          console.log('Quarter note progression:', currentQuarterNoteRef.current, '->', nextQuarterNote);
          if (onQuarterNoteChange) {
            onQuarterNoteChange(nextQuarterNote);
          }
        }

        console.log('Sixteenth note progression:', currentSixteenthNoteRef.current, '->', nextSixteenthNote);
        
        // Update both refs and states
        currentSixteenthNoteRef.current = nextSixteenthNote;
        currentQuarterNoteRef.current = nextQuarterNote;
        setCurrentSixteenthNote(nextSixteenthNote);
        setCurrentQuarterNote(nextQuarterNote);

        nextNoteTimeRef.current += sixteenthNoteInterval;
      }

      timerRef.current = setTimeout(tickFunction, 25);
    };

    return tickFunction;
  };

  useEffect(() => {
    if (!isPlaying && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  const handleBeatSelect = async (beatId) => {
    stopPlayback();
    const selectedBeat = beats.find(beat => beat.id === beatId);
    setSelectedBeatId(beatId);
    
    if (selectedBeat) {
      setBpm(selectedBeat.bpm);
      const beatUrl = selectedBeat.files[selectedBeat.bpm.toString()];
      if (beatUrl) {
        setIsLoading(true);
        await audioService.loadBeat(beatUrl);
        setIsLoading(false);
      }
    }
  };

  const handleBpmChange = async (newBpm) => {
    if (isPlaying) {
      stopPlayback();
    }

    const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
    if (selectedBeat) {
      setBpm(newBpm);
      const beatUrl = selectedBeat.files[newBpm.toString()];
      if (beatUrl) {
        setIsLoading(true);
        await audioService.loadBeat(beatUrl);
        setIsLoading(false);
      }
    }
  };

  return {
    isWebAudioSupported,
    bpm,
    isPlaying,
    isLoading,
    selectedBeatId,
    currentBeat: currentSixteenthNote,  // Keep old name for backward compatibility
    currentBar: currentQuarterNote,     // Keep old name for backward compatibility
    handleBeatSelect,
    handleBpmChange,
    handlePlayPause: async (totalBars, onBarChange) => {
      if (isPlaying) {
        await stopPlayback();
        return;
      }

      setIsLoading(true);

      // Initialize audio context if needed
      await audioService.initialize();

      // Start everything from the beginning
      const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
      if (!selectedBeat) {
        setIsLoading(false);
        return;
      }

      // Reset states
      setCurrentSixteenthNote(0);
      setCurrentQuarterNote(0);

      // Start audio
      audioService.playBeat();
      setIsLoading(false);
      setIsPlaying(true);

      // Start visual timing
      setTimeout(() => {
        const sixteenthNoteInterval = 60.0 / bpm / 4;
        nextNoteTimeRef.current = (Date.now() / 1000) + sixteenthNoteInterval;
        
        const tick = createTick(totalBars, onBarChange);
        tick();
      }, 50);
    },
    stopPlayback
  };
}; 