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
import { useTranslation } from './services/TranslationContext'
import { DebugProvider, useDebug } from './services/DebugContext'
import { useAudioController } from './services/useAudioController'
import audioService from './services/AudioService'
import RecordToggle from './components/RecordToggle'
import RecordingsModal from './components/RecordingsModal'
import recordingService from './services/RecordingService'

function App() {
  const { translate, language } = useTranslation();
  const { isDebugMode, SecretTapArea } = useDebug();
  const {
    isWebAudioSupported,
    bpm,
    isPlaying,
    isLoading,
    selectedBeatId,
    currentBeat,
    currentBar,
    handleBeatSelect,
    handleBpmChange,
    handlePlayPause,
    stopPlayback
  } = useAudioController();
  
  const [isTraining, setIsTraining] = useState(false)
  const [selectedMode, setSelectedMode] = useState(null)
  const [isWordChanging, setIsWordChanging] = useState(false)
  const [wordCounter, setWordCounter] = useState(0)
  const [shuffledWords, setShuffledWords] = useState([])
  const [selectedVocabulary, setSelectedVocabulary] = useState('fi_generic_rap')
  const [barsPerRound, setBarsPerRound] = useState(2)
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [isRecordingsModalOpen, setIsRecordingsModalOpen] = useState(false)
  const currentRecordingRef = useRef(null)

  // Add effect to update document title
  useEffect(() => {
    document.title = translate('app.title');
  }, [translate]);

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

  // Handle bar change callback for audio controller
  const handleBarChange = (nextBar) => {
    if (nextBar === 0) {
      setIsWordChanging(true);
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
        setWordCounter(prev => prev + 1);
      }
      setTimeout(() => {
        setIsWordChanging(false);
      }, 450);
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
      includeRhymes: true // Always include rhymes for all modes
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

  const handlePlayPauseWithRecording = async () => {
    // If we're stopping, handle recording cleanup
    if (isPlaying && isRecordingEnabled) {
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

    // If we're starting, initialize recording
    if (!isPlaying && isRecordingEnabled && isTraining) {
      console.log('Recording enabled and in training mode, starting recording...');
      recordingService.startRecording();
    }

    // Handle playback
    await handlePlayPause(getTotalBars(), handleBarChange);
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
    const commonProps = {
      onReturnToMenu: handleReturnToMenu,
      modeName: currentMode.translations[language].name,
      helperText: currentMode.translations[language].helperText,
      isPlaying,
      onPlayPause: handlePlayPauseWithRecording,
      isLoading,
      bpm
    };
    
    switch (selectedMode) {
      case 'rhyme-map':
        return (
          <RhymeMapMode
            {...commonProps}
            isRecordingEnabled={isRecordingEnabled}
            onRecordingToggle={handleRecordingToggle}
          />
        );
      case 'slot-machine':
        return (
          <SlotMachineMode
            {...commonProps}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onBarsPerRoundChange={handleBarsPerRoundChange}
          />
        );
      case 'rhyme-explorer':
        return (
          <RhymeExplorerMode
            {...commonProps}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
          />
        );
      case 'find-rhymes':
        return (
          <FindRhymesMode
            {...commonProps}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
          />
        );
      case 'four-bar':
        return (
          <FourBarMode
            {...commonProps}
            currentBar={currentBar}
            currentBeat={currentBeat}
            isWordChanging={isWordChanging}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
          />
        );
      case 'two-bar':
        return (
          <TwoBarMode
            {...commonProps}
            currentBar={currentBar}
            currentBeat={currentBeat}
            isWordChanging={isWordChanging}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
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
      <SecretTapArea />

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

      {!isTraining && <LanguageToggle />}
      <h1>{translate('app.title')}</h1>

      {!isTraining ? (
        <div className="setup-container">
          <div className="controls">
            <BeatSelector
              selectedBeatId={selectedBeatId}
              onBeatSelect={handleBeatSelect}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPauseWithRecording}
              isLoading={isLoading}
              currentBpm={bpm}
              onBpmChange={handleBpmChange}
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
              onPlayPause={handlePlayPauseWithRecording}
              isLoading={isLoading}
              currentBpm={bpm}
              onBpmChange={handleBpmChange}
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

export default App; 