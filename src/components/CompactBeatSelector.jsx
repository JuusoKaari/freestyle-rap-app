import React, { useState, useEffect } from 'react';
import { beats } from '../data/beats';
import BeatSelectModal from './BeatSelectModal';
import audioService from '../services/AudioService';
import '../styles/CompactBeatSelector.css';

const CompactBeatSelector = ({ selectedBeatId, onBeatSelect, isPlaying, onPlayPause, isLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewingBeatId, setPreviewingBeatId] = useState(null);
  const [isLoadingBeat, setIsLoadingBeat] = useState(false);
  const selectedBeat = beats.find(beat => beat.id === selectedBeatId);

  useEffect(() => {
    // Initialize audio service on mount
    audioService.initialize();

    // Cleanup on unmount
    return () => {
      audioService.dispose();
    };
  }, []);

  useEffect(() => {
    const loadBeat = async () => {
      if (selectedBeat && selectedBeat.file) {
        setIsLoadingBeat(true);
        const beatUrl = `/freestyle-rap-app/beats/${selectedBeat.file}`;
        await audioService.loadBeat(beatUrl);
        setIsLoadingBeat(false);
      }
    };

    loadBeat();
  }, [selectedBeat]);

  useEffect(() => {
    if (isPlaying) {
      audioService.playBeat();
    } else {
      audioService.stopBeat();
    }
  }, [isPlaying]);

  const handlePreviewPlay = async (beatId) => {
    if (previewingBeatId === beatId) {
      setPreviewingBeatId(null);
      audioService.stopBeat();
    } else {
      setPreviewingBeatId(beatId);
      const beat = beats.find(b => b.id === beatId);
      if (beat) {
        setIsLoadingBeat(true);
        const beatUrl = `/freestyle-rap-app/beats/${beat.file}`;
        await audioService.loadBeat(beatUrl);
        setIsLoadingBeat(false);
        audioService.playBeat();
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

  return (
    <div className="compact-beat-selector">
      <button 
        className="change-beat-button"
        onClick={() => setIsModalOpen(true)}
      >
        {selectedBeat?.name} - {selectedBeat?.bpm} BPM
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 9l-7 7-7-7" />
        </svg>
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