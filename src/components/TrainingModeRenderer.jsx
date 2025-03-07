/**
 * Training Mode Renderer Component
 * ==============================
 * 
 * Component responsible for rendering the appropriate training mode based on
 * the selected mode and managing common props distribution.
 * 
 * Key responsibilities:
 * - Selecting the correct training mode component
 * - Managing common props across modes
 * - Handling mode-specific prop requirements
 */

import React, { useEffect } from 'react';
import TwoBarMode from './modes/TwoBarMode';
import FourBarMode from './modes/FourBarMode';
import RhymeExplorerMode from './modes/RhymeExplorerMode';
import FindRhymesMode from './modes/FindRhymesMode';
import RhymeMapMode from './modes/RhymeMapMode';
import RhymeSearchMode from './modes/RhymeSearchMode_FI';
import SlotMachineMode from './modes/SlotMachineMode';
import { trainingModes } from '../data/trainingModes';
import { useTranslation } from '../services/TranslationContext';
import { trackTrainingStart } from '../services/AnalyticsService';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';

const TrainingModeRenderer = ({
  selectedMode,
  onReturnToMenu,
  isPlaying,
  onPlayPause,
  isLoading,
  bpm,
  currentBar,
  currentBeat,
  isWordChanging,
  shuffledWords,
  wordCounter,
  onBarsPerRoundChange,
  isRecordingEnabled,
  onRecordingToggle,
  isDebugMode,
  selectedVocabulary,
  setWordCounter,
  setIsWordChanging
}) => {
  const { language } = useTranslation();
  // console.log('TrainingModeRenderer:', { selectedMode, currentMode: trainingModes.find(mode => mode.id === selectedMode) });
  const currentMode = trainingModes.find(mode => mode.id === selectedMode);
  
  // Track when training mode starts
  useEffect(() => {
    if (isPlaying && selectedMode && selectedVocabulary) {
      const vocabularies = getVocabularies(language);
      const selectedVocabInfo = vocabularies.find(vocab => vocab.id === selectedVocabulary);
      if (selectedVocabInfo) {
        trackTrainingStart(selectedMode, selectedVocabInfo.name);
      }
    }
  }, [isPlaying, selectedMode, selectedVocabulary, language]);

  if (!currentMode) {
    console.log('No current mode found for:', selectedMode);
    return null;
  }

  const commonProps = {
    onReturnToMenu,
    modeName: currentMode.translations[language].name,
    helperText: currentMode.translations[language].helperText,
    isPlaying,
    onPlayPause,
    isLoading,
    bpm,
    isDebugMode
  };

  switch (selectedMode) {
    case 'rhyme-map':
      return (
        <RhymeMapMode
          {...commonProps}
          isRecordingEnabled={isRecordingEnabled}
          onRecordingToggle={onRecordingToggle}
        />
      );
    case 'rhyme-search':
      return (
        <RhymeSearchMode
          {...commonProps}
        />
      );
    case 'slot-machine':
      return (
        <SlotMachineMode
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          onBarsPerRoundChange={onBarsPerRoundChange}
          currentBeat={currentBeat}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
        />
      );
    case 'rhyme-explorer':
      return (
        <RhymeExplorerMode
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          selectedVocabulary={selectedVocabulary}
          currentBeat={currentBeat}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
          onBarsPerRoundChange={onBarsPerRoundChange}
        />
      );
    case 'find-rhymes':
      return (
        <FindRhymesMode
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          currentBeat={currentBeat}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
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
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
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
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
        />
      );
    default:
      return null;
  }
};

export default TrainingModeRenderer; 