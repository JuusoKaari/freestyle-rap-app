import React, { useState } from 'react';
import '../styles/RecordingsModal.css';
import { useTranslation } from '../services/TranslationContext';
import { trainingModes } from '../data/trainingModes';
import { beats } from '../data/beat_metadata/index';
import audioService from '../services/AudioService';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';

const RecordingsModal = ({ isOpen, onClose, recordings }) => {
  const { translate, language } = useTranslation();
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentVocalsAudio, setCurrentVocalsAudio] = useState(null);

  const getModeName = (modeId) => {
    const mode = trainingModes.find(m => m.id === modeId);
    return mode ? mode.translations[language].name : modeId;
  };

  const getVocabularyName = (vocabularyId) => {
    const vocabularies = getVocabularies(vocabularyId.split('_')[0]);
    const vocabulary = vocabularies.find(v => v.id === vocabularyId);
    return vocabulary ? vocabulary.name : vocabularyId;
  };

  const stopPlayback = () => {
    audioService.stopBeat();
    if (currentVocalsAudio) {
      currentVocalsAudio.pause();
      currentVocalsAudio.currentTime = 0;
      setCurrentVocalsAudio(null);
    }
    setPlayingIndex(null);
  };

  const handlePlay = async (recording, index) => {
    if (playingIndex === index) {
      stopPlayback();
      return;
    }

    setIsLoading(true);

    // Stop any current playback
    if (playingIndex !== null) {
      stopPlayback();
    }

    // Load and play the beat
    const beat = beats.find(b => b.id === recording.beatId);
    if (beat) {
      // Use the URL for the recording's BPM from the files object
      const beatUrl = beat.files[recording.bpm.toString()];
      if (beatUrl) {
        await audioService.loadBeat(beatUrl);
        
        // Create audio element for the vocals
        const vocalsAudio = new Audio(recording.url);
        vocalsAudio.addEventListener('ended', () => {
          stopPlayback();
        });

        // Start vocals first with a negative offset to compensate for recording latency
        vocalsAudio.play();
        setCurrentVocalsAudio(vocalsAudio);
        
        // Start beat after a delay to sync with vocals
        setTimeout(() => {
          audioService.playBeat();
        }, 300); // 300ms compensation for recording latency
        
        setPlayingIndex(index);
      }
    }

    setIsLoading(false);
  };

  // Clean up on modal close
  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{translate('recordings.title')}</h2>
          <button className="close-button" onClick={handleClose}>
            {translate('common.close')}
          </button>
        </div>
        <div className="recordings-list">
          {recordings.length === 0 ? (
            <div className="empty-message">
              {translate('recordings.empty')}
            </div>
          ) : (
            [...recordings]
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((recording, index) => {
              const beat = beats.find(b => b.id === recording.beatId);
              return (
                <div key={recording.id} className="recording-item">
                  <div className="recording-info">
                    <div className="recording-date">
                      {new Date(recording.timestamp).toLocaleString()}
                    </div>
                    <div className="recording-details">
                      <div className="recording-beat">
                        {beat?.name || 'Unknown Beat'} ({recording.bpm} BPM)
                      </div>
                      {recording.mode && (
                        <div className="recording-mode">
                          {getModeName(recording.mode)}
                        </div>
                      )}
                      {recording.vocabulary && (
                        <div className="recording-vocabulary">
                          {getVocabularyName(recording.vocabulary)}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className={`play-button ${playingIndex === index ? 'playing' : ''}`}
                    onClick={() => handlePlay(recording, index)}
                    disabled={isLoading}
                  >
                    {playingIndex === index ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <rect x="6" y="6" width="12" height="12" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="7,5 19,12 7,19" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingsModal; 