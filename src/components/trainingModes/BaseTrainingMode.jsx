/**
 * Base Training Mode Component
 * =========================
 *
 * Shared layout shell for all training modes (header, start/stop, menu).
 */

import React from 'react';
import { useTranslation } from '../../services/TranslationContext';
import '../../styles/trainingModeStyles/BaseTrainingMode.css';

const BaseTrainingMode = ({
  modeName,
  helperText,
  onReturnToMenu,
  isPlaying,
  onPlayPause,
  isLoading,
  children
}) => {
  const { translate } = useTranslation();

  return (
    <>
      <button className="menu-button" onClick={onReturnToMenu}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        {translate('common.menu')}
      </button>

      <div className="training-mode">
        <div className="mode-header">
          <h2 className="mode-title">{modeName}</h2>
          <p className="mode-description">{helperText}</p>
        </div>

        <button
          className={`start-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
          onClick={onPlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="loading-spinner"></div>
          ) : isPlaying ? translate('common.stop').toUpperCase() : translate('common.start').toUpperCase()}
        </button>

        {children}
      </div>
    </>
  );
};

export default BaseTrainingMode;
