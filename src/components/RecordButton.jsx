import React, { useState, useEffect } from 'react';
import recordingService from '../services/RecordingService';
import { useTranslation } from '../services/TranslationContext';
import '../styles/RecordButton.css';

const RecordButton = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(false);
  const { translate } = useTranslation();

  useEffect(() => {
    // Check for microphone permission on mount
    recordingService.requestMicrophonePermission()
      .then(hasPermission => {
        setHasMicPermission(hasPermission);
      });
  }, []);

  const handleRecordClick = async () => {
    if (!hasMicPermission) {
      const hasPermission = await recordingService.requestMicrophonePermission();
      if (!hasPermission) return;
      setHasMicPermission(true);
    }

    if (isRecording) {
      const recording = await recordingService.stopRecording();
      setIsRecording(false);
      if (onRecordingComplete) {
        onRecordingComplete(recording);
      }
    } else {
      recordingService.startRecording();
      setIsRecording(true);
    }
  };

  return (
    <button 
      className={`record-button ${isRecording ? 'recording' : ''}`}
      onClick={handleRecordClick}
      title={isRecording ? translate('recording.stop') : translate('recording.start')}
    >
      <div className="record-icon">
        <div className="record-dot" />
      </div>
    </button>
  );
};

export default RecordButton; 