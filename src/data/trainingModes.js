/**
 * Training Modes Configuration
 * ============================
 *
 * User-facing copy and per-mode UI strings for all training modes and tools.
 * Component wiring lives in modeRegistry.js; category and language gates derive from there.
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
        helperText: 'Click NEXT to see the next word and its rhyming pairs.\nIf you press START, the instrumental will play and words will change automatically.',
        barCountLabel: 'Bars per word:',
        barLengthOptions: {
          '1': '1 bar',
          '2': '2 bars',
          '4': '4 bars',
          '8': '8 bars'
        },
        prevButton: 'PREV',
        nextButton: 'NEXT',
        noRhymesFound: 'No rhymes found',
        showHints: 'Rhyme hints'
      },
      fi: {
        name: 'Yksittäiset Riimit',
        description: 'Selaa sanoja ja niiden riimejä laajentaaksesi sanavarastoasi',
        helperText: 'Klikkaa SEURAAVA nähdäksesi seuraavan sanan ja sen riimit. Kun painat START, instrumentaali alkaa soida ja sanat vaihtuvat automaattisesti.',
        barCountLabel: 'Tahteja per sana:',
        barLengthOptions: {
          '1': '1 tahti',
          '2': '2 tahtia',
          '4': '4 tahtia',
          '8': '8 tahtia'
        },
        prevButton: 'EDELLINEN',
        nextButton: 'SEURAAVA',
        noRhymesFound: 'Ei riimejä',
        showHints: 'Riimivihjeet'
      }
    }
  },
  {
    id: 'find-rhymes',
    icon: '🎯',
    difficulty: 'easy',
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
    id: 'setup-punchline',
    icon: '🎤',
    difficulty: 'medium',
    translations: {
      en: {
        name: 'Setup & Punchline',
        description: 'Setup & Punchline training with configurable length',
        helperText: 'Choose preferred length (2-4 bars), freestyle the setup rhymes, and finish with the punchline!',
        barCountLabel: 'Setup length (bars):',
        barLengthOptions: {
          '2': '2 bars',
          '4': '4 bars'
        },
        showHints: 'Show Rhyme Hints'
      },
      fi: {
        name: 'Setup & Punchline',
        description: 'Setup & Punchline harjoitus säädettävällä pituudella',
        helperText: 'Valitse haluamasi pituus (2-4 tahtia), freestylaa setup-riimit ja lopuksi tiputa punchline!',
        barCountLabel: 'Setupin pituus (tahteja):',
        barLengthOptions: {
          '2': '2 tahtia',
          '4': '4 tahtia'
        },
        showHints: 'Näytä riimien vihjeet'
      }
    }
  },
  {
    id: 'lyrics-writing',
    icon: '📝',
    difficulty: 'easy',
    translations: {
      fi: {
        name: 'Lyriikkamuistio',
        description: 'Kirjoita lyriikoita ja raahaa riimejä ehdotuksista tekstiin.',
        helperText: 'Kirjoita muistioon. Valitse sana nähdäksesi suomenkieliset riimit. Raahaa riimi tekstiin. ESC poistaa valinnan.',
        suggestionsTitle: 'Riimit',
        selected: 'Valittu',
        selectPrompt: 'Valitse sana editorissa',
        idleHint: 'Valitse sana nähdäksesi riimit tässä.',
        editorPlaceholder: 'Kirjoita lyriikoita... Valitse sana nähdäksesi riimit.',
        exactMatches: 'Tarkat osumat',
        extendedMatches: 'Laajennetut osumat',
        partialMatches: 'Lyhennetyt osumat',
        invalidWordError: 'Virheellinen sanarakenne',
        invalidPatternError: 'Vokaalikaavaa ei voitu määrittää',
        noMatchesFound: 'Rimmaavia sanoja ei löytynyt',
        dragToInsert: 'Raahaa editoriin lisätäksesi'
      }
    }
  },
  {
    id: 'rhyme-map',
    icon: '🗺️',
    difficulty: 'easy',
    translations: {
      en: {
        name: 'Rhyme Map',
        description: 'Visual grid of phoneme patterns found in the dictionary',
        helperText: 'Click on a phoneme pattern to see all words that follow that pattern.\nPatterns are organized by their phonetic structure.',
        patternTitle: 'Phoneme Pattern',
        wordCount: 'Words',
        searchPlaceholder: 'Search patterns...',
        backButton: 'BACK',
        patterns: 'patterns'
      },
      fi: {
        name: 'Riimikartta',
        description: 'Visuaalinen ruudukko vokaalikaavoja',
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
        description: 'Like Vegas, but for rappers! Three slots spinning to the instrumental.',
        helperText: 'Tell a story, find rhymes, or freestyle with what you get. Every spin is different!',
        barCountLabel: 'Bars between spins:',
        barLengthOptions: {
          '1': '1 bar',
          '2': '2 bars',
          '4': '4 bars',
          '8': '8 bars'
        }
      },
      fi: {
        name: 'Hedelmäpeli',
        description: 'Kuin kasino, mutta räppäreille! Kolme slottia pyörii instrumentaalin tahtiin.',
        helperText: 'Kerro tarina, etsi riimejä, tai freestylaa mitä saat. Joka pyöräytys on erilainen!',
        barCountLabel: 'Tahteja pyöräytysten välillä:',
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
      fi: {
        name: 'Riimihaku',
        description: 'Etsi sanoja jotka riimittyvät antamasi sanan kanssa',
        helperText: 'Kirjoita sana löytääksesi kaikki sen kanssa riimittyvät sanat. Klikkaa sanoja kerätäksesi ne kopiointia varten. Tulokset sisältävät tarkat osumat, laajennetut osumat samalla loppukaavalla, ja lyhennetyt osumat pidemmille sanoille.',
        searchPlaceholder: 'Kirjoita sana löytääksesi riimejä...',
        exactMatches: 'Tarkat osumat',
        extendedMatches: 'Laajennetut osumat',
        partialMatches: 'Lyhennetyt osumat',
        invalidWordError: 'Virheellinen sanarakenne',
        invalidPatternError: 'Vokaalikaavaa ei voitu määrittää',
        noMatchesFound: 'Rimmaavia sanoja ei löytynyt',
        more: 'lisää',
        randomize: 'Sekoita',
        words: 'sanaa',
        sortAlphabetical: 'Aakkosjärjestys',
        sortSimilarity: 'Samankaltaisuus',
        sortRandom: 'Satunnainen',
        copy: 'Kopioi',
        clear: 'Tyhjennä',
        clickToRemove: 'Poista klikkaamalla',
        copyToClipboard: 'Kopioi leikepöydälle',
        clearAll: 'Tyhjennä kaikki kerätyt sanat',
        baseWord: 'Hakusana'
      }
    }
  }
];
