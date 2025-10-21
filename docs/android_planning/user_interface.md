# User Interface - Android Implementation

## Overview

The user interface leverages Jetpack Compose for building a modern, Material Design 3-based interface that adapts the React web application to Android patterns while maintaining feature parity.

## Architecture

### Navigation System
```kotlin
// Main navigation graph
@Composable
fun FreestyleRapNavGraph(
    navController: NavHostController,
    startDestination: String = "home"
) {
    NavHost(navController = navController, startDestination = startDestination) {
        composable("home") { HomeScreen() }
        composable("training/{mode}") { backStackEntry ->
            val mode = backStackEntry.arguments?.getString("mode") ?: "rhyme_explorer"
            TrainingModeScreen(trainingMode = mode)
        }
        composable("vocabulary") { VocabularyScreen() }
        composable("recordings") { RecordingsScreen() }
        composable("settings") { SettingsScreen() }
    }
}
```

### Theme System
```kotlin
val DarkColorScheme = darkColorScheme(
    primary = Purple80,
    secondary = PurpleGrey80,
    tertiary = Pink80
)

val LightColorScheme = lightColorScheme(
    primary = Purple40,
    secondary = PurpleGrey40,
    tertiary = Pink40
)

@Composable
fun FreestyleRapTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
```

## Screen Breakdown

### 1. Home Screen
- **Training Mode Selection**: Grid of available training modes
- **Quick Actions**: Recent recordings, favorite vocabularies
- **Language Toggle**: Switch between Finnish and English
- **Beat Preview**: Current beat selection and playback controls

### 2. Training Mode Screens
- **Dynamic Rendering**: Single screen adapting to different modes
- **Mode-specific UI**: Specialized components for each training type
- **Real-time Feedback**: Live rhyme suggestions and timing indicators
- **Audio Controls**: Integrated beat and word audio playback

### 3. Vocabulary Management
- **Vocabulary Grid**: Visual selection of word categories
- **Custom Vocabulary Editor**: Create and edit custom word sets
- **Search and Filter**: Find words by syllable count, rhyme patterns
- **Import/Export**: Share vocabulary sets between users

### 4. Recordings Screen
- **Recordings List**: Grid/list view with thumbnails and metadata
- **Playback Interface**: Full-screen player with beat overlay
- **Recording Management**: Rename, delete, organize recordings
- **Export Options**: Share recordings via various platforms

### 5. Settings Screen
- **Audio Settings**: Volume, voice selection, audio preferences
- **Training Preferences**: Default BPM, favorite modes, difficulty levels
- **Data Management**: Storage usage, cache clearing, data export
- **About**: App version, credits, support information

## Component Library

### Shared Components
```kotlin
@Composable
fun WordDisplay(
    word: String,
    phonetic: String?,
    onPlayAudio: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier) {
        Column {
            Text(text = word, style = MaterialTheme.typography.headlineMedium)
            phonetic?.let {
                Text(text = "[$it]", style = MaterialTheme.typography.bodyMedium)
            }
            IconButton(onClick = onPlayAudio) {
                Icon(Icons.Filled.PlayArrow, "Play pronunciation")
            }
        }
    }
}

@Composable
fun RhymeList(
    rhymes: List<RhymeMatch>,
    onWordSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(modifier = modifier) {
        items(rhymes) { rhyme ->
            RhymeItem(
                rhyme = rhyme,
                onClick = { onWordSelected(rhyme.word) }
            )
        }
    }
}
```

### Training Mode Components
- **SetupPunchlineEditor**: Multi-line text input with rhyme assistance
- **RhymeMapView**: Custom canvas for visualizing rhyme connections
- **SlotMachine**: Animated word display with BPM synchronization
- **LyricsEditor**: Structured text editor with bar and rhyme guidance

## State Management

### ViewModel Architecture
```kotlin
@HiltViewModel
class TrainingModeViewModel @Inject constructor(
    private val vocabularyRepository: VocabularyRepository,
    private val rhymeHandler: RhymeHandler,
    private val audioService: AudioService,
    private val recordingService: RecordingService
) : ViewModel() {

    private val _uiState = MutableStateFlow<TrainingModeUiState>(TrainingModeUiState.Loading)
    val uiState: StateFlow<TrainingModeUiState> = _uiState.asStateFlow()

    private val _currentWords = MutableStateFlow<List<WordEntity>>(emptyList())
    val currentWords: StateFlow<List<WordEntity>> = _currentWords.asStateFlow()

    fun loadVocabulary(vocabularyId: String) {
        viewModelScope.launch {
            vocabularyRepository.getWordsByVocabulary(vocabularyId)
                .collect { words ->
                    _currentWords.value = words
                    updateRhymes()
                }
        }
    }

    private fun updateRhymes() {
        // Update rhyme suggestions based on current words
    }
}
```

### State Flow Integration
- **Unidirectional Data Flow**: Events → ViewModel → State → UI
- **State Hoisting**: Lift state to appropriate level for sharing
- **Side Effects**: Handle navigation and audio playback as effects

## Responsive Design

### Adaptive Layouts
```kotlin
@Composable
fun TrainingModeScreen(
    trainingMode: String,
    windowSize: WindowSize = currentWindowSize()
) {
    when (windowSize) {
        WindowSize.COMPACT -> CompactTrainingLayout(trainingMode)
        WindowSize.MEDIUM -> MediumTrainingLayout(trainingMode)
        WindowSize.EXPANDED -> ExpandedTrainingLayout(trainingMode)
    }
}
```

### Orientation Handling
- **Portrait Mode**: Optimized for mobile one-handed use
- **Landscape Mode**: Expanded layout for tablets and foldables
- **Rotation**: Preserve state during orientation changes

## Accessibility

### A11y Features
- **Screen Reader Support**: Content descriptions and semantic structure
- **High Contrast**: Support for high contrast themes
- **Large Text**: Scalable text and touch targets
- **Voice Control**: Integration with Android voice accessibility

### Motor Accessibility
- **Large Touch Targets**: Minimum 48dp touch targets
- **Gesture Navigation**: Alternative navigation methods
- **Keyboard Navigation**: Full keyboard accessibility support

## Animation System

### Motion Design
- **Page Transitions**: Smooth navigation between screens
- **Micro-interactions**: Button presses, state changes
- **Loading States**: Skeleton screens and progress indicators
- **Audio Visualization**: Beat-synchronized animations

### Animation Library
```kotlin
// Custom animation specs for consistent motion
val StandardAnimation = spring<Dp>(
    dampingRatio = Spring.DampingRatioMediumBouncy,
    stiffness = Spring.StiffnessLow
)

val QuickAnimation = tween<Int>(
    durationMillis = 200,
    easing = FastOutSlowInEasing
)
```

## Error Handling UI

### Error States
- **Network Errors**: Offline indicators and retry options
- **Audio Errors**: Fallback to TTS when audio files unavailable
- **Permission Errors**: Guidance for granting required permissions
- **Data Errors**: Graceful handling of corrupted or missing data

### Loading States
- **Skeleton Screens**: Placeholder layouts during loading
- **Progress Indicators**: Determinate progress for long operations
- **Error Boundaries**: Isolate errors to prevent app crashes

## Performance Optimization

### Compose Optimization
- **remember/unremember**: Proper state management to prevent unnecessary recompositions
- **Lazy Loading**: LazyColumn/LazyRow for large lists
- **Async Composition**: Suspend functions for data loading
- **Modifier Optimization**: Efficient modifier chains

### Memory Management
- **Disposable Effects**: Proper cleanup of effects and observers
- **Image Optimization**: Efficient image loading and caching
- **State Pruning**: Remove unused state from composition tree
