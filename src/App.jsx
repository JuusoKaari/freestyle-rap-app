import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { generateWordList } from './data/wordList'
import TwoBarMode from './components/modes/TwoBarMode'
import FourBarMode from './components/modes/FourBarMode'
import ModeSelector from './components/ModeSelector'
import BeatSelector from './components/BeatSelector'
import CompactBeatSelector from './components/CompactBeatSelector'
import VocabularySelector from './components/VocabularySelector'
import { trainingModes } from './data/trainingModes'
import { beats } from './data/beats'

function App() {
  const [isTraining, setIsTraining] = useState(false)
  const [selectedMode, setSelectedMode] = useState(null)
  const [currentBar, setCurrentBar] = useState(0)
  const [bpm, setBpm] = useState(75)
  const [isWordChanging, setIsWordChanging] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [wordCounter, setWordCounter] = useState(0)
  const [shuffledWords, setShuffledWords] = useState([])
  const [selectedBeatId, setSelectedBeatId] = useState('night-ride')
  const [selectedVocabulary, setSelectedVocabulary] = useState('generic_rap')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const timerRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const audioRef = useRef(null)

  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const getTotalBars = () => {
    switch (selectedMode) {
      case 'four-bar':
        return 16; // 4 lines * 4 bars
      case 'two-bar':
      default:
        return 8; // 2 lines * 4 bars
    }
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
                      setShuffledWords(shuffleArray(words));
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
    return () => {
      stopPlayback();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isPlaying && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [isPlaying]);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setCurrentBeat(0);
    setCurrentBar(0);
    setIsWordChanging(false);
    setIsPlaying(false);
  };

  const handleModeSelect = async (modeId) => {
    stopPlayback();
    setSelectedMode(modeId);
    const words = await generateWordList({ 
      count: 100, 
      minWordsInGroup: 3,
      vocabulary: selectedVocabulary 
    });
    if (words.length > 0) {
      setShuffledWords(shuffleArray(words));
      setWordCounter(0);
      setIsTraining(true);
    }
  };

  const handleReturnToMenu = () => {
    stopPlayback();
    setIsTraining(false);
    setSelectedMode(null);
  };

  const handleBeatSelect = (beatId) => {
    stopPlayback();
    const selectedBeat = beats.find(beat => beat.id === beatId);
    setSelectedBeatId(beatId);
    
    if (selectedBeat) {
      setBpm(selectedBeat.bpm);
      const audioPath = `/freestyle-rap-app/beats/${selectedBeat.file}`;
      console.log('Loading audio from:', audioPath);
      
      if (audioRef.current) {
        audioRef.current.src = audioPath;
      }
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }

    setIsLoading(true);

    // Start everything from the beginning
    if (!audioRef.current && selectedBeatId) {
      const selectedBeat = beats.find(beat => beat.id === selectedBeatId);
      const audioPath = `/freestyle-rap-app/beats/${selectedBeat.file}`;
      console.log('Creating new audio element with path:', audioPath);
      
      audioRef.current = new Audio(audioPath);
      audioRef.current.loop = true;
    }

    if (audioRef.current) {
      // First, stop any existing playback
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Reset states
      setCurrentBeat(0);
      setCurrentBar(0);
      setIsWordChanging(false);
      audioRef.current.currentTime = 0;

      // Wait for audio to be ready and then start everything together
      audioRef.current.oncanplaythrough = () => {
        // Remove the event listener to prevent multiple calls
        audioRef.current.oncanplaythrough = null;

        // Start audio first
        const playPromise = audioRef.current.play();
        
        playPromise.then(() => {
          setIsLoading(false);
          // Only start visual timing if in training mode
          if (isTraining) {
            // Add 200ms delay before starting visuals to compensate for audio latency
            setTimeout(() => {
              const beatInterval = 60.0 / bpm / 4;
              nextNoteTimeRef.current = (Date.now() / 1000) + beatInterval;
              
              const tick = createTick();
              tick();
            }, 200);
          }
          
          setIsPlaying(true);
        }).catch(error => {
          setIsLoading(false);
          console.error('Error playing audio:', error);
        });
      };

      // Handle loading errors
      audioRef.current.onerror = () => {
        setIsLoading(false);
        console.error('Error loading audio');
      };

      // Trigger the loading/playing process
      audioRef.current.load();
    }
  };

  const renderTrainingMode = () => {
    const currentMode = trainingModes.find(mode => mode.id === selectedMode);
    
    switch (selectedMode) {
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
            modeName={currentMode.name}
            helperText={currentMode.helperText}
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
            modeName={currentMode.name}
            helperText={currentMode.helperText}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  // Initialize the audio with default beat
  useEffect(() => {
    const defaultBeat = beats.find(beat => beat.id === 'night-ride');
    if (defaultBeat) {
      const audioPath = `/freestyle-rap-app/beats/${defaultBeat.file}`;
      audioRef.current = new Audio(audioPath);
      audioRef.current.loop = true;
    }
  }, []);

  // Load initial words when vocabulary changes
  useEffect(() => {
    generateWordList({ 
      count: 100, 
      minWordsInGroup: 3,
      vocabulary: selectedVocabulary 
    }).then(words => {
      if (words.length > 0) {
        setShuffledWords(shuffleArray(words));
      }
    });
  }, [selectedVocabulary]);

  return (
    <div className="app">
      <div className="version-number">v{process.env.APP_VERSION || ''}</div>
      <h1>Freestyle Rap Trainer</h1>
      <div className="content">
        {!isTraining ? (
          <>
            <div className="setup-container">
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
          </>
        ) : (
          <>
            <CompactBeatSelector
              selectedBeatId={selectedBeatId}
              onBeatSelect={handleBeatSelect}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              isLoading={isLoading}
            />
            {renderTrainingMode()}
          </>
        )}
      </div>
    </div>
  );
}

export default App 