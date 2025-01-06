/**
 * Debug Context Service
 * ===================
 * 
 * React Context provider for managing debug mode functionality across the application.
 * Provides developer tools and additional features for testing and development.
 * 
 * Features:
 * - Toggle debug mode with Ctrl+Shift+D
 * - Toggle debug mode with 5 rapid taps on mobile
 * - Persistent debug state in localStorage
 * - Additional UI elements in debug mode
 * - Word list inspection tools
 * - Manual word navigation in training modes
 * 
 * Usage:
 * - Wrap application with DebugProvider
 * - Use useDebug hook to access debug state
 * - Access isDebugMode and toggleDebugMode function
 * 
 * Debug mode enables additional features for development and testing,
 * while remaining hidden from regular users.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const DebugContext = createContext({
  isDebugMode: false,
  toggleDebugMode: () => {},
  SecretTapArea: () => {},
});

export const DebugProvider = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = React.useRef(null);

  useEffect(() => {
    // Secret key combination handler (Ctrl+Shift+D)
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsDebugMode(prev => {
          const newMode = !prev;
          console.log(`Debug mode ${newMode ? 'enabled' : 'disabled'}`);
          return newMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Store debug mode in localStorage
  useEffect(() => {
    const storedDebugMode = localStorage.getItem('debugMode') === 'true';
    setIsDebugMode(storedDebugMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('debugMode', isDebugMode);
  }, [isDebugMode]);

  const toggleDebugMode = () => setIsDebugMode(prev => !prev);

  // Secret tap area component for mobile debug access
  const SecretTapArea = React.memo(() => {
    const handleTap = () => {
      console.log('Version number tapped!');
      setTapCount(prev => {
        const newCount = prev + 1;
        console.log(`Tap count: ${newCount}/5`);
        
        // Clear existing timeout
        if (tapTimeoutRef.current) {
          clearTimeout(tapTimeoutRef.current);
        }

        // Set new timeout to reset tap count after 2 seconds
        tapTimeoutRef.current = setTimeout(() => {
          console.log('Tap count reset due to timeout');
          setTapCount(0);
        }, 2000);

        // Check if we reached 5 taps
        if (newCount >= 5) {
          console.log('5 taps reached! Toggling debug mode...');
          setTapCount(0);
          toggleDebugMode();
        }

        return newCount;
      });
    };

    useEffect(() => {
      const versionElement = document.querySelector('.version-number');
      console.log('Looking for version number element:', versionElement ? 'Found' : 'Not found');
      if (versionElement) {
        console.log('Adding click listener to version number');
        versionElement.addEventListener('click', handleTap);
        return () => {
          console.log('Removing click listener from version number');
          versionElement.removeEventListener('click', handleTap);
        };
      }
    }, []);

    // No need to render anything as we're using the existing version number element
    return null;
  });

  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebugMode, SecretTapArea }}>
      {children}
    </DebugContext.Provider>
  );
};

export const useDebug = () => {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}; 