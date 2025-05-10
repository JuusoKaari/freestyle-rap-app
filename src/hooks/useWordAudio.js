import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../services/TranslationContext';

/**
 * Hook for handling word audio playback in training modes
 * @param {string} vocabularyId - The ID of the current vocabulary (e.g., 'FI_elaimet')
 * @returns {Object} Audio control methods and state
 */
export const useWordAudio = (vocabularyId) => {
  const { language } = useTranslation();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isAudioAvailable, setIsAudioAvailable] = useState(false);
  const [audioMetadata, setAudioMetadata] = useState(null);
  const [audioElement] = useState(() => {
    const audio = new Audio();
    audio.loop = false;
    audio.autoplay = false;
    return audio;
  });

  // Check if audio is available for this vocabulary
  useEffect(() => {
    const checkAudioAvailability = async () => {
      if (!vocabularyId) return;

      try {
        let metadata = null;

        if (vocabularyId === 'all') {
          // For 'all' vocabulary, we need to combine metadata from all official vocabularies
          const { getVocabularies } = await import('../data/vocabulary/vocabularyConfig');
          const officialVocabs = getVocabularies(language);
          
          if (!officialVocabs || officialVocabs.length === 0) {
            console.log(`No official vocabularies found for language: ${language}`);
            setIsAudioAvailable(false);
            setIsAudioEnabled(false);
            return;
          }

          // Combine metadata from all official vocabularies
          const combinedMetadata = {};
          for (const vocab of officialVocabs) {
            try {
              const normalizedVocabId = vocab.id.split('_').map((part, index) => 
                index === 0 ? part.toUpperCase() : part.toLowerCase()
              ).join('_');
              
              const vocabMetadata = await import(`../data/vocabulary_audio_metadata/${normalizedVocabId}_audio_metadata.js`);
              // Merge the metadata, keeping the first occurrence of each word
              Object.entries(vocabMetadata.default).forEach(([lang, words]) => {
                if (!combinedMetadata[lang]) {
                  combinedMetadata[lang] = {};
                }
                Object.entries(words).forEach(([word, url]) => {
                  if (!combinedMetadata[lang][word]) {
                    combinedMetadata[lang][word] = url;
                  }
                });
              });
            } catch (error) {
              console.log(`No audio available for vocabulary: ${vocab.id}`);
            }
          }
          metadata = combinedMetadata;
        } else {
          // For individual vocabularies, use the existing logic
          const normalizedVocabId = vocabularyId.split('_').map((part, index) => 
            index === 0 ? part.toUpperCase() : part.toLowerCase()
          ).join('_');
          
          const metadataModule = await import(`../data/vocabulary_audio_metadata/${normalizedVocabId}_audio_metadata.js`);
          metadata = metadataModule.default;
        }

        if (metadata && Object.keys(metadata).length > 0) {
          setAudioMetadata(metadata);
          setIsAudioAvailable(true);
        } else {
          console.log(`No audio available for vocabulary: ${vocabularyId}`);
          setIsAudioAvailable(false);
          setIsAudioEnabled(false);
        }
      } catch (error) {
        console.log(`Error loading audio metadata for vocabulary: ${vocabularyId}`, error);
        setIsAudioAvailable(false);
        setIsAudioEnabled(false);
      }
    };

    checkAudioAvailability();
  }, [vocabularyId, language]);

  // Get the phonetic version of a word if available
  const getPhoneticVersion = useCallback((word) => {
    // Remove any hyphens, underscores, and spaces
    return word.replace(/-/g, '').replace(/_/g, '').replace(/\s+/g, '');
  }, []);

  // Preload audio for a word without playing it
  const preloadWordAudio = useCallback(async (word, language = 'fi') => {
    if (!isAudioAvailable || !audioMetadata) return;

    // Get the phonetic version if available
    const phoneticWord = getPhoneticVersion(word);

    // Convert language to lowercase for metadata lookup
    const normalizedLanguage = language.toLowerCase();
    const audioUrl = audioMetadata[normalizedLanguage]?.[phoneticWord];
    if (!audioUrl) {
      return;
    }

    try {
      // Create a temporary audio element for preloading
      const tempAudio = new Audio();
      tempAudio.src = audioUrl;
      // Start loading the audio file
      await tempAudio.load();
    } catch (error) {
      // Silently fail on preload errors
      console.log(`Failed to preload audio for word: ${word}`);
    }
  }, [isAudioAvailable, audioMetadata, getPhoneticVersion]);

  // Play audio for a specific word
  const playWordAudio = useCallback(async (word, language = 'fi') => {
    if (!isAudioEnabled || !isAudioAvailable || !audioMetadata) return;

    // Get the phonetic version if available
    const phoneticWord = getPhoneticVersion(word);

    // Convert language to lowercase for metadata lookup
    const normalizedLanguage = language.toLowerCase();
    const audioUrl = audioMetadata[normalizedLanguage]?.[phoneticWord];
    if (!audioUrl) {
      console.log(`No audio found for word: ${word}`);
      return;
    }

    try {
      audioElement.src = audioUrl;
      audioElement.currentTime = 0;
      await audioElement.play();
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error playing audio:', error);
      }
    }
  }, [isAudioEnabled, isAudioAvailable, audioMetadata, audioElement, getPhoneticVersion]);

  // Toggle audio on/off
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      audioElement.pause();
      audioElement.src = '';
    };
  }, [audioElement]);

  return {
    isAudioEnabled,
    isAudioAvailable,
    toggleAudio,
    playWordAudio,
    preloadWordAudio
  };
}; 