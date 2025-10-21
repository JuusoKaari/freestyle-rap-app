# Recording System - Android Implementation

## Overview

The recording system enables users to record their freestyle sessions with beat accompaniment, providing a seamless recording experience that matches the web version's functionality.

## Core Components

### 1. Recording Service
```kotlin
interface RecordingService {
    suspend fun startRecording(beatUrl: String?, bpm: Int): RecordingSession
    suspend fun stopRecording(session: RecordingSession): RecordingResult
    fun pauseRecording(session: RecordingSession)
    fun resumeRecording(session: RecordingSession)
    fun getRecordingDuration(session: RecordingSession): Long
    fun playRecording(recording: Recording)
    fun deleteRecording(recordingId: String)
}
```

### 2. Recording Models
```kotlin
data class RecordingSession(
    val id: String,
    val startTime: Long,
    val beatUrl: String?,
    val bpm: Int,
    val temporaryFile: File
)

data class Recording(
    val id: String,
    val title: String,
    val duration: Long,
    val filePath: String,
    val beatUrl: String?,
    val bpm: Int,
    val createdAt: Long,
    val language: Language,
    val fileSize: Long
)

sealed class RecordingResult {
    data class Success(val recording: Recording) : RecordingResult()
    data class Error(val message: String) : RecordingResult()
}
```

## Audio Recording Implementation

### MediaRecorder Configuration
```kotlin
private fun createMediaRecorder(outputFile: File): MediaRecorder {
    return MediaRecorder().apply {
        setAudioSource(MediaRecorder.AudioSource.MIC)
        setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        setAudioSamplingRate(44100)
        setAudioChannels(2) // Stereo recording
        setAudioEncodingBitRate(128000)
        setOutputFile(outputFile.absolutePath)
    }
}
```

### Permission Management
```kotlin
class RecordingPermissionHandler(private val context: Context) {

    fun hasRecordingPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.RECORD_AUDIO
        ) == PackageManager.PERMISSION_GRANTED
    }

    suspend fun requestRecordingPermission(activity: Activity): Boolean {
        return if (!hasRecordingPermission()) {
            val result = ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.RECORD_AUDIO),
                RECORDING_PERMISSION_CODE
            )
            result.isSuccess()
        } else {
            true
        }
    }
}
```

## Beat Synchronization

### Recording with Background Beat
- **Audio Mixing**: Combine microphone input with beat playback
- **Synchronization**: Maintain precise timing between recording and beat
- **Volume Control**: Allow users to adjust beat volume during recording
- **Real-time Monitoring**: Visual feedback of recording levels

### Implementation Strategy
1. **Separate Audio Sessions**: Use AudioRecord for mic input, ExoPlayer for beats
2. **Software Mixing**: Combine audio streams in real-time
3. **Precise Timing**: Use AudioTimestamp for synchronization
4. **Buffer Management**: Optimize buffer sizes for low latency

## Recording Management

### Local Storage
- **Internal Storage**: Store recordings in app-specific directory
- **File Organization**: Organize by date and session
- **Metadata Storage**: Store recording info in Room database
- **Cleanup**: Automatic cleanup of old temporary files

### Database Schema
```kotlin
@Entity(tableName = "recordings")
data class RecordingEntity(
    @PrimaryKey val id: String,
    val title: String,
    val filePath: String,
    val duration: Long,
    val fileSize: Long,
    val beatUrl: String?,
    val bpm: Int,
    val language: String,
    val createdAt: Long,
    val isFavorite: Boolean = false
)

@Entity(tableName = "recording_sessions")
data class RecordingSessionEntity(
    @PrimaryKey val recordingId: String,
    val sessionData: String, // JSON serialized session info
    val createdAt: Long
)
```

## Playback System

### Recording Playback
- **MediaPlayer Integration**: Play back recorded audio files
- **Beat Overlay**: Option to play original beat during playback
- **Playback Controls**: Play, pause, seek, volume control
- **Visualization**: Waveform display for recorded audio

### Playback Service
```kotlin
class RecordingPlaybackService : MediaSessionCompat.Callback() {

    private var mediaPlayer: MediaPlayer? = null
    private var beatPlayer: ExoPlayer? = null

    override fun onPlay() {
        mediaPlayer?.start()
        beatPlayer?.play()
    }

    override fun onPause() {
        mediaPlayer?.pause()
        beatPlayer?.pause()
    }

    override fun onSeekTo(pos: Long) {
        mediaPlayer?.seekTo(pos.toInt())
        beatPlayer?.seekTo(pos)
    }
}
```

## User Interface Integration

### Recording Controls
- **Record Button**: Toggle recording start/stop
- **Pause/Resume**: Allow pausing during recording
- **Visual Feedback**: Recording indicator and duration display
- **Beat Selection**: Choose beat before recording

### Recording Management UI
- **Recordings List**: Grid/list view of saved recordings
- **Playback Interface**: Full-screen playback with controls
- **Edit Metadata**: Rename recordings, add notes
- **Share/Export**: Share recordings with others

## Quality and Performance

### Audio Quality Settings
- **Sample Rate Options**: 44.1kHz, 48kHz for different quality levels
- **Bitrate Selection**: 128kbps, 256kbps, 320kbps options
- **Format Support**: AAC, MP3, WAV output formats
- **Stereo/Mono**: Configurable channel recording

### Performance Optimization
- **Background Recording**: Continue recording when app is backgrounded
- **Battery Optimization**: Efficient audio processing
- **Memory Management**: Streaming for large files
- **Storage Monitoring**: Alert users when storage is low

## Error Handling and Edge Cases

### Common Issues
- **Permission Denied**: Guide users through permission flow
- **Storage Full**: Provide cleanup options and warnings
- **Audio Focus Loss**: Handle other apps requesting audio focus
- **Device Limitations**: Adapt to device capabilities

### Recovery Mechanisms
- **Auto-save**: Save partial recordings if app crashes
- **Retry Logic**: Retry failed recording operations
- **Corruption Detection**: Validate recording file integrity
- **User Guidance**: Clear error messages and suggested actions
