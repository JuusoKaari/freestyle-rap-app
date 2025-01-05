import audioService from './AudioService';

class RecordingService {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingStream = null;
    this.microphoneNode = null;
    this.isRecording = false;
  }

  async requestMicrophonePermission() {
    try {
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.recordingStream = stream;
      
      // Create microphone input node
      const audioContext = audioService.audioContext;
      if (!audioContext) {
        console.error('Audio context not initialized');
        return false;
      }
      
      // Disconnect old node if it exists
      if (this.microphoneNode) {
        this.microphoneNode.disconnect();
      }
      
      // Create new microphone node
      this.microphoneNode = audioContext.createMediaStreamSource(stream);
      
      console.log('Microphone permission granted');
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      return false;
    }
  }

  startRecording() {
    console.log('Starting recording...');
    if (!this.recordingStream) {
      console.error('No recording stream available');
      return;
    }

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(this.recordingStream);

    this.mediaRecorder.ondataavailable = (event) => {
      console.log('Recording data available');
      this.audioChunks.push(event.data);
    };

    // Reinitialize microphone node with current audio context
    const audioContext = audioService.audioContext;
    if (audioContext) {
      // Disconnect old node if exists
      if (this.microphoneNode) {
        this.microphoneNode.disconnect();
      }
      // Create new node with current context
      this.microphoneNode = audioContext.createMediaStreamSource(this.recordingStream);
      // We don't connect the microphone to destination to avoid monitoring
    }
    
    this.mediaRecorder.start();
    this.isRecording = true;
    console.log('Recording started');
  }

  stopRecording() {
    console.log('Stopping recording...');
    if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
      console.error('No active recording to stop');
      return;
    }

    return new Promise((resolve) => {
      this.mediaRecorder.onstop = async () => {
        console.log('Processing recording...');
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioContext = audioService.audioContext;
        if (!audioContext) {
          console.error('Audio context not available');
          resolve(null);
          return;
        }
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        const result = {
          blob: audioBlob,
          buffer: audioBuffer,
          url: URL.createObjectURL(audioBlob)
        };
        console.log('Recording processed successfully');
        resolve(result);
      };

      this.mediaRecorder.stop();
      if (this.microphoneNode) {
        this.microphoneNode.disconnect();
      }
      this.isRecording = false;
    });
  }

  dispose() {
    console.log('Disposing recording service...');
    if (this.recordingStream) {
      this.recordingStream.getTracks().forEach(track => track.stop());
    }
    if (this.microphoneNode) {
      this.microphoneNode.disconnect();
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isRecording = false;
    console.log('Recording service disposed');
  }
}

export default new RecordingService(); 