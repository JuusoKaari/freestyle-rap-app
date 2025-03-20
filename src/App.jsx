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
import { Helmet } from 'react-helmet-async'
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
import { HashRouter as Router, Routes, Route, useNavigate, useMatch, useLocation } from 'react-router-dom'

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const match = useMatch('/mode/:modeId');
  const currentModeId = match?.params?.modeId;
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
  const [syllableRange, setSyllableRange] = useState({ min: 2, max: 3 });

  // Update document title
  useEffect(() => {
    document.title = translate('app.title');
  }, [translate]);

  // Handle direct URL access to modes
  useEffect(() => {
    const initializeMode = async () => {
      if (currentModeId && !isTraining) {
        console.log('Initializing mode from URL:', currentModeId);
        setSelectedMode(currentModeId);
        setIsTraining(true);
        
        try {
          await handleBeatSelect(selectedBeatId);
        } catch (error) {
          console.error('Failed to initialize audio:', error);
        }
        
        if (currentModeId !== 'rhyme-map') {
          const words = await generateWordList({ 
            minWordsInGroup: 1,
            vocabulary: selectedVocabulary,
            includeRhymes: true,
            syllableRange
          });
          if (words.length > 0) {
            setShuffledWords(words);
            setWordCounter(0);
          }
        }
      }
    };

    initializeMode();
  }, [currentModeId, selectedVocabulary, syllableRange, isTraining]);

  // Load initial words when vocabulary changes
  useEffect(() => {
    generateWordList({ 
      minWordsInGroup: 3,
      vocabulary: selectedVocabulary,
      syllableRange
    }).then(words => {
      if (words.length > 0) {
        setShuffledWords(words);
      }
    });
  }, [selectedVocabulary, syllableRange]);

  // Handle mode selection
  const handleModeSelect = async (modeId) => {
    navigate(`/mode/${modeId}`);
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
      includeRhymes: true,
      syllableRange
    });
    if (words.length > 0) {
      setShuffledWords(words);
      setWordCounter(0);
      setIsTraining(true);
    }
  };

  // Handle return to menu
  const handleReturnToMenu = () => {
    navigate('/');
    stopPlayback();
    setIsTraining(false);
    setSelectedMode(null);
  };

  // Handle bar change
  const handleBarChange = (nextBar) => {
    // Only log and process if the bar has actually changed
    if (nextBar !== lastProcessedBarRef.current) {
      console.debug('[App] Bar changed:', { 
        from: lastProcessedBarRef.current, 
        to: nextBar,
        currentBeat,
        wordCounter,
        isWordChanging,
        timestamp: new Date().toISOString()
      });

      // Let the training modes handle their own word change logic
      // Just update the bar reference
      lastProcessedBarRef.current = nextBar;
    }
  };

  // Handle bars per round change
  const handleBarsPerRoundChange = (value) => {
    setBarsPerRound(value);
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
      () => handlePlayPause(8, handleBarChange) // Use 8 bars as the base unit to support all bar lengths
    );
  };

  // Reset isTraining state based on current route
  useEffect(() => {
    if (location.pathname === '/') {
      setIsTraining(false);
      setSelectedMode(null);
    }
  }, [location]);

  // Track beat changes
  useEffect(() => {
    console.debug('[App] Beat changed:', {
      beat: currentBeat,
      bar: currentBar,
      wordCounter,
      isWordChanging,
      timestamp: new Date().toISOString()
    });
  }, [currentBeat]);

  return (
    <div className={`app ${isDebugMode ? 'debug-mode' : ''}`}>
      <Helmet>
        <title>Rheemy - Freestyle Rap Training App</title>
        <meta name="description" content="Train your freestyle rap skills with Rheemy. Practice rhyming, flow, and wordplay with our interactive beat-based training modes." />
        <meta name="keywords" content="freestyle rap, rap training, rhyme practice, flow training, hip hop, rap app" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rheemy.com/" />
        <meta property="og:title" content="Rheemy - Freestyle Rap Training App" />
        <meta property="og:description" content="Train your freestyle rap skills with Rheemy. Practice rhyming, flow, and wordplay with our interactive beat-based training modes." />
        <meta property="og:image" content="https://rheemy.com/rheemy_somelogo_01_1200px.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://rheemy.com/" />
        <meta property="twitter:title" content="Rheemy - Freestyle Rap Training App" />
        <meta property="twitter:description" content="Train your freestyle rap skills with Rheemy. Practice rhyming, flow, and wordplay with our interactive beat-based training modes." />
        <meta property="twitter:image" content="https://rheemy.com/rheemy_somelogo_01_1200px.jpg" />

        {/* JSON-LD structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Rheemy",
            "description": "Train your freestyle rap skills with different exercises. Practice rhyming, rhythm, and wordplay in Finnish and English.",
            "url": "https://rheemy.com",
            "applicationCategory": "Education, Music",
            "operatingSystem": "Web",
            "browserRequirements": "Requires JavaScript",
            "image": "https://rheemy.com/rheemy_somelogo_01_1200px.jpg",
            "inLanguage": ["en", "fi"],
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Freestyle rap training",
              "Rhyme practice",
              "Flow training",
              "Beat-based exercises",
              "Bilingual support (Finnish and English)",
              "Interactive training modes"
            ]
          })}
        </script>
      </Helmet>

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

      <img 
        src="/rheemy_logo_01_470px_ALPHA.png" 
        alt="Rheemy" 
        className="app-logo"
      />
      {!isTraining && <div className="app-tagline">{translate('app.tagline')}</div>}

      <Routes>
        <Route path="/" element={
          <>
            {!isTraining && <LanguageToggle />}
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
                  syllableRange={syllableRange}
                  onSyllableRangeChange={setSyllableRange}
                />
              </div>
              <ModeSelector onSelectMode={handleModeSelect} />
            </div>
          </>
        } />
        <Route path="/mode/:modeId" element={
          <>
{/*             {console.log('Mode route render:', { 
              currentModeId,
              isTraining, 
              selectedMode, 
              wordsCount: shuffledWords.length,
              cause: isTraining ? 'training mode active' : 'initial/transition',
              isLoading,
              isPlaying
            })} */}
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
            {currentModeId && (
              <TrainingModeRenderer
                selectedMode={selectedMode || currentModeId}
                onReturnToMenu={handleReturnToMenu}
                currentBeat={currentBeat}
                currentBar={currentBar}
                isPlaying={isPlaying}
                onPlayPause={wrappedHandlePlayPause}
                isLoading={isLoading}
                bpm={bpm}
                isWordChanging={isWordChanging}
                shuffledWords={shuffledWords}
                wordCounter={wordCounter}
                barsPerRound={barsPerRound}
                onBarsPerRoundChange={handleBarsPerRoundChange}
                isRecordingEnabled={isRecordingEnabled}
                onRecordingToggle={handleRecordingToggle}
                isDebugMode={isDebugMode}
                selectedVocabulary={selectedVocabulary}
                setWordCounter={setWordCounter}
                setIsWordChanging={setIsWordChanging}
              />
            )}
          </>
        } />
      </Routes>

      {isRecordingsModalOpen && (
        <RecordingsModal
          recordings={recordings}
          onClose={() => setIsRecordingsModalOpen(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App; 