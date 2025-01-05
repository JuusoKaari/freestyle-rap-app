/**
 * Main Application Component (App.jsx)
 * ===================================
 * 
 * This is the root component of the Freestyle Rap Training application.
 * It manages the global state and coordinates between different training modes,
 * beat playback, vocabulary selection, and language settings.
 * 
 * Key responsibilities:
 * - Training mode selection and state management
 * - Beat playback and synchronization
 * - Word list generation and management
 * - Global UI layout and component organization
 * - Language switching support
 * 
 * The component uses various hooks for state management and refs for
 * audio timing control and beat synchronization.
 */

import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { generateWordList } from './data/wordList'
import TwoBarMode from './components/modes/TwoBarMode'
import FourBarMode from './components/modes/FourBarMode'
import RhymeExplorerMode from './components/modes/RhymeExplorerMode'
import FindRhymesMode from './components/modes/FindRhymesMode'
import RhymeMapMode from './components/modes/RhymeMapMode'
import SlotMachineMode from './components/modes/SlotMachineMode'
import ModeSelector from './components/ModeSelector'
import BeatSelector from './components/BeatSelector'
import CompactBeatSelector from './components/CompactBeatSelector'
import VocabularySelector from './components/VocabularySelector'
import LanguageToggle from './components/LanguageToggle'
import { trainingModes } from './data/trainingModes'
import { beats } from './data/beats'
import { useTranslation } from './services/TranslationContext'
import { DebugProvider, useDebug } from './services/DebugContext'
import audioService from './services/AudioService'
import RecordToggle from './components/RecordToggle'
import RecordingsModal from './components/RecordingsModal'
import recordingService from './services/RecordingService'

function App() {
  const { translate, language } = useTranslation();
  const { isDebugMode } = useDebug();
  const [isWebAudioSupported, setIsWebAudioSupported] = useState(true);
  
  // Add effect to update document title
  useEffect(() => {
    document.title = translate('app.title');
  }, [translate]);

  // Check Web Audio API support
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        setIsWebAudioSupported(false);
      }
    } catch (error) {
      setIsWebAudioSupported(false);
    }
  }, []);

  const [isTraining, setIsTraining] = useState(false)
  const [selectedMode, setSelectedMode] = useState(null)
  const [currentBar, setCurrentBar] = useState(0)
  const [bpm, setBpm] = useState(75)
  const [isWordChanging, setIsWordChanging] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [wordCounter, setWordCounter] = useState(0)
  const [shuffledWords, setShuffledWords] = useState([])
  const [selectedBeatId, setSelectedBeatId] = useState('night-ride')
  const [selectedVocabulary, setSelectedVocabulary] = useState('fi_generic_rap')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [barsPerRound, setBarsPerRound] = useState(2)
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false)
  const currentRecordingRef = useRef(null)

  const timerRef = useRef(null)
  const nextNoteTimeRef = useRef(0)

  // Initialize audio service
  useEffect(() => {
    audioService.initialize();

    // Load default beat
    const defaultBeat = beats.find(beat => beat.id === 'night-ride');
    if (defaultBeat) {
      const beatUrl = `/freestyle-rap-app/beats/${defaultBeat.file}`;
      audioService.loadBeat(beatUrl);
    }

    return () => {
      audioService.dispose();
    };
  }, []);

  const getTotalBars = () => {
    switch (selectedMode) {
      case 'four-bar':
        return 16; // 4 lines * 4 bars
      case 'two-bar':
        return 8; // 2 lines * 4 bars
      case 'slot-machine':
        return barsPerRound * 4; // Convert bars to beats
      default:
        return 8; // 2 lines * 4 bars
    }
  };

  // Handle bars per round change
  const handleBarsPerRoundChange = (value) => {
    setBarsPerRound(value);
    // Reset current bar to avoid issues with different total lengths
    setCurrentBar(0);
  };

  const createTick = () => {
    const beatInterval = 60.0 / bpm / 4
    const totalBars = getTotalBars()

    const tickFunction = () => {
      const currentTime = Date.now() / 1000
      
      if (nextNoteTimeRef.current <= currentTime + 0.1) {
        setCurrentBeat(prev => {
          const nextBeat = ((prev + 1) % 4)
          if (nextBeat === 0) {
            setCurrentBar(prevBar => {
              const nextBar = (prevBar + 1) % totalBars
              if (nextBar === 0) {
                setIsWordChanging(true)
                if (wordCounter >= shuffledWords.length - 2) {
                  // Load new words
                  generateWordList({ 
                    count: 100, 
                    minWordsInGroup: 3,
                    vocabulary: selectedVocabulary 
                  }).then(words => {
                    if (words.length > 0) {
                      setShuffledWords(words);
                      setWordCounter(0);
                    }
                  });
                } else {
                  setWordCounter(prev => prev + 1)
                }
                setTimeout(() => {
                  setIsWordChanging(false)
                }, 450)
              }
              return nextBar
            })
          }
          return nextBeat
        })

        nextNoteTimeRef.current += beatInterval
      }

      timerRef.current = setTimeout(tickFunction, 25)
    }

    return tickFunction
  }

  useEffect(() => {
    if (!isPlaying && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  const stopPlayback = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    audioService.stopBeat();
    setCurrentBeat(0);
    setCurrentBar(0);
    setIsWordChanging(false);
    setIsPlaying(false);

    // Stop recording if it was enabled
    if (isRecordingEnabled) {
      console.log('Recording enabled, stopping recording...');
      const recording = await recordingService.stopRecording();
      if (recording) {
        console.log('Recording completed, saving...');
        const newRecording = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          beatId: selectedBeatId,
          mode: selectedMode,
          vocabulary: selectedVocabulary,
          bpm: bpm,
          ...recording
        };
        setRecordings(prev => [...prev, newRecording]);
        console.log('New recording saved:', newRecording);
      }
    }
  };

  // Spread out words from same groups with randomization
  const spreadOutWords = (words) => {
    // Group words by their rhyming group
    const groupedWords = words.reduce((acc, word) => {
      if (!acc[word.group]) {
        acc[word.group] = [];
      }
      acc[word.group].push(word);
      return acc;
    }, {});

    // Get all groups and randomize their order
    const groups = Object.keys(groupedWords).sort(() => Math.random() - 0.5);
    
    // Randomize words within each group
    groups.forEach(group => {
      groupedWords[group].sort(() => Math.random() - 0.5);
    });

    const result = [];
    let currentIndex = 0;

    // Keep going until all words are used
    while (result.length < words.length) {
      const currentGroup = groups[currentIndex % groups.length];
      const wordsInGroup = groupedWords[currentGroup];
      
      // If group still has words, take one
      if (wordsInGroup && wordsInGroup.length > 0) {
        result.push(wordsInGroup.shift());
      }
      
      currentIndex++;
    }

    return result;
  };

  // Load initial words when vocabulary changes
  useEffect(() => {
    generateWordList({ 
      minWordsInGroup: 3,
      vocabulary: selectedVocabulary 
    }).then(words => {
      if (words.length > 0) {
        setShuffledWords(spreadOutWords(words));
      }
    });
  }, [selectedVocabulary]);

  // Update handleModeSelect to use spreadOutWords
  const handleModeSelect = async (modeId) => {
    stopPlayback();
    setSelectedMode(modeId);

    // Rhyme Map mode doesn't need word generation
    if (modeId === 'rhyme-map') {
      setIsTraining(true);
      return;
    }

    const words = await generateWordList({ 
      minWordsInGroup: 1,
      vocabulary: selectedVocabulary,
      includeRhymes: modeId === 'rhyme-explorer' || modeId === 'find-rhymes'
    });
    if (words.length > 0) {
      setShuffledWords(spreadOutWords(words));
      setWordCounter(0);
      setIsTraining(true);
    }
  };

  const handleReturnToMenu = () => {
    stopPlayback();
    setIsTraining(false);
    setSelectedMode(null);
  };

  const handleBeatSelect = async (beatId) => {
    stopPlayback();
    const selectedBeat = beats.find(beat => beat.id === beatId);
    setSelectedBeatId(beatId);
    
    if (selectedBeat) {
      setBpm(selectedBeat.bpm);
      const beatUrl = `/freestyle-rap-app/beats/${selectedBeat.file}`;
      setIsLoading(true);
      await audioService.loadBeat(beatUrl);
      setIsLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsLoading(true);

    // Initialize audio context if needed
    await audioService.initialize();

    // Start everything from the beginning
    const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
    if (!selectedBeat) {
      setIsLoading(false);
      return;
    }

    // Reset states
    setCurrentBeat(0);
    setCurrentBar(0);
    setIsWordChanging(false);

    // Start audio and visuals
    audioService.playBeat();
    setIsLoading(false);

    // Start recording if enabled and in training mode
    if (isRecordingEnabled && isTraining) {
      console.log('Recording enabled and in training mode, starting recording...');
      recordingService.startRecording();
    }

    // Only start visual timing if in training mode
    if (isTraining) {
      // Add 50ms delay before starting visuals for a more relaxed feel
      setTimeout(() => {
        const beatInterval = 60.0 / bpm / 4;
        nextNoteTimeRef.current = (Date.now() / 1000) + beatInterval;
        
        const tick = createTick();
        tick();
      }, 50);
    }
    
    setIsPlaying(true);
  };

  const handleNextWord = () => {
    setWordCounter((prev) => (prev + 1) % shuffledWords.length);
  };

  const handlePreviousWord = () => {
    setWordCounter((prev) => (prev - 1 + shuffledWords.length) % shuffledWords.length);
  };

  const handleRecordingToggle = async () => {
    const newState = !isRecordingEnabled;
    
    if (newState) {
      // Initialize audio context if needed
      await audioService.initialize();
      
      // Request microphone permission
      const hasPermission = await recordingService.requestMicrophonePermission();
      if (!hasPermission) {
        console.error('Microphone permission denied');
        return;
      }
    } else {
      // Stop recording if it's active
      if (recordingService.isRecording) {
        const recording = await recordingService.stopRecording();
        if (recording) {
          console.log('Recording completed, saving...');
          const newRecording = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            beatId: selectedBeatId,
            mode: selectedMode,
            vocabulary: selectedVocabulary,
            bpm: bpm,
            ...recording
          };
          setRecordings(prev => [...prev, newRecording]);
          console.log('New recording saved:', newRecording);
        }
      }
    }
    
    setIsRecordingEnabled(newState);
  };

  const renderTrainingMode = () => {
    const currentMode = trainingModes.find(mode => mode.id === selectedMode);
    
    switch (selectedMode) {
      case 'rhyme-map':
        return (
          <RhymeMapMode
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
            bpm={bpm}
            isRecordingEnabled={isRecordingEnabled}
            onRecordingToggle={handleRecordingToggle}
          />
        );
      case 'slot-machine':
        return (
          <SlotMachineMode
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            onNextWord={handleNextWord}
            onPreviousWord={handlePreviousWord}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
            onBarsPerRoundChange={handleBarsPerRoundChange}
          />
        );
      case 'rhyme-explorer':
        return (
          <RhymeExplorerMode
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            onNextWord={handleNextWord}
            onPreviousWord={handlePreviousWord}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
          />
        );
      case 'find-rhymes':
        return (
          <FindRhymesMode
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            onNextWord={handleNextWord}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
            bpm={bpm}
          />
        );
      case 'four-bar':
        return (
          <FourBarMode
            currentBar={currentBar}
            currentBeat={currentBeat}
            bpm={bpm}
            isWordChanging={isWordChanging}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
          />
        );
      case 'two-bar':
        return (
          <TwoBarMode
            currentBar={currentBar}
            currentBeat={currentBeat}
            bpm={bpm}
            isWordChanging={isWordChanging}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onReturnToMenu={handleReturnToMenu}
            modeName={currentMode.translations[language].name}
            helperText={currentMode.translations[language].helperText}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  // Load saved recordings from localStorage on mount
  useEffect(() => {
    const savedRecordings = localStorage.getItem('recordings');
    if (savedRecordings) {
      console.log('Loading saved recordings from localStorage');
      setRecordings(JSON.parse(savedRecordings));
    }
  }, []);

  // Save recordings to localStorage when updated
  useEffect(() => {
    console.log('Saving recordings to localStorage:', recordings);
    localStorage.setItem('recordings', JSON.stringify(recordings));
  }, [recordings]);

  return (
    <div className={`app ${isDebugMode ? 'debug-mode' : ''}`}>
      <div className="version-number">v{process.env.APP_VERSION || ''}</div>

      {!isWebAudioSupported && (
        <div className="browser-warning">
          <h2>{translate('app.browser_warning.title')}</h2>
          <p>{translate('app.browser_warning.message')}</p>
        </div>
      )}

      {isDebugMode && (
        <div className="recording-controls">
          <RecordToggle
            isRecordingEnabled={isRecordingEnabled}
            onToggle={handleRecordingToggle}
          />
          <button
            className="recordings-button"
            onClick={() => setIsRecordingsModalOpen(true)}
          >
            {translate('recordings.open')}
          </button>
        </div>
      )}

      <LanguageToggle />
      <h1>{translate('app.title')}</h1>

      {!isTraining ? (
        <div className="setup-container">
          <div className="controls">
            <BeatSelector
              selectedBeatId={selectedBeatId}
              onBeatSelect={handleBeatSelect}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              isLoading={isLoading}
            />
            <VocabularySelector
              selectedVocabulary={selectedVocabulary}
              onVocabularySelect={setSelectedVocabulary}
            />
          </div>
          <ModeSelector onSelectMode={handleModeSelect} />
        </div>
      ) : (
        <>
          <div className="training-header">
            <CompactBeatSelector
              selectedBeatId={selectedBeatId}
              onBeatSelect={handleBeatSelect}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              isLoading={isLoading}
            />
          </div>
          {renderTrainingMode()}
        </>
      )}

      <RecordingsModal
        isOpen={isRecordingsModalOpen}
        onClose={() => setIsRecordingsModalOpen(false)}
        recordings={recordings}
      />
    </div>
  );
}

export default App 