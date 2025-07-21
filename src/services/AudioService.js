/**
 * Audio Service (AudioService.js)
 * ==============================
 * 
 * Core audio playback service that handles Web Audio API interactions.
 * Manages the low-level audio operations including audio context,
 * gain nodes, and beat playback.
 * 
 * Key responsibilities:
 * - Audio context initialization and management
 * - Audio node routing (master, beat, vocals)
 * - Beat loading and playback control
 * - Volume control for different audio channels
 * 
 * The service uses a singleton pattern to ensure only one audio context
 * exists throughout the application. It handles buffer-based audio
 * playback for high-quality sound output and proper timing.
 * 
 * Audio routing structure:
 * Beat Source → Beat Gain → Master Gain → Destination
 * Vocals Source → Vocals Gain → Master Gain → Destination
 */

import { logError, logWarning, handleCriticalError } from './ErrorService.js';

class AudioService {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.beatGainNode = null;
    this.vocalsGainNode = null;
    this.currentBeatSource = null;
    this.beatBuffer = null;
    this.isPlaying = false;
    
    // Initialization status tracking
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
  }

  async initialize() {
    // Return existing promise if initialization is already in progress
    if (this.isInitializing && this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized && this.audioContext) {
      // Still check if context needs to be resumed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return Promise.resolve();
    }

    // Set initialization flag and create promise
    this.isInitializing = true;
    this.initializationPromise = this._performInitialization();

    try {
      await this.initializationPromise;
      this.isInitialized = true;
      return Promise.resolve();
    } catch (error) {
      logError('AudioService', 'Initialization failed', error);
      throw error;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  async _performInitialization() {
    try {
      // Create AudioContext only if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create gain nodes
        this.masterGainNode = this.audioContext.createGain();
        this.beatGainNode = this.audioContext.createGain();
        this.vocalsGainNode = this.audioContext.createGain();

        // Set initial volumes
        this.masterGainNode.gain.value = 1.0;
        this.beatGainNode.gain.value = 0.8;
        this.vocalsGainNode.gain.value = 1.0;

        // Connect nodes
        this.beatGainNode.connect(this.masterGainNode);
        this.vocalsGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.audioContext.destination);

        console.log('AudioService initialized successfully');
      }

      // Resume context if it was suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        console.log('🎧 AudioContext is suspended, attempting to resume...');
        
        // Add timeout to prevent indefinite hanging
        const resumePromise = this.audioContext.resume();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AudioContext resume timeout')), 5000)
        );
        
        try {
          await Promise.race([resumePromise, timeoutPromise]);
          console.log('🎧 AudioContext resumed successfully, new state:', this.audioContext.state);
        } catch (error) {
          logError('AudioService', 'Failed to resume AudioContext', error);
          // Continue anyway, the context might work despite the resume failing
        }
      } else {
        console.log('🎧 AudioContext state is:', this.audioContext.state);
      }
    } catch (error) {
      console.error('Error during AudioService initialization:', error);
      // Reset state on failure
      this.isInitialized = false;
      this.audioContext = null;
      this.masterGainNode = null;
      this.beatGainNode = null;
      this.vocalsGainNode = null;
      throw error;
    }
  }

  // Getter to check initialization status
  get initialized() {
    return this.isInitialized && this.audioContext !== null;
  }

  // Getter to check if initialization is in progress
  get initializing() {
    return this.isInitializing;
  }

  async loadBeat(url) {
    try {
      // First check if the URL is valid
      if (!url) {
        throw new Error('Invalid beat URL');
      }

      if (!this.audioContext) {
        throw new Error('AudioContext not initialized');
      }

      // Create an Audio element to check format support
      const audio = new Audio();
      audio.crossOrigin = "anonymous"; // Handle CORS if needed
      
      // Load the audio file first
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the content type
      const contentType = response.headers.get('content-type');

      // Get the array buffer
      const arrayBuffer = await response.arrayBuffer();
      
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio file');
      }

      // Defensive check: Re-verify AudioContext still exists before using it
      // (prevents race condition during component unmount/mount)
      if (!this.audioContext) {
        throw new Error('AudioContext was disposed during loading');
      }

      // Decode the audio data
      try {
        this.beatBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return true;
      } catch (decodeError) {
        logError('AudioService', 'Failed to decode audio data', decodeError);
        // Try alternative loading method if decode fails
        return await this.loadBeatFallback(url);
      }
    } catch (error) {
      console.error('🔊 Error loading beat:', error);
      return false;
    }
  }

  async loadBeatFallback(url) {
    try {
      // Check if AudioContext still exists before attempting fallback
      if (!this.audioContext) {
        console.error('🔊 AudioContext disposed, skipping fallback loading');
        return false;
      }

      // Fallback method using Audio element
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          console.error('🔊 Fallback loading timed out');
          resolve(false);
        }, 10000); // 10 second timeout

        audio.addEventListener('canplaythrough', async () => {
          clearTimeout(timeout);
          
          try {
            // Double-check AudioContext still exists
            if (!this.audioContext) {
              console.error('🔊 AudioContext disposed during fallback loading');
              resolve(false);
              return;
            }
            
            // Simplified fallback - just return false and let user try again
            // The complex offline context method has compatibility issues
            console.error('🔊 Fallback method not implemented - please retry audio loading');
            resolve(false);
            
          } catch (error) {
            console.error('🔊 Fallback loading failed:', error);
            resolve(false);
          }
        });

        audio.addEventListener('error', (error) => {
          clearTimeout(timeout);
          console.error('🔊 Audio element error in fallback:', error);
          resolve(false);
        });

        audio.src = url;
      });
    } catch (error) {
      console.error('🔊 Fallback method failed:', error);
      return false;
    }
  }

  playBeat() {
    if (!this.beatBuffer || !this.audioContext) {
      console.error('🎼 Cannot play beat - missing beatBuffer or audioContext');
      return;
    }

    // Stop current beat if playing
    this.stopBeat();

    // Create and configure new source
    this.currentBeatSource = this.audioContext.createBufferSource();
    this.currentBeatSource.buffer = this.beatBuffer;
    this.currentBeatSource.loop = true;
    this.currentBeatSource.connect(this.beatGainNode);

    // Start playback
    this.currentBeatSource.start(0);
    this.isPlaying = true;
  }

  stopBeat() {
    if (this.currentBeatSource) {
      try {
        this.currentBeatSource.stop();
        this.currentBeatSource.disconnect();
      } catch (error) {
        console.error('Error stopping beat:', error);
      }
      this.currentBeatSource = null;
    }
    this.isPlaying = false;
  }

  setBeatVolume(volume) {
    if (this.beatGainNode) {
      this.beatGainNode.gain.value = volume;
    }
  }

  setVocalsVolume(volume) {
    if (this.vocalsGainNode) {
      this.vocalsGainNode.gain.value = volume;
    }
  }

  setMasterVolume(volume) {
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = volume;
    }
  }

  // Clean up resources
  dispose() {
    this.stopBeat();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    // Reset initialization state
    this.isInitialized = false;
    this.isInitializing = false;
    this.initializationPromise = null;
    this.masterGainNode = null;
    this.beatGainNode = null;
    this.vocalsGainNode = null;
  }
}

// Create a singleton instance
const audioService = new AudioService();
export default audioService; 