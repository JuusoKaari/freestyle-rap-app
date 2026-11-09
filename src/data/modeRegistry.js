/**
 * Training Mode Registry
 * =====================
 * Single source of truth for mode components, categories, language availability,
 * and debug-only access. Derive Training Modes vs Tools from category.
 */

import RhymeExplorerMode from '../components/trainingModes/RhymeExplorerMode';
import FindRhymesMode from '../components/trainingModes/FindRhymesMode';
import SetupPunchlineMode from '../components/trainingModes/SetupPunchlineMode';
import SlotMachineMode from '../components/trainingModes/SlotMachineMode';
import RhymeMapMode from '../components/trainingModes/RhymeMapMode';
import RhymeSearchMode from '../components/trainingModes/RhymeSearchMode_FI';
import LyricsWritingModeFI from '../components/trainingModes/LyricsWritingMode_FI';

export const MODE_CATEGORY = {
  TRAINING: 'training',
  TOOL: 'tool',
};

export const modeRegistry = [
  { id: 'rhyme-explorer', component: RhymeExplorerMode, category: MODE_CATEGORY.TRAINING },
  { id: 'find-rhymes', component: FindRhymesMode, category: MODE_CATEGORY.TRAINING },
  { id: 'setup-punchline', component: SetupPunchlineMode, category: MODE_CATEGORY.TRAINING },
  { id: 'slot-machine', component: SlotMachineMode, category: MODE_CATEGORY.TRAINING },
  { id: 'rhyme-map', component: RhymeMapMode, category: MODE_CATEGORY.TOOL },
  { id: 'rhyme-search', component: RhymeSearchMode, languages: ['fi'], category: MODE_CATEGORY.TOOL },
  { id: 'lyrics-writing', component: LyricsWritingModeFI, languages: ['fi'], debugOnly: true, category: MODE_CATEGORY.TOOL },
];

export const getModeEntry = (modeId) => modeRegistry.find((mode) => mode.id === modeId);

export const isModeAvailable = (modeId, language, isDebugMode = false) => {
  const entry = getModeEntry(modeId);
  if (!entry) return false;
  if (entry.debugOnly && !isDebugMode) return false;
  if (entry.languages && !entry.languages.includes(language)) return false;
  return true;
};

export const getModesByCategory = (category, language, isDebugMode = false) =>
  modeRegistry.filter(
    (mode) => mode.category === category && isModeAvailable(mode.id, language, isDebugMode)
  );
