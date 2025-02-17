import React from 'react';
import { useTranslation } from '../services/TranslationContext';
import './AudioToggle.css';

/**
 * A toggle switch component for enabling/disabling word audio playback
 */
export const AudioToggle = ({ isEnabled, isAvailable, onToggle }) => {
  const { language } = useTranslation();
  
  // Don't render anything if audio is not available
  if (!isAvailable) return null;

  const label = language === 'fi' 
    ? 'Sano sanat ääneen' 
    : 'Say words out loud';

  return (
    <div className="audio-toggle">
      <span className="toggle-label">{label}</span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={onToggle}
        />
        <span className="toggle-slider"></span>
      </label>
    </div>
  );
}; 