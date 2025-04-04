import React, { useState, useEffect } from 'react';
import { beats } from '../data/beat_metadata/index';
import BeatSelectModal from './BeatSelectModal';
import BpmSelector from './BpmSelector';
import audioService from '../services/AudioService';
import '../styles/CompactBeatSelector.css';

const CompactBeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, isLoading, currentBpm, onBpmChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [previewingBeatId, setPreviewingBeatId] = useState(null);
  const [isLoadingBeat, setIsLoadingBeat] = useState(false);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);

  useEffect(() => {
    // Initialize audio service on mount
    audioService.initialize();

    // Cleanup on unmount
    return () => {
      if (previewingBeatId) {
        audioService.stopBeat();
      }
    };
  }, []);

  const handlePreviewPlay = async (beatId) => {
    if (previewingBeatId === beatId) {
      setPreviewingBeatId(null);
      audioService.stopBeat();
    } else {
      setPreviewingBeatId(beatId);
      const beat = beats.find(b => b.id === beatId);
      if (beat) {
        setIsLoadingBeat(true);
        // Use the URL for the beat's default BPM
        const beatUrl = beat.files[beat.bpm.toString()];
        if (beatUrl) {
          await audioService.loadBeat(beatUrl);
          setIsLoadingBeat(false);
          audioService.playBeat();
        }
      }
    }
  };

  const handleBeatSelect = (beatId) => {
    if (previewingBeatId) {
      audioService.stopBeat();
      setPreviewingBeatId(null);
    }
    onBeatSelect(beatId);
    setIsModalOpen(false);
  };

  const handleMuteToggle = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    audioService.setBeatVolume(newMuteState ? 0 : 0.8);
  };

  return (
    <div className="compact-beat-selector">
      <button 
        className="current-beat"
        onClick={() => setIsModalOpen(true)}
        disabled={isLoading}
      >
        <span>{selectedBeat?.name || 'Select Beat'}</span>
        <svg viewBox="0 0 24 24" className="dropdown-icon">
          <path
            fill="currentColor"
            d="M7 10l5 5 5-5z"
          />
        </svg>
      </button>

      <BpmSelector
        selectedBeatId={selectedBeatId}
        currentBpm={currentBpm}
        onBpmChange={onBpmChange}
        disabled={isLoading || isPlaying}
      />

      <button
        className={`mute-button ${isMuted ? 'muted' : ''}`}
        onClick={handleMuteToggle}
        disabled={isLoading || !selectedBeat}
      >
        {isMuted ? (
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
            />
          </svg>
        )}
      </button>

      <BeatSelectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (previewingBeatId) {
            audioService.stopBeat();
            setPreviewingBeatId(null);
          }
        }}
        onSelect={handleBeatSelect}
        currentBeatId={selectedBeatId}
        onPreviewPlay={handlePreviewPlay}
        previewingBeatId={previewingBeatId}
        isLoading={isLoadingBeat}
      />
    </div>
  );
};

export default CompactBeatSelector; 