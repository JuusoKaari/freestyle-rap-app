import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import { wordList } from './wordList'

function App() {
  const [isTraining, setIsTraining] = useState(false)
  const [targetWord, setTargetWord] = useState('')
  const [currentBar, setCurrentBar] = useState(0)
  const [bpm, setBpm] = useState(80)
  const [clicks, setClicks] = useState([])
  const [isCalculatingBpm, setIsCalculatingBpm] = useState(false)
  const [isWordChanging, setIsWordChanging] = useState(false)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [wordCounter, setWordCounter] = useState(0)
  const [shuffledWords, setShuffledWords] = useState([])
  const [nextWord, setNextWord] = useState('')

  const BARS_PER_LINE = 4
  const TOTAL_BARS = BARS_PER_LINE * 2
  
  const timerRef = useRef(null)
  const nextNoteTimeRef = useRef(0)
  const shouldUpdateWordsRef = useRef(true)

  const shuffleArray = (array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }

  const createTick = () => {
    const beatInterval = 60.0 / bpm / 4

    const tickFunction = () => {
      const currentTime = Date.now() / 1000
      
      if (nextNoteTimeRef.current <= currentTime + 0.1) {
        setCurrentBeat(prev => {
          const nextBeat = (prev + 1) % 4
          if (nextBeat === 0) {
            setCurrentBar(prevBar => {
              const nextBar = (prevBar + 1) % TOTAL_BARS
              if (nextBar === 0) {
                setIsWordChanging(true)
                if (wordCounter >= shuffledWords.length - 2) {
                  setShuffledWords(shuffleArray(wordList))
                  setWordCounter(0)
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
    if (isTraining) {
      nextNoteTimeRef.current = Date.now() / 1000
      const tick = createTick()
      tick()
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isTraining, bpm])

  const resetBeat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setCurrentBeat(0)
    setCurrentBar(0)
    shouldUpdateWordsRef.current = true
    
    const beatInterval = 60.0 / bpm / 4
    nextNoteTimeRef.current = (Date.now() / 1000) + beatInterval
    
    const tick = createTick()
    tick()
  }

  const handleBpmTap = () => {
    const now = Date.now()
    setClicks(prev => {
      const newClicks = [...prev, now].filter(click => now - click < 5000)
      
      if (newClicks.length > 1) {
        const intervals = []
        for (let i = 1; i < newClicks.length; i++) {
          intervals.push(newClicks[i] - newClicks[i - 1])
        }
        
        const averageInterval = intervals.reduce((a, b) => a + b) / intervals.length
        const calculatedBpm = Math.round(60000 / averageInterval)
        
        if (calculatedBpm >= 40 && calculatedBpm <= 200) {
          setBpm(calculatedBpm)
        }
      }
      
      return newClicks
    })
  }

  const startBpmCalculation = () => {
    setIsCalculatingBpm(true)
    setClicks([])
  }

  const stopBpmCalculation = () => {
    setIsCalculatingBpm(false)
    setClicks([])
  }

  const startTraining = () => {
    setShuffledWords(shuffleArray(wordList))
    setWordCounter(0)
    setIsTraining(true)
    setCurrentBar(0)
  }

  const increaseBpm = () => {
    setBpm(prev => Math.min(prev + 1, 200))
  }

  const decreaseBpm = () => {
    setBpm(prev => Math.max(prev - 1, 40))
  }

  const renderBar = (barIndex, line) => {
    const isActive = barIndex + (line - 1) * BARS_PER_LINE === currentBar
    const isTarget = line === 2 && barIndex === 3
    const isQuestionBlock = line === 1 && barIndex === 3

    if (isTarget) {
      return (
        <div 
          key={`bar-${barIndex}-${line}`}
          className="target-container"
        >
          <span 
            className={`bar target ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
          >
            {shuffledWords[wordCounter]}
          </span>
          <span className="next-word">
            Next: {shuffledWords[wordCounter + 1]}
          </span>
        </div>
      )
    }

    if (isQuestionBlock) {
      return (
        <span 
          key={`bar-${barIndex}-${line}`} 
          className={`bar question ${isActive ? 'active' : ''} ${isWordChanging ? 'changing' : ''}`}
        >
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
          <span className="floating-mark">?</span>
        </span>
      )
    }

    return (
      <span 
        key={`bar-${barIndex}-${line}`} 
        className={`bar ${isActive ? 'active' : ''}`}
      >
        - - - -
      </span>
    )
  }

  return (
    <div className="app">
      <h1>Freestyle Rap Trainer</h1>
      <div className="content">
        {!isTraining ? (
          <div className="setup-container">
            <div className="bpm-calculator">
              <p>Current BPM: {bpm}</p>
              {!isCalculatingBpm ? (
                <button className="bpm-button" onClick={startBpmCalculation}>
                  Calculate BPM
                </button>
              ) : (
                <div className="bpm-tap-container">
                  <button className="bpm-tap-button" onClick={handleBpmTap}>
                    Tap Rhythm ({clicks.length} taps)
                  </button>
                  <button className="bpm-stop-button" onClick={stopBpmCalculation}>
                    Done
                  </button>
                </div>
              )}
            </div>
            <button className="start-button" onClick={startTraining}>
              Start Training
            </button>
          </div>
        ) : (
          <>
            <div className="rhyme-pattern">
              <div className="line">
                {[0, 1, 2, 3].map((barIndex) => renderBar(barIndex, 1))}
              </div>
              <div className="line">
                {[0, 1, 2, 3].map((barIndex) => renderBar(barIndex, 2))}
              </div>
            </div>
            <div className="controls">
              <div className="bpm-controls">
                <button className="bpm-adjust-button" onClick={decreaseBpm}>-</button>
                <span className="bpm-display">{bpm} BPM</span>
                <button className="bpm-adjust-button" onClick={increaseBpm}>+</button>
              </div>
              <div className="playback-controls">
                <button 
                  className="reset-button"
                  onClick={resetBeat}
                  aria-label="Reset Beat"
                >
                  ↻
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App 