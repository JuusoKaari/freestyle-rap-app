/**
 * Training Modes Configuration
 * =========================
 * 
 * Configuration file defining all available training modes in the application.
 * Each mode has specific settings and multilingual support.
 * 
 * Available Modes:
 * - Rhyme Explorer: Browse and learn rhyming words
 * - Find Rhymes: Interactive rhyme identification game
 * - Two-bar Mode: Practice with setup and punchline (2 bars)
 * - Four-bar Mode: Extended practice with longer patterns (4 bars)
 * - Rhyme Map: Visual grid of vowel rhyme patterns
 * - Rhyme Search: Search for rhyming words
 * 
 * Each mode configuration includes:
 * - Unique identifier
 * - Multilingual names and descriptions (FI/EN)
 * - Helper text for user guidance
 * - Mode-specific UI text and button labels
 * 
 * The configuration supports easy addition of new modes
 * and maintains consistent structure for all training types.
 */

export const trainingModes = [
  {
    id: 'rhyme-explorer',
    icon: '🔍',
    difficulty: 'easy',
    translations: {
      en: {
        name: 'Single Rhymes',
        description: 'Browse through words and their rhyming pairs to expand your vocabulary',
        helperText: 'Click NEXT to see the next word and its rhyming pairs.\n If you press START, beat will play and words will change automatically.',
        barCountLabel: 'Bars per word:',
        barLengthOptions: {
          '1': '1 bar',
          '2': '2 bars',
          '4': '4 bars',
          '8': '8 bars'
        },
        themedRhymes: '-themed Rhymes',
        otherRhymes: 'Other Rhymes',
        prevButton: 'PREV',
        nextButton: 'NEXT',
        noRhymesFound: 'No rhymes found'
      },
      fi: {
        name: 'Yksittäiset Riimit',
        description: 'Selaa sanoja ja niiden riimejä laajentaaksesi sanavarastoasi',
        helperText: 'Klikkaa SEURAAVA nähdäksesi seuraavan sanan ja sen riimit. Kun painat START, biitti alkaa soida ja sanat vaihtuu automaattisesti.',
        barCountLabel: 'Tahteja per sana:',
        barLengthOptions: {
          '1': '1 tahti',
          '2': '2 tahtia',
          '4': '4 tahtia',
          '8': '8 tahtia'
        },
        themedRhymes: '-teeman Riimit',
        otherRhymes: 'Muut Riimit',
        prevButton: 'EDELLINEN',
        nextButton: 'SEURAAVA',
        noRhymesFound: 'Ei riimejä'
      }
    }
  },
  {
    id: 'find-rhymes',
    icon: '🎯',
    difficulty: 'medium',
    translations: {
      en: {
        name: 'Find Rhymes',
        description: 'Click on words that rhyme with the target word before time runs out',
        helperText: 'Find and click all words that rhyme with the center word. Green means correct, red means wrong!',
        barCountLabel: 'Bars per word:',
        barLengthOptions: {
          '1': '1 bar',
          '2': '2 bars',
          '4': '4 bars',
          '8': '8 bars'
        }
      },
      fi: {
        name: 'Etsi Riimit',
        description: 'Klikkaa sanoja jotka riimittyvät kohdesanan kanssa ennen ajan loppumista',
        helperText: 'Etsi ja klikkaa kaikki sanat jotka riimittyvät keskellä olevan sanan kanssa. Vihreä tarkoittaa oikein, punainen väärin!',
        barCountLabel: 'Tahteja per sana:',
        barLengthOptions: {
          '1': '1 tahti',
          '2': '2 tahtia',
          '4': '4 tahtia',
          '8': '8 tahtia'
        }
      }
    }
  },
  {
    id: 'two-bar',
    icon: '🎤',
    difficulty: 'medium',
    translations: {
      en: {
        name: '2-bar Setup & Punchline',
        description: 'Classic training with one missing setup rhyme and random target word',
        helperText: 'Come up with the rhyming word matching the target word, spit that out and then proceed to the punchline!',
        showHints: 'Show Rhyme Hints'
      },
      fi: {
        name: '2-tahdin Setup & Punchline',
        description: 'Harjoitus yhdellä setup-riimillä ja satunnaisella kohdesanalla',
        helperText: 'Keksi kohdesanaan sopiva riimi, räppää se ja siirry punchlinen pariin!',
        showHints: 'Näytä riimien vihjeet'
      }
    }
  },
  {
    id: 'four-bar',
    icon: '🎤',
    difficulty: 'hard',
    translations: {
      en: {
        name: '4-bar Setup & Punchline',
        description: 'Classic training with three setup words and a random target word',
        helperText: 'Come up with the 3 matching rhymes for the target word, spit those out and then proceed to the punchline for maximal impact!',
        showHints: 'Show Rhyme Hints'
      },
      fi: {
        name: '4-tahdin Setup & Punchline',
        description: 'Harjoitus kolmella setup-riimillä ja satunnaisella kohdesanalla',
        helperText: 'Keksi kohdesanaan sopivat 3 riimiä, räppää ne ja finalisoi homma punchline riimillä!',
        showHints: 'Näytä riimien vihjeet'
      }
    }
  },
  {
    id: 'rhyme-map',
    icon: '🗺️',
    difficulty: 'easy',
    translations: {
      en: {
        name: 'English Rhyme Map',
        description: 'Visual grid of English phoneme patterns found in the dictionary',
        helperText: 'Click on a phoneme pattern to see all words that follow that pattern.\nPatterns are organized by their phonetic structure.',
        patternTitle: 'Phoneme Pattern',
        wordCount: 'Words',
        searchPlaceholder: 'Search patterns...',
        backButton: 'BACK',
        patterns: 'patterns'
      },
      fi: {
        name: 'Suomen Riimikartta',
        description: 'Visuaalinen ruudukko suomen kielen vokaalikaavoja',
        helperText: 'Klikkaa vokaalikaavaa nähdäksesi kaikki sanat jotka noudattavat sitä kaavaa.\nKaavat on järjestetty vokaalirakenteen mukaan (esim. "AA-AA", "AA-EE").',
        patternTitle: 'Vokaalikaava',
        wordCount: 'sanaa',
        searchPlaceholder: 'Etsi kaavoja...',
        backButton: 'TAKAISIN',
        patterns: 'kaavaa'
      }
    }
  },
  {
    id: 'slot-machine',
    icon: '🎰',
    difficulty: 'hard',
    translations: {
      en: {
        name: 'Slot Machine',
        description: 'Like Vegas, but for rappers! Three slots spinning to the beat.',
        helperText: 'Tell a story, find rhymes, or freestyle with what you get. Every spin is different!',
        barLengthLabel: 'Bars per round:',
        barLengthOptions: {
          '1': '1 bar',
          '2': '2 bars',
          '4': '4 bars',
          '8': '8 bars'
        }
      },
      fi: {
        name: 'Hedelmäpeli',
        description: 'Kuin kasino, mutta räppäreille! Kolme slottia pyörii biittiin.',
        helperText: 'Kerro tarina, etsi riimejä, tai freestylaa mitä saat. Joka pyöräytys on erilainen!',
        barLengthLabel: 'Tahteja per kierros:',
        barLengthOptions: {
          '1': '1 tahti',
          '2': '2 tahtia',
          '4': '4 tahtia',
          '8': '8 tahtia'
        }
      }
    }
  },
  {
    id: 'rhyme-search',
    icon: '🔎',
    difficulty: 'easy',
    translations: {
      en: {
        name: 'Rhyme Search',
        description: 'Search for words that rhyme with your input',
        helperText: 'Type a word to find all matching rhymes. Results include exact matches and extended matches with the same ending pattern.',
        searchPlaceholder: 'Enter a word to find rhymes...',
        exactMatches: 'Exact matches',
        extendedMatches: 'Extended matches',
        invalidWordError: 'Invalid word structure',
        invalidPatternError: 'Could not determine vowel pattern',
        noMatchesFound: 'No rhyming words found',
        more: 'more',
        randomize: 'Randomize',
        words: 'words',
        sortAlphabetical: 'Alphabetical',
        sortSimilarity: 'By Similarity',
        sortRandom: 'Random'
      },
      fi: {
        name: 'Riimihaku',
        description: 'Etsi sanoja jotka riimittyvät antamasi sanan kanssa',
        helperText: 'Kirjoita sana löytääksesi kaikki sen kanssa riimittyvät sanat. Tulokset sisältävät tarkat osumat ja laajennetut osumat samalla loppukaavalla.',
        searchPlaceholder: 'Kirjoita sana löytääksesi riimejä...',
        exactMatches: 'Tarkat osumat',
        extendedMatches: 'Laajennetut osumat',
        invalidWordError: 'Virheellinen sanarakenne',
        invalidPatternError: 'Vokaalikaavaa ei voitu määrittää',
        noMatchesFound: 'Riimiviä sanoja ei löytynyt',
        more: 'lisää',
        randomize: 'Sekoita',
        words: 'sanaa',
        sortAlphabetical: 'Aakkosjärjestys',
        sortSimilarity: 'Samankaltaisuus',
        sortRandom: 'Satunnainen'
      }
    }
  }
]; 