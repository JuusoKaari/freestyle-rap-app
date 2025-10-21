# User Interface - MVP (Simple Compose Screens)

## Overview

**MVP Scope**: Minimal UI with single screen for Rhyme Explorer mode.

## Architecture

### Simple Navigation
```kotlin
@Composable
fun AppNavigation() {
    val navController = rememberNavController()

    NavHost(navController = navController, startDestination = "rhyme_explorer") {
        composable("rhyme_explorer") {
            RhymeExplorerScreen()
        }
    }
}
```

### Basic Theme
```kotlin
@Composable
fun FreestyleRapTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = Color(0xFF6200EE),
            secondary = Color(0xFF03DAC6)
        ),
        content = content
    )
}
```

## Core Screens

### RhymeExplorerScreen
```kotlin
@Composable
fun RhymeExplorerScreen(
    viewModel: RhymeExplorerViewModel = hiltViewModel()
) {
    val words by viewModel.currentWords.collectAsState()
    val rhymes by viewModel.rhymes.collectAsState()
    val isBeatPlaying by viewModel.isBeatPlaying.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Rhyme Explorer") },
                actions = {
                    // Simple beat control
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

            // Current word display
            WordCard(word = words.firstOrNull())

            Spacer(modifier = Modifier.height(16.dp))

            // Rhymes section
            Text(
                text = "Rhyming Words",
                style = MaterialTheme.typography.headlineSmall
            )

            // Rhyming words list
            RhymeList(rhymes = rhymes)

            Spacer(modifier = Modifier.height(16.dp))

            // Simple refresh button
            Button(
                onClick = { viewModel.loadNewWords() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Load New Words")
            }
        }
    }
}
```

## Components

### WordCard
```kotlin
@Composable
fun WordCard(word: WordEntity?) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            word?.let {
                Text(
                    text = it.word,
                    style = MaterialTheme.typography.displayMedium
                )
                it.phonetic?.let { phonetic ->
                    Text(
                        text = "[$phonetic]",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            } ?: run {
                Text("Loading...")
            }
        }
    }
}
```

### RhymeList
```kotlin
@Composable
fun RhymeList(rhymes: List<WordEntity>) {
    LazyColumn {
        items(rhymes) { rhyme ->
            RhymeItem(word = rhyme)
        }
    }
}

@Composable
fun RhymeItem(word: WordEntity) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = word.word,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
```

## ViewModel

### Simple State Management
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

    init {
        loadNewWords()
    }

    fun loadNewWords() {
        viewModelScope.launch {
            vocabularyRepository.getRandomWords(1).collect { words ->
                _currentWords.value = words
                words.firstOrNull()?.let { loadRhymesForWord(it) }
            }
        }
    }

    private fun loadRhymesForWord(word: WordEntity) {
        viewModelScope.launch {
            val rhymes = rhymeHandler.findRhymes(word.word, 8)
            _rhymes.value = rhymes
        }
    }

    fun playWordAudio(word: WordEntity) {
        // Play word audio using audioService
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
}
```

## Dependency Injection

### Hilt Modules
```kotlin
@Module
@InstallIn(ViewModelComponent::class)
object ViewModelModule {

    @Provides
    fun provideRhymeExplorerViewModel(
        vocabularyRepository: VocabularyRepository,
        rhymeHandler: RhymeHandler,
        audioService: AudioService
    ): ViewModelProvider.Factory {
        return object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return RhymeExplorerViewModel(
                    vocabularyRepository,
                    rhymeHandler,
                    audioService
                ) as T
            }
        }
    }
}
```

## Main Activity

### Simple Setup
```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FreestyleRapTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavigation()
                }
            }
        }
    }
}
```

## Responsive Design

### Basic Responsiveness
```kotlin
@Composable
fun RhymeExplorerScreen() {
    val configuration = LocalConfiguration.current
    val isLandscape = configuration.orientation == Configuration.ORIENTATION_LANDSCAPE

    if (isLandscape) {
        // Landscape layout
        Row {
            WordCard(Modifier.weight(1f))
            RhymeList(Modifier.weight(1f))
        }
    } else {
        // Portrait layout
        Column {
            WordCard()
            RhymeList()
        }
    }
}
```

## Error Handling

### Simple Error Display
```kotlin
@Composable
fun ErrorMessage(error: String?) {
    error?.let {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.errorContainer
            )
        ) {
            Text(
                text = it,
                color = MaterialTheme.colorScheme.onErrorContainer,
                modifier = Modifier.padding(8.dp)
            )
        }
    }
}
```

## Assets and Styling

### Basic Theming
```kotlin
val Typography = Typography(
    displayLarge = TextStyle(fontSize = 32.sp),
    displayMedium = TextStyle(fontSize = 24.sp),
    bodyLarge = TextStyle(fontSize = 16.sp)
)
```

### Required Dependencies
```kotlin
// build.gradle.kts (Module)
dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.activity:activity-compose:1.8.0")

    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.4")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")

    // Room
    implementation("androidx.room:room-runtime:2.6.0")
    kapt("androidx.room:room-compiler:2.6.0")
    implementation("androidx.room:room-ktx:2.6.0")

    // ExoPlayer
    implementation("androidx.media3:media3-exoplayer:1.2.0")
}
```

## Testing

### Basic UI Tests
```kotlin
@RunWith(AndroidJUnit4::class)
class RhymeExplorerScreenTest {

    @Test
    fun displaysWordsWhenLoaded() {
        // Test that words are displayed correctly
    }

    @Test
    fun showsLoadingStateInitially() {
        // Test loading state
    }
}
```

## Future Enhancements
- More complex layouts
- Animation and transitions
- Advanced Material Design components
- Dark theme support
