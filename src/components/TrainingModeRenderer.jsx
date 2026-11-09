/**
 * Training Mode Renderer Component
 * ==============================
 *
 * Renders the active training mode from modeRegistry with shared props,
 * language gates, and debug-only gates.
 */

import React, { useEffect } from 'react';
import { trainingModes } from '../data/trainingModes';
import { getModeEntry, isModeAvailable } from '../data/modeRegistry';
import { useTranslation } from '../services/TranslationContext';
import { trackTrainingStart } from '../services/AnalyticsService';
import { getVocabularies } from '../data/vocabulary/vocabularyConfig';
import ModeUnavailable from './ModeUnavailable';

const TrainingModeRenderer = ({
  selectedMode,
  onReturnToMenu,
  isPlaying,
  onPlayPause,
  isLoading,
  bpm,
  currentBar,
  beatInBar,
  isWordChanging,
  shuffledWords,
  wordCounter,
  isRecordingEnabled,
  onRecordingToggle,
  isDebugMode,
  selectedVocabulary,
  setWordCounter,
  setIsWordChanging
}) => {
  const { language } = useTranslation();
  const modeEntry = getModeEntry(selectedMode);
  const currentMode = trainingModes.find((mode) => mode.id === selectedMode);
  const modeTranslations = currentMode?.translations?.[language];

  useEffect(() => {
    if (isPlaying && selectedMode && selectedVocabulary) {
      const vocabularies = getVocabularies(language);
      const selectedVocabInfo = vocabularies.find((vocab) => vocab.id === selectedVocabulary);
      if (selectedVocabInfo) {
        trackTrainingStart(selectedMode, selectedVocabInfo.name);
      }
    }
  }, [isPlaying, selectedMode, selectedVocabulary, language]);

  if (!modeEntry || !currentMode || !modeTranslations) {
    console.log('No current mode found for:', selectedMode, language);
    return null;
  }

  if (!isModeAvailable(selectedMode, language, isDebugMode)) {
    return <ModeUnavailable onReturnToMenu={onReturnToMenu} />;
  }

  const commonProps = {
    onReturnToMenu,
    modeName: modeTranslations.name,
    helperText: modeTranslations.helperText,
    isPlaying,
    onPlayPause,
    isLoading,
    bpm,
    isDebugMode
  };

  const ModeComponent = modeEntry.component;

  switch (selectedMode) {
    case 'rhyme-map':
      return (
        <ModeComponent
          {...commonProps}
          isRecordingEnabled={isRecordingEnabled}
          onRecordingToggle={onRecordingToggle}
        />
      );
    case 'rhyme-search':
    case 'lyrics-writing':
      return <ModeComponent {...commonProps} />;
    case 'slot-machine':
      return (
        <ModeComponent
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          beatInBar={beatInBar}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
        />
      );
    case 'rhyme-explorer':
      return (
        <ModeComponent
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          selectedVocabulary={selectedVocabulary}
          beatInBar={beatInBar}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
        />
      );
    case 'find-rhymes':
      return (
        <ModeComponent
          {...commonProps}
          shuffledWords={shuffledWords}
          wordCounter={wordCounter}
          beatInBar={beatInBar}
          currentBar={currentBar}
          setWordCounter={setWordCounter}
          setIsWordChanging={setIsWordChanging}
        />
      );
    case 'setup-punchline':
      return (
        <ModeComponent
          {...commonProps}
          currentBar={currentBar}
          beatInBar={beatInBar}
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
