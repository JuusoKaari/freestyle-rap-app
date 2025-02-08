// Utility functions for Plausible Analytics tracking

/**
 * Track a custom event in Plausible
 * @param {string} eventName - Name of the event
 * @param {Object} props - Additional properties to track
 */
export const trackEvent = (eventName, props = {}) => {
  if (window.plausible) {
    window.plausible(eventName, { props });
  }
};

/**
 * Track training mode start with vocabulary info
 * @param {string} modeId - ID of the training mode
 * @param {string} vocabularyName - Name of the vocabulary being used
 */
export const trackTrainingStart = (modeId, vocabularyName) => {
  trackEvent('Training Started', { 
    mode: modeId,
    vocabulary: vocabularyName
  });
};

/**
 * Track vocabulary selection
 * @param {string} vocabularyName - Name of the selected vocabulary
 */
export const trackVocabularySelection = (vocabularyName) => {
  trackEvent('Vocabulary Selected', { vocabulary: vocabularyName });
};

// Initialize session tracking
let sessionStartTime = Date.now();
let lastActiveTime = Date.now();
let isPageVisible = true;
let sessionTrackingInterval;

// Track session duration
const trackSessionDuration = () => {
  const currentTime = Date.now();
  const sessionDuration = Math.round((currentTime - sessionStartTime) / 1000); // Convert to seconds
  const activeTime = Math.round((currentTime - lastActiveTime) / 1000);
  
  // Only track if the user has been active in the last minute
  if (activeTime < 60) {
    trackEvent('Session Duration', { 
      duration_seconds: sessionDuration,
      duration_minutes: Math.round(sessionDuration / 60)
    });
  }
};

// Update last active time when user interacts with the page
const updateLastActiveTime = () => {
  lastActiveTime = Date.now();
};

// Handle page visibility changes
const handleVisibilityChange = () => {
  if (document.hidden) {
    isPageVisible = false;
    trackSessionDuration(); // Track duration when page becomes hidden
  } else {
    isPageVisible = true;
    lastActiveTime = Date.now(); // Reset active time when page becomes visible
  }
};

// Initialize session tracking
const initializeSessionTracking = () => {
  // Track session duration every minute if page is visible
  sessionTrackingInterval = setInterval(() => {
    if (isPageVisible) {
      trackSessionDuration();
    }
  }, 60000); // Every minute

  // Listen for visibility changes
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Listen for user activity
  ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach(eventName => {
    document.addEventListener(eventName, updateLastActiveTime, { passive: true });
  });

  // Track duration when user leaves/refreshes the page
  window.addEventListener('beforeunload', trackSessionDuration);
};

// Start session tracking when the service is imported
initializeSessionTracking(); 