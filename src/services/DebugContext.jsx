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