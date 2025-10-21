# Audio System - MVP (Beat Only)

## Overview

**MVP Scope**: Single beat playback only. No word audio functionality.

## Core Components

### AudioService Interface
```kotlin
interface AudioService {
    fun playBeat()
    fun pauseBeat()
    fun stopBeat()
    fun isBeatPlaying(): Boolean
    fun setBeatVolume(volume: Float)
}
```

### Simple Implementation
```kotlin
@Singleton
class AudioServiceImpl @Inject constructor(
    @ApplicationContext private val context: Context
) : AudioService {

    private val exoPlayer = ExoPlayer.Builder(context).build()

    override fun playBeat() {
        exoPlayer.setMediaItem(MediaItem.fromUri(BEAT_URL))
        exoPlayer.prepare()
        exoPlayer.play()
    }

    override fun pauseBeat() {
        exoPlayer.pause()
    }

    override fun stopBeat() {
        exoPlayer.stop()
    }

    override fun isBeatPlaying(): Boolean = exoPlayer.isPlaying

    override fun setBeatVolume(volume: Float) {
        exoPlayer.volume = volume
    }

    companion object {
        const val BEAT_URL = "https://cdn.example.com/beat.mp3"
    }
}
```

## Single Beat Configuration

### Beat File Requirements
- **Format**: MP3 or AAC
- **Length**: 8-16 bars loopable
- **BPM**: 80-100 BPM for rap practice
- **Quality**: 192kbps minimum
- **Source**: Single file, no variations needed for MVP

### ExoPlayer Setup
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
    .build()
```

## Audio Permissions

### Manifest Requirements
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

### Runtime Permissions
- No microphone permission needed (no recording in MVP)
- Internet permission for streaming audio
- Wake lock to prevent audio interruption

## Error Handling

### Simple Error Recovery
```kotlin
sealed class AudioResult {
    object Success : AudioResult()
    data class Error(val message: String) : AudioResult()
}

suspend fun playBeatSafely(): AudioResult {
    return try {
        // Beat playback logic
        AudioResult.Success
    } catch (e: Exception) {
        AudioResult.Error("Beat playback failed: ${e.message}")
    }
}
```

## Integration Points

### UI Integration
```kotlin
@Composable
fun BeatControls(audioService: AudioService) {
    val isPlaying by audioService.isBeatPlaying()

    IconButton(onClick = {
        if (isPlaying) audioService.pauseBeat() else audioService.playBeat()
    }) {
        Icon(
            if (isPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
            "Beat control"
        )
    }
}
```

### ViewModel Integration
```kotlin
@HiltViewModel
class RhymeExplorerViewModel @Inject constructor(
    private val audioService: AudioService
) : ViewModel() {

    fun playBeat() {
        audioService.playBeat()
    }

    fun pauseBeat() {
        audioService.pauseBeat()
    }
}
```

## Assets and Configuration

### Required Assets
1. **Beat File**: Single MP3 file in assets or remote URL

### Configuration
```kotlin
object AudioConfig {
    const val DEFAULT_BEAT_VOLUME = 0.7f
}
```

## Testing

### Audio Tests
```kotlin
class AudioServiceTest {
    @Test
    fun `playBeat starts playback`() {
        audioService.playBeat()
        assertTrue(audioService.isBeatPlaying())
    }
}
```

## Future Enhancements
- Audio caching for offline use
- Multiple beat support
- Advanced audio controls (seek, speed)
- Background audio service
