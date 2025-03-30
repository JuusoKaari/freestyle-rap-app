/**
 * Audio Controller Hook
 * ===================
 * 
 * Custom hook that manages audio playback state and controls.
 * Provides a React-friendly interface to the AudioService.
 * 
 * Key responsibilities:
 * - Managing audio playback state
 * - Handling beat selection and BPM changes
 * - Coordinating audio initialization and cleanup
 * - Managing playback timing and synchronization
 * 
 * Terminology:
 * - beat: One quarter note
 * - bar: One measure (4 beats/quarter notes)
 */

import { useState, useEffect, useRef } from 'react';
import audioService from '../services/AudioService';
import { RhythmService } from '../services/RhythmService';
import { beats } from '../data/beat_metadata';

// Default beat configuration
const DEFAULT_BEAT = {
  id: 'dreamy_trap',
  bpm: 75
};

export const useAudioController = () => {
  const [isWebAudioSupported, setIsWebAudioSupported] = useState(true);
  const [bpm, setBpm] = useState(DEFAULT_BEAT.bpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBeatId, setSelectedBeatId] = useState(DEFAULT_BEAT.id);
  const [timing, setTiming] = useState({ 
    currentBeat: 0,  // Current beat within the bar (0-3)
    currentBar: 0    // Current bar number
  });
  
  const timerRef = useRef(null);
  const nextNoteTimeRef = useRef(0);

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

  // Initialize audio service and load default beat
  useEffect(() => {
    const initAudio = async () => {
      await audioService.initialize();

      // Load default beat
      const defaultBeat = beats.find(beat => beat.id === DEFAULT_BEAT.id);
      if (defaultBeat) {
        const beatUrl = defaultBeat.files[DEFAULT_BEAT.bpm.toString()];
        if (beatUrl) {
          await audioService.loadBeat(beatUrl);
        }
      }
    };

    initAudio().catch(console.error);

    return () => {
      audioService.dispose();
    };
  }, []);

  const stopPlayback = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    audioService.stopBeat();
    setTiming({ currentBeat: 0, currentBar: 0 });
    setIsPlaying(false);
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

  const handlePlayPause = async (totalBars, onBarChange) => {
    if (isPlaying) {
      stopPlayback();
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
    setTiming({ currentBeat: 0, currentBar: 0 });

    // Start audio
    audioService.playBeat();
    setIsLoading(false);
    setIsPlaying(true);

    // Start visual timing
    setTimeout(() => {
      const beatInterval = RhythmService.calculateBeatInterval(bpm);
      nextNoteTimeRef.current = (Date.now() / 1000) + beatInterval;
      
      // Convert total bars to total beats for RhythmService
      const totalBeats = totalBars * RhythmService.BEATS_PER_BAR;
      
      console.debug('[AudioController] Starting playback:', {
        bpm,
        totalBars,
        totalBeats,
        beatInterval
      });

      const tick = RhythmService.createTick({
        bpm,
        totalBeats,
        onTick: (newTiming) => {
          // Convert absolute beat number to bar and beat within bar
          const absoluteBeat = newTiming.beat;
          const currentBar = Math.floor(absoluteBeat / RhythmService.BEATS_PER_BAR);
          const currentBeat = absoluteBeat % RhythmService.BEATS_PER_BAR;
          
          setTiming({ currentBeat, currentBar });
          
          // Only call onBarChange when we start a new bar (beat 0)
          if (currentBeat === 0 && absoluteBeat > 0) {
            onBarChange(currentBar);
          }
        },
        nextNoteTimeRef,
        setTimerRef: (timer) => { timerRef.current = timer; }
      });
      tick();
    }, 50);
  };

  return {
    isWebAudioSupported,
    bpm,
    isPlaying,
    isLoading,
    selectedBeatId,
    currentBeat: timing.currentBeat,  // Beat within the current bar (0-3)
    currentBar: timing.currentBar,    // Current bar number
    handleBeatSelect,
    handleBpmChange,
    handlePlayPause,
    stopPlayback
  };
}; 