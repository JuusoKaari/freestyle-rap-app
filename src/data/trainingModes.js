export const trainingModes = [
  {
    id: 'rhyme-explorer',
    translations: {
      en: {
        name: 'Rhyme Explorer',
        description: 'Browse through words and their rhyming pairs to expand your vocabulary',
        helperText: 'Click NEXT to see the next word and its rhyming pairs.\n If you press START, beat will play and words will change automatically.',
        themedRhymes: 'Themed Rhymes',
        otherRhymes: 'Other Rhymes',
        prevButton: 'PREV',
        nextButton: 'NEXT'
      },
      fi: {
        name: 'Riimien Selaus',
        description: 'Selaa sanoja ja niiden riimejä laajentaaksesi sanavarastoasi',
        helperText: 'Klikkaa SEURAAVA nähdäksesi seuraavan sanan ja sen riimit. Kun painat START, biitti alkaa soida ja sanat vaihtuu automaattisesti.',
        themedRhymes: 'Teeman Riimit',
        otherRhymes: 'Muut Riimit',
        prevButton: 'EDELLINEN',
        nextButton: 'SEURAAVA'
      }
    }
  },
  {
    id: 'find-rhymes',
    translations: {
      en: {
        name: 'Find Rhymes',
        description: 'Click on words that rhyme with the target word before time runs out',
        helperText: 'Find and click all words that rhyme with the center word. Green means correct, red means wrong!'
      },
      fi: {
        name: 'Etsi Riimit',
        description: 'Klikkaa sanoja jotka riimittyvät kohdesanan kanssa ennen ajan loppumista',
        helperText: 'Etsi ja klikkaa kaikki sanat jotka riimittyvät keskellä olevan sanan kanssa. Vihreä tarkoittaa oikein, punainen väärin!'
      }
    }
  },
  {
    id: 'two-bar',
    translations: {
      en: {
        name: '2-bar Setup & Punchline',
        description: 'Classic training with one missing setup rhyme and random target word',
        helperText: 'Come up with the rhyming word matching the target word, spit that out and then proceed to the punchline!'
      },
      fi: {
        name: '2-tahdin Setup & Punchline',
        description: 'Harjoitus yhdellä setup-riimillä ja satunnaisella kohdesanalla',
        helperText: 'Keksi kohdesanaan sopiva riimi, räppää se ja siirry punchlinen pariin!'
      }
    }
  },
  {
    id: 'four-bar',
    translations: {
      en: {
        name: '4-bar Setup & Punchline',
        description: 'Classic training with three setup words and a random target word',
        helperText: 'Come up with the 3 matching rhymes for the target word, spit those out and then proceed to the punchline for maximal impact!'
      },
      fi: {
        name: '4-tahdin Setup & Punchline',
        description: 'Harjoitus kolmella setup-riimillä ja satunnaisella kohdesanalla',
        helperText: 'Keksi kohdesanaan sopivat 3 riimiä, räppää ne ja finalisoi homma punchline riimillä!'
      }
    }
  }
]; 