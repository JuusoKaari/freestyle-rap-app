## Lyrics Writing Mode — Concept Plan

### Overview
- **Goal**: Provide a focused lyrics notepad that surfaces rhymes for the currently selected text and lets the user insert them fluidly via drag-and-drop or click-to-insert.
- **Inspiration**: Similar discovery logic as `src/components/trainingModes/RhymeSearchMode_FI.jsx`, but centered around a writing-first workflow.

### Core UX
- **Notepad-first**: A large editable area for writing lines (single or multi-line), optimized for typing and quick selection.
- **Reactive selection**: When the user selects a word or a phrase, the app automatically searches for rhymes/slant rhymes and shows them in a side panel.
- **Insert via drag-and-drop only**: Users drag a suggested word into the notepad to insert or replace the selection. No click-to-insert.
- **Stay in flow**: Non-blocking UI; suggestions update as selection changes, without stealing focus from the editor.
 - **Always-visible panel**: Suggestions remain visible side-by-side or stacked above/below the editor, adapting responsively.

### Rhyme Discovery
- **Source**: Reuse unified rhyme logic (e.g., `EnhancedRhymeHandler` + `VocabularyService` canonical dictionary for FI) to fetch exact/extended/partial matches.
- **Trigger**: On selection change or caret-anchored word detection, debounce and query rhyme candidates for the selected token.
- **Normalization**: Lowercase, trim punctuation, handle hyphenation; keep original casing for insertion.
- **Limits**: Reasonable cap per bucket (e.g., show top N) with lazy expand if needed.

### Sidebar / Suggestions Panel
- **Sections**: Group by match type (Exact, Extended, Partial) with counts. Provide sorting (Similarity/Alphabetical/Random) consistent with `SORT_METHODS`.
- **Chips/tiles**: Compact, draggable items; hover shows small tooltips.
- **Controls**: Sort toggles, copy-to-clipboard for current list, optional filters (e.g., syllable length).

### Insert & Edit Behavior
- **Drag-and-drop**: Drop target is the notepad; dropping over a selection replaces it, otherwise inserts at drop caret.
- **Punctuation & casing**: Preserve surrounding punctuation; adjust casing to match selected word style if replacing.
- **Undo-friendly**: Single action per insert/replace to integrate with browser undo/redo.

### Persistence & Draft Management
- **Autosave**: Save drafts to local storage at intervals and on blur; allow manual copy/export.
- **Session restore**: Restore last draft on return; provide clear button.

### Accessibility & Keyboard
- **Keyboard**: Arrow keys and Enter behave natively in the editor (move caret; Enter adds newline). No keyboard navigation for suggestions. Esc clears selection (panel stays visible).
- **Focus management**: Editor retains focus after suggestion interactions; announcements for screen readers.

### Error & Edge Cases
- **Empty/invalid selection**: Panel remains visible; show a gentle prompt to select a word.
- **Multi-word selection**: Use last word or headword for rhyme search; indicate which token is targeted.
- **Very long tokens**: Truncate display; still attempt rhyme search with sane limits.

### Integration Points
- **i18n**: Use `TranslationContext` for UI strings and mode name.
- **Data**: FI dictionaries via canonical mapping; aligns with existing rhyme services.
- **Style**: Reuse training mode container styles; add a dedicated notepad + sidebar layout.

### Future Enhancements (Optional)
- **Pinned sets**: Let users pin favorite rhymes and reuse across drafts.
- **Context-aware**: Consider preceding/following words for better slant suggestions.
- **Meter aid**: Visualize syllable counts in the sidebar for selected line.

