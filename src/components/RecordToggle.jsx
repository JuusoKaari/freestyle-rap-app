import React from 'react';
import '../styles/RecordToggle.css';
import { useTranslation } from '../services/TranslationContext';

const RecordToggle = ({ isRecordingEnabled, onToggle }) => {
  const { translate } = useTranslation();

  return (
    <button 
      className={`record-toggle ${isRecordingEnabled ? 'enabled' : ''}`}
      onClick={onToggle}
      title={isRecordingEnabled ? translate('recording.enabled') : translate('recording.disabled')}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" fill="currentColor" className="record-dot" />
      </svg>
      <span>{translate('recording.toggle')}</span>
    </button>
  );
};

export default RecordToggle; 