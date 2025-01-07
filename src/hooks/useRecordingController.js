/**
 * Recording Controller Hook
 * =======================
 * 
 * Custom hook that manages recording functionality, including state management,
 * localStorage persistence, and recording controls.
 * 
 * Key responsibilities:
 * - Managing recording state
 * - Handling microphone permissions
 * - Saving and loading recordings from localStorage
 * - Coordinating recording start/stop with audio playback
 */

import { useState, useEffect } from 'react';
import recordingService from '../services/RecordingService';
import audioService from '../services/AudioService';

export const useRecordingController = () => {
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false);

  // Load saved recordings from localStorage on mount
  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings');
    if (savedRecordings) {
      console.log('Loading saved recordings from localStorage');
      setRecordings(JSON.parse(savedRecordings));
    }
  }, []);

  // Save recordings to localStorage when updated
  useEffect(() => {
    console.log('Saving recordings to localStorage:', recordings);
    localStorage.setItem('recordings', JSON.stringify(recordings));
  }, [recordings]);

  const handleRecordingToggle = async () => {
    const newState = !isRecordingEnabled;
    
    if (newState) {
      // Initialize audio context if needed
      await audioService.initialize();
      
      // Request microphone permission
      const hasPermission = await recordingService.requestMicrophonePermission();
      if (!hasPermission) {
        console.error('Microphone permission denied');
        return;
      }
    } else {
      // Stop recording if it's active
      if (recordingService.isRecording) {
        const recording = await recordingService.stopRecording();
        if (recording) {
          console.log('Recording completed, saving...');
          const newRecording = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            ...recording
          };
          setRecordings(prev => [...prev, newRecording]);
          console.log('New recording saved:', newRecording);
        }
      }
    }
    
    setIsRecordingEnabled(newState);
  };

  const handlePlayPauseWithRecording = async (isPlaying, isTraining, metadata, onPlayPause) => {
    // If we're stopping, handle recording cleanup
    if (isPlaying && isRecordingEnabled) {
      console.log('Recording enabled, stopping recording...');
      const recording = await recordingService.stopRecording();
      if (recording) {
        console.log('Recording completed, saving...');
        const newRecording = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          ...metadata,
          ...recording
        };
        setRecordings(prev => [...prev, newRecording]);
        console.log('New recording saved:', newRecording);
      }
    }

    // If we're starting, initialize recording
    if (!isPlaying && isRecordingEnabled && isTraining) {
      console.log('Recording enabled and in training mode, starting recording...');
      recordingService.startRecording();
    }

    // Handle playback
    await onPlayPause();
  };

  return {
    isRecordingEnabled,
    recordings,
    isRecordingsModalOpen,
    setIsRecordingsModalOpen,
    handleRecordingToggle,
    handlePlayPauseWithRecording
  };
}; 