# Training Modes - MVP (Rhyme Explorer Only)

## Overview

**MVP Scope**: Single training mode - Rhyme Explorer for Finnish vocabulary.

## Rhyme Explorer Mode

### Purpose
- Display random Finnish words in a visually engaging radial layout
- Show rhyming words arranged in bubbles around the main word
- Interactive hint system (toggle between showing actual rhymes or '?' placeholders)
- Beat-synchronized word progression with visual progress indicator
- Manual navigation with keyboard shortcuts and button controls

### Visual Design
The mode features a distinctive radial layout inspired by the existing React implementation:

- **Center Word**: Large circular element displaying the current word in uppercase
- **Progress Circle**: Animated shrinking circle showing time remaining in the current round
- **Rhyme Bubbles**: 6 bubbles arranged radially around the center word at 60-degree intervals
- **Hint Toggle**: Switch between showing actual rhyme words or '?' placeholders for practice
- **Navigation**: Previous/Next buttons with keyboard arrow key support (←/→) and spacebar for beat control

### Key Features
- **Radial Layout**: Words arranged in a circle around the main word for visual appeal
- **Progress Visualization**: Shrinking circle shows remaining time in current round
- **Hint System**: Toggle between showing rhymes or question marks for learning
- **Keyboard Navigation**: Arrow keys for word navigation, spacebar for beat control
- **Beat Synchronization**: Automatic word changes based on beat timing and bars-per-round setting
- **Responsive Design**: Adapts to different screen sizes and orientations

### UI Components
```kotlin
@Composable
fun RhymeExplorerScreen(
    viewModel: RhymeExplorerViewModel = hiltViewModel()
) {
    val words by viewModel.currentWords.collectAsState()
    val rhymes by viewModel.rhymes.collectAsState()
    val isBeatPlaying by viewModel.isBeatPlaying.collectAsState()
    val showHints by viewModel.showHints.collectAsState()
    val progress by viewModel.progress.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Rhyme Explorer") },
                actions = {
                    // Beat control
                    IconButton(onClick = { viewModel.toggleBeat() }) {
                        Icon(
                            if (isBeatPlaying) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                            "Beat control"
                        )
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(modifier = Modifier.padding(paddingValues)) {

            // Radial word display area (square aspect ratio)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .background(Color.DarkGray.copy(alpha = 0.9f)),
                contentAlignment = Alignment.Center
            ) {
                // Animated progress circle (shrinks over time)
                Box(
                    modifier = Modifier
                        .fillMaxSize(progress) // Shrinks based on progress
                        .border(2.dp, Color.Cyan.copy(alpha = 0.7f), CircleShape)
                        .background(Color.Black.copy(alpha = 0.2f), CircleShape)
                )

                // Center word (large text)
                Text(
                    text = words.firstOrNull()?.word?.uppercase() ?: "LOADING",
                    style = MaterialTheme.typography.displayLarge.copy(
                        fontSize = MaterialTheme.typography.displayLarge.fontSize * 1.2
                    ),
                    textAlign = TextAlign.Center,
                    color = Color.White,
                    modifier = Modifier.background(
                        Color.Black.copy(alpha = 0.6f),
                        RoundedCornerShape(50)
                    ).padding(16.dp)
                )

                // Rhyme bubbles arranged radially (6 bubbles at 60° intervals)
                val bubbleRadius = 0.35f // Distance from center
                rhymes.take(6).forEachIndexed { index, rhyme ->
                    val angle = (index * 60f).toRadians()
                    val x = cos(angle) * bubbleRadius
                    val y = sin(angle) * bubbleRadius

                    Text(
                        text = if (showHints) rhyme.word else "?",
                        modifier = Modifier
                            .offset {
                                IntOffset(
                                    x = (x * 400f).toInt(), // Scale for display
                                    y = (y * 400f).toInt()
                                )
                            }
                            .background(
                                Color.DarkGray.copy(alpha = 0.8f),
                                RoundedCornerShape(50)
                            )
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        color = Color.White,
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Navigation controls
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                IconButton(onClick = { viewModel.previousWord() }) {
                    Icon(Icons.Filled.ArrowBack, "Previous Word")
                }

                Button(onClick = { viewModel.loadNewWords() }) {
                    Text("New Word")
                }

                IconButton(onClick = { viewModel.nextWord() }) {
                    Icon(Icons.Filled.ArrowForward, "Next Word")
                }
            }

            // Settings row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Show Hints")
                Spacer(modifier = Modifier.width(8.dp))
                Switch(
                    checked = showHints,
                    onCheckedChange = { viewModel.toggleHints() }
                )
            }
        }
    }
}
```

### ViewModel
```kotlin
@HiltViewModel
class RhymeExplorerViewModel @Inject constructor(
    private val vocabularyRepository: VocabularyRepository,
    private val rhymeHandler: RhymeHandler,
    private val audioService: AudioService
) : ViewModel() {

    private val _currentWords = MutableStateFlow<List<WordEntity>>(emptyList())
    val currentWords: StateFlow<List<WordEntity>> = _currentWords

    private val _rhymes = MutableStateFlow<List<WordEntity>>(emptyList())
    val rhymes: StateFlow<List<WordEntity>> = _rhymes

    private val _isBeatPlaying = MutableStateFlow(false)
    val isBeatPlaying: StateFlow<Boolean> = _isBeatPlaying

    private val _showHints = MutableStateFlow(true)
    val showHints: StateFlow<Boolean> = _showHints

    private val _progress = MutableStateFlow(1.0f)
    val progress: StateFlow<Float> = _progress

    init {
        loadNewWords()
    }

    fun loadNewWords() {
        viewModelScope.launch {
            // Load random words from Finnish vocabulary
            vocabularyRepository.getRandomWords(1).collect { words ->
                _currentWords.value = words
                loadRhymesForWords(words)
            }
        }
    }

    private fun loadRhymesForWords(words: List<WordEntity>) {
        viewModelScope.launch {
            words.firstOrNull()?.let { word ->
                val rhymes = rhymeHandler.findRhymes(word.word, 8)
                _rhymes.value = rhymes
            }
        }
    }

    fun toggleBeat() {
        if (_isBeatPlaying.value) {
            audioService.pauseBeat()
            _isBeatPlaying.value = false
        } else {
            audioService.playBeat()
            _isBeatPlaying.value = true
        }
    }

    fun toggleHints() {
        _showHints.value = !_showHints.value
    }

    fun nextWord() {
        loadNewWords()
    }

    fun previousWord() {
        // For MVP, just load a new random word
        loadNewWords()
    }
}
```

### Features
- ✅ **Radial Layout**: Distinctive circular arrangement with center word and rhyme bubbles
- ✅ **Progress Visualization**: Animated shrinking circle showing time remaining
- ✅ **Interactive Hints**: Toggle between showing rhymes or '?' placeholders
- ✅ **Keyboard Navigation**: Arrow keys (←/→) for word navigation, spacebar for beat control
- ✅ **Beat Synchronization**: Automatic word changes based on beat timing
- ✅ **Visual Appeal**: Modern dark theme with cyan accent colors
- ✅ **Responsive Design**: Adapts to different screen sizes and orientations
- ❌ No recording integration
- ❌ No word audio playback
- ❌ No advanced filtering
