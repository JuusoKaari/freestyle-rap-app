class AudioService {
  constructor() {
    this.audioContext = null;
    this.masterGainNode = null;
    this.beatGainNode = null;
    this.vocalsGainNode = null;
    this.currentBeatSource = null;
    this.beatBuffer = null;
    this.isPlaying = false;
  }

  async initialize() {
    // Create AudioContext only after user interaction
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    }

    // Resume context if it was suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async loadBeat(url) {
    try {
      // First check if the URL is valid
      if (!url) {
        throw new Error('Invalid beat URL');
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
      console.log('Loading audio file:', { url, contentType });

      // Get the array buffer
      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error('Empty audio file');
      }

      // Decode the audio data
      try {
        this.beatBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        console.log('Successfully loaded beat:', { 
          duration: this.beatBuffer.duration,
          numberOfChannels: this.beatBuffer.numberOfChannels,
          sampleRate: this.beatBuffer.sampleRate
        });
        return true;
      } catch (decodeError) {
        console.error('Failed to decode audio data:', decodeError);
        // Try alternative loading method if decode fails
        return await this.loadBeatFallback(url);
      }
    } catch (error) {
      console.error('Error loading beat:', error);
      return false;
    }
  }

  async loadBeatFallback(url) {
    try {
      // Fallback method using Audio element
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      
      return new Promise((resolve) => {
        audio.addEventListener('canplaythrough', async () => {
          try {
            // Create a temporary audio context if needed
            const tempContext = this.audioContext || new (window.AudioContext || window.webkitAudioContext)();
            
            // Create a media element source
            const source = tempContext.createMediaElementSource(audio);
            
            // Create an offline context to capture the audio
            const offlineContext = new OfflineAudioContext(
              2,
              audio.duration * tempContext.sampleRate,
              tempContext.sampleRate
            );

            // Connect and start rendering
            const offlineSource = offlineContext.createMediaElementSource(audio);
            offlineSource.connect(offlineContext.destination);
            
            // Render and set the buffer
            const renderedBuffer = await offlineContext.startRendering();
            this.beatBuffer = renderedBuffer;
            
            console.log('Successfully loaded beat using fallback:', {
              duration: this.beatBuffer.duration,
              numberOfChannels: this.beatBuffer.numberOfChannels,
              sampleRate: this.beatBuffer.sampleRate
            });
            
            resolve(true);
          } catch (error) {
            console.error('Fallback loading failed:', error);
            resolve(false);
          }
        });

        audio.addEventListener('error', (error) => {
          console.error('Audio element error:', error);
          resolve(false);
        });

        audio.src = url;
      });
    } catch (error) {
      console.error('Fallback method failed:', error);
      return false;
    }
  }

  playBeat() {
    if (!this.beatBuffer || !this.audioContext) return;

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
  }
}

// Create a singleton instance
const audioService = new AudioService();
export default audioService; 