# Audio System - Android Implementation

## Overview

The audio system handles beat playback, word pronunciation, and recording functionality. This Android implementation replaces the Web Audio API with native Android audio frameworks while maintaining synchronization and quality.

## Core Components

### 1. Audio Service Architecture
```kotlin
interface AudioService {
    fun playBeat(beatUrl: String, bpm: Int)
    fun pauseBeat()
    fun stopBeat()
    fun setVolume(volume: Float)
    fun playWordAudio(wordId: String)
    fun speakText(text: String, language: Language)
    fun getCurrentPosition(): Long
    fun seekTo(position: Long)
}
```

### 2. Beat Playback System
- **Primary Player**: ExoPlayer for streaming beat files from URLs
- **Fallback Player**: MediaPlayer for local audio files
- **BPM Synchronization**: Precise timing for word changes
- **Gapless Playback**: Seamless beat transitions

### 3. Word Audio System
- **TTS Integration**: Google Text-to-Speech for word pronunciation
- **Remote Audio**: Stream word audio files from Cloudinary
- **Caching**: Local storage for frequently used words
- **Voice Selection**: Language-appropriate voices (Harri FI, Hunter EN)

## Audio Sources

### Beat Files
- **Remote URLs**: Cloudinary-hosted beat files with BPM variations
- **Local Assets**: Bundle essential beats for offline use
- **Metadata**: BPM information, loop points, audio characteristics

### Word Audio Files
- **Generated TTS**: Pre-recorded pronunciation for vocabulary words
- **Cloud Storage**: CDN-hosted audio files for global access
- **Metadata Files**: JSON files containing audio URLs and timing info

## Synchronization System

### BPM Controller
```kotlin
class BpmController(
    private val audioService: AudioService,
    private val callback: (Long) -> Unit // Sixteenth note callback
) {
    fun start(bpm: Int)
    fun stop()
    fun changeBpm(newBpm: Int)
    fun getCurrentBeatPosition(): BeatPosition
}
```

### Timing Precision
- **Sixteenth Notes**: Core timing unit for word changes
- **Quarter Notes**: Visual beat indicators
- **Audio Latency**: Compensation for device-specific delays
- **Background Processing**: Consistent timing even when app is backgrounded

## Recording System Integration

### Audio Recording Service
```kotlin
interface RecordingService {
    suspend fun startRecording(): Boolean
    fun stopRecording(): File?
    fun pauseRecording()
    fun resumeRecording()
    fun getRecordingDuration(): Long
    fun playRecording(recordingFile: File)
}
```

### Recording with Beat Overlay
- **Mixing**: Combine microphone input with beat playback
- **Synchronization**: Align recording timeline with beat position
- **Quality**: High-quality audio recording (44.1kHz, stereo)
- **Format**: Standardized audio format for playback compatibility

## Technical Implementation

### ExoPlayer Configuration
```kotlin
@Provides
@Singleton
fun provideExoPlayer(
    @ApplicationContext context: Context
): ExoPlayer = ExoPlayer.Builder(context)
    .setAudioAttributes(
        AudioAttributes.Builder()
            .setUsage(USAGE_MEDIA)
            .setContentType(CONTENT_TYPE_MUSIC)
            .build()
    )
    .setHandleAudioBecomingNoisy(true)
    .build()
```

### Media Session Integration
- **Playback Controls**: Background media controls
- **Audio Focus**: Proper audio focus management
- **Notification**: Media style notification for background playback
- **Lock Screen**: Playback controls on lock screen

### Permission Handling
```kotlin
// Microphone permission for recording
Manifest.permission.RECORD_AUDIO

// Audio focus and background playback
AudioManager.AUDIOFOCUS_GAIN

// External storage for recordings (API 29+)
Manifest.permission.READ_EXTERNAL_STORAGE (legacy)
```

## Performance Optimization

### Audio Caching
- **Disk Cache**: LRU cache for audio files
- **Memory Cache**: Recently played audio in memory
- **Pre-buffering**: Buffer next beat while playing current
- **Compression**: Optimize audio file sizes for mobile

### Battery Optimization
- **Background Limits**: Handle Doze mode and app standby
- **Efficient Decoding**: Use hardware-accelerated audio decoding
- **Power Management**: Minimize CPU usage during playback
- **Network Awareness**: Adapt quality based on connection

## Error Handling

### Audio Error Recovery
- **Network Failures**: Fallback to local audio files
- **Decoding Errors**: Graceful handling of corrupted files
- **Permission Denied**: User-friendly error messages and guidance
- **Device Limitations**: Adapt to device audio capabilities
