/**
 * Base Training Mode Component
 * =========================
 * 
 * Core component that provides the common structure and functionality
 * for all training modes. Serves as a template for consistent UI/UX.
 * 
 * Features:
 * - Standard header with mode name and description
 * - Return to menu navigation
 * - Start/Stop button with loading state
 * - Flexible content area via children prop
 * 
 * Props:
 * - modeName: Display name of the current mode
 * - helperText: Instructions for the current mode
 * - onReturnToMenu: Callback for menu navigation
 * - isPlaying: Current playback state
 * - onPlayPause: Playback control callback
 * - isLoading: Loading state indicator
 * - children: Content specific to each mode
 * 
 * This component ensures consistent layout and behavior
 * across all training modes while allowing for custom content.
 */

import React from 'react';
import './BaseTrainingMode.css';

const BaseTrainingMode = ({ 
  modeName,
  helperText,
  onReturnToMenu,
  isPlaying,
  onPlayPause,
  isLoading,
  children
}) => {
  return (
    <>
      <button className="menu-button" onClick={onReturnToMenu}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Menu
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
          ) : isPlaying ? 'STOP' : 'START'}
        </button>

        {children}
      </div>
    </>
  );
};

export default BaseTrainingMode; 