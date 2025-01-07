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
import { generateWordList } from './services/WordListService'
import TrainingModeRenderer from './components/TrainingModeRenderer'
import ModeSelector from './components/ModeSelector'
import BeatSelector from './components/BeatSelector'
import CompactBeatSelector from './components/CompactBeatSelector'
import VocabularySelector from './components/VocabularySelector'
import LanguageToggle from './components/LanguageToggle'
import { trainingModes } from './data/trainingModes'
import { useTranslation } from './services/TranslationContext'
import { DebugProvider, useDebug } from './services/DebugContext'
import { useAudioController } from './hooks/useAudioController'
import { useRecordingController } from './hooks/useRecordingController'
import RecordToggle from './components/RecordToggle'
import RecordingsModal from './components/RecordingsModal'

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

  const {
    isRecordingEnabled,
    recordings,
    isRecordingsModalOpen,
    setIsRecordingsModalOpen,
    handleRecordingToggle,
    handlePlayPauseWithRecording
  } = useRecordingController();

  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedVocabulary, setSelectedVocabulary] = useState('all');
  const [isTraining, setIsTraining] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [wordCounter, setWordCounter] = useState(0);
  const [isWordChanging, setIsWordChanging] = useState(false);
  const [barsPerRound, setBarsPerRound] = useState(2);
  const lastProcessedBarRef = useRef(-1);

  // Update document title
  useEffect(() => {
    document.title = translate('app.title');
  }, [translate]);

  // Load initial words when vocabulary changes
  useEffect(() => {
    generateWordList({ 
      minWordsInGroup: 3,
      vocabulary: selectedVocabulary 
    }).then(words => {
      if (words.length > 0) {
        setShuffledWords(words);
      }
    });
  }, [selectedVocabulary]);

  // Handle mode selection
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
      setShuffledWords(words);
      setWordCounter(0);
      setIsTraining(true);
    }
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    stopPlayback();
    setIsTraining(false);
    setSelectedMode(null);
  };

  // Handle bar change
  const handleBarChange = (nextBar) => {
    if (nextBar === 0 && lastProcessedBarRef.current !== 0) {
      lastProcessedBarRef.current = 0;
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
        console.log(`Word change at ${new Date().toISOString()}`);
        setWordCounter(prev => prev + 1);
      }
      setTimeout(() => {
        setIsWordChanging(false);
      }, 450);
    } else if (nextBar !== 0) {
      lastProcessedBarRef.current = nextBar;
    }
  };

  // Handle bars per round change
  const handleBarsPerRoundChange = (value) => {
    setBarsPerRound(value);
  };

  // Get total bars based on mode
  const getTotalBars = () => {
    switch (selectedMode) {
      case 'two-bar':
        return 8; // 2 lines * 4 bars
      case 'four-bar':
        return 16; // 4 lines * 4 bars
      case 'slot-machine':
        return barsPerRound * 4; // Convert bars to beats
      default:
        return 8; // 2 lines * 4 bars
    }
  };

  const wrappedHandlePlayPause = async () => {
    await handlePlayPauseWithRecording(
      isPlaying,
      isTraining,
      {
        beatId: selectedBeatId,
        mode: selectedMode,
        vocabulary: selectedVocabulary,
        bpm: bpm
      },
      () => handlePlayPause(getTotalBars(), handleBarChange)
    );
  };

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
              onPlayPause={wrappedHandlePlayPause}
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
              onPlayPause={wrappedHandlePlayPause}
              isLoading={isLoading}
              currentBpm={bpm}
              onBpmChange={handleBpmChange}
            />
          </div>
          <TrainingModeRenderer
            selectedMode={selectedMode}
            onReturnToMenu={handleReturnToMenu}
            isPlaying={isPlaying}
            onPlayPause={wrappedHandlePlayPause}
            isLoading={isLoading}
            bpm={bpm}
            currentBar={currentBar}
            currentBeat={currentBeat}
            isWordChanging={isWordChanging}
            shuffledWords={shuffledWords}
            wordCounter={wordCounter}
            onBarsPerRoundChange={handleBarsPerRoundChange}
            isRecordingEnabled={isRecordingEnabled}
            onRecordingToggle={handleRecordingToggle}
            isDebugMode={isDebugMode}
          />
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