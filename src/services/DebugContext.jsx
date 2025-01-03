/**
 * Debug Context Service
 * ===================
 * 
 * React Context provider for managing debug mode functionality across the application.
 * Provides developer tools and additional features for testing and development.
 * 
 * Features:
 * - Toggle debug mode with Ctrl+Shift+D
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
});

export const DebugProvider = ({ children }) => {
  const [isDebugMode, setIsDebugMode] = useState(false);

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

  return (
    <DebugContext.Provider value={{ isDebugMode, toggleDebugMode }}>
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