# Freestyle Rap App - Refactoring Plan 🔧

## Overview

This document outlines systematic improvements to reduce code duplication, improve maintainability, and enhance the overall architecture of the Freestyle Rap Training application.

**Analysis Date**: January 2025
**Total Issues Identified**: 8
**Issues Completed**: 7 ✅
**Estimated Time**: 2-3 days of focused work

---

## 🚨 **HIGH PRIORITY** (Fix First)

~~### 1. Remove Duplicate CSS File (DONE!)~~

~~### 2. Centralize Language Detection Logic (DONE!)~~

- **Issue**: `vocabulary.startsWith('en_')` duplicated 3+ times in `WordListService.js`
- **Impact**: DRY violation, maintenance overhead
- **Effort**: 30 minutes

**Tasks:**

- [x] Create `src/utils/languageUtils.js`:

```javascript
export const getLanguageFromVocabularyId = (vocabularyId) => {
  if (vocabularyId === 'all') return 'mixed';
  return vocabularyId.startsWith('en_') ? 'en' : 'fi';
};

export const isEnglishVocabulary = (vocabularyId) => {
  return getLanguageFromVocabularyId(vocabularyId) === 'en';
};
```

- [x] Update `WordListService.js` lines 45, 69, 179 to use the utility
- [x] Search for other instances of `startsWith('en_')` and refactor
- [x] Test all vocabulary-related functionality

---

## 🟡 **MEDIUM PRIORITY** (Next Sprint)

~~### 3. Consolidate Audio Service Initialization (DONE!)~~

- **Issue**: `audioService.initialize()` called from 4+ locations
- **Impact**: Potential initialization conflicts, unclear ownership
- **Effort**: 1 hour

**Tasks:**

- [x] Make `AudioService.initialize()` idempotent (safe to call multiple times)
- [x] Add initialization status tracking to AudioService
- [x] Review all initialization calls in:
  - [x] `useAudioController.js` (lines 58, 134)
  - [x] `useRecordingController.js` (line 43)
  - [x] `BeatSelector.jsx` (line 17)
  - [x] `CompactBeatSelector.jsx` (line 16)
- [x] Consolidate to single initialization point or ensure thread safety
- [x] Test audio functionality across all components

~~### 4. Create Centralized Storage Service (DONE!)~~

- **Issue**: localStorage management scattered across components
- **Impact**: Inconsistent error handling, code duplication
- **Effort**: 1.5 hours

**Tasks:**

- [x] Create `src/services/StorageService.js`:

```javascript
class StorageService {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
      return false;
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
      return false;
    }
  }
}
```

- [x] Refactor localStorage usage in:
  - [x] `TranslationContext.jsx` (language preferences)
  - [x] `DebugContext.jsx` (debug mode)
  - [x] `useRecordingController.js` (recordings)
  - [x] `CustomVocabularyEditor.jsx` (custom vocabularies)
  - [x] `VocabularySelectModal.jsx` (custom vocabularies)
  - [x] `SetupPunchlineMode.jsx` (rhyme hints setting)
  - [x] `vocabularyConfig.js` (custom vocabularies)
- [x] Test all localStorage-dependent features

---

## 🟢 **LOW PRIORITY** (Future Improvements)

~~### 6. Standardize Error Handling (DONE!)~~

- **Issue**: Inconsistent error handling patterns throughout the app
- **Impact**: Poor user experience, debugging difficulties
- **Effort**: 2 hours

**Tasks:**

- [x] Create `src/services/ErrorService.js` for centralized error handling
- [x] Replace `alert()` calls with toast notifications:
  - [x] `CustomVocabularyEditor.jsx`
  - [x] `VocabularySelectModal.jsx`
  - [x] Other components using alerts
- [x] Implement React Error Boundary:
  - [x] Create `src/components/ErrorBoundary.jsx`
  - [x] Wrap main app sections
- [x] Standardize error logging format
- [x] Add user-friendly error messages
- [x] Test error scenarios

~~### 7. Consolidate CSS Organization (DONE!)~~

- **Issue**: Mixed CSS organization (component-specific vs centralized)
- **Impact**: Potential style conflicts, maintenance overhead
- **Effort**: 1 hour

**Tasks:**

- [x] Audit all CSS files and their usage
- [x] Identify duplicate styles across files
- [x] Choose consistent pattern:
  - [x] **Option A**: All CSS in `/src/styles/`
  - [x] **Option B**: Component CSS co-located with components
- [x] Migrate files to chosen pattern
- [x] Update import statements
- [x] Test all component styling

**Implementation Notes:**
- Created `src/styles/trainingModeStyles/` subfolder for training mode CSS
- Moved all component CSS files from `src/components/` to `src/styles/`
- Moved all training mode CSS files to `src/styles/trainingModeStyles/`
- Updated all import statements to use new paths
- Maintained existing CSS in `src/styles/` that was already properly organized

### 8. Create Vocabulary Management Service

- **Issue**: Vocabulary logic scattered across multiple components
- **Impact**: Code duplication, maintenance complexity
- **Effort**: 2.5 hours

**Tasks:**

- [ ] Create `src/services/VocabularyService.js`:

```javascript
class VocabularyService {
  static getCustomVocabularies()
  static saveCustomVocabulary(vocabulary)
  static updateCustomVocabulary(id, vocabulary)
  static deleteCustomVocabulary(id)
  static validateVocabulary(words)
}
```

- [ ] Refactor vocabulary management logic from:
  - [ ] `CustomVocabularyEditor.jsx`
  - [ ] `VocabularySelectModal.jsx`
  - [ ] `vocabularyConfig.js`
- [ ] Centralize vocabulary validation logic
- [ ] Test all vocabulary operations

---

## 🎯 **Implementation Strategy**

### Phase 1: Quick Wins (Day 1)

- Complete HIGH PRIORITY items (1-2)
- Total time: ~35 minutes
- High impact, minimal risk

### Phase 2: Core Improvements (Day 2)

- Complete MEDIUM PRIORITY items (3-5)
- Total time: ~3.25 hours
- Moderate impact, some testing required

### Phase 3: Polish & Future-Proofing (Day 3)

- Complete LOW PRIORITY items (6-8)
- Total time: ~5.5 hours
- Long-term benefits, extensive testing

---

## 🧪 **Testing Checklist**

After each major change, verify:

- [x] All training modes work correctly
- [x] Beat playback and recording function
- [x] Language switching works
- [x] Vocabulary selection and custom vocabularies work
- [x] Debug mode toggles correctly
- [x] Audio controls respond properly
- [x] No console errors in browser
- [x] Mobile responsiveness maintained
- [x] Toast notifications work instead of alerts
- [x] Error boundaries catch React errors gracefully
- [x] Standardized error logging throughout services

---

## 🏆 **Expected Benefits**

### After High Priority Fixes:

- Reduced code bloat
- Eliminated duplicate logic
- Easier maintenance

### After Medium Priority Fixes:

- More robust audio handling
- Consistent data persistence
- Better error handling

### After Low Priority Fixes:

- ✅ Professional error handling (COMPLETED)
- Consistent styling approach
- Centralized vocabulary management
- ✅ Better user experience (COMPLETED)

---

## 📝 **Notes**

- Each task should be completed in a separate commit
- Test thoroughly after each major change
- Consider creating feature branches for larger changes
- Update documentation as needed
- Run the app after each change to ensure nothing breaks

**Started**: ___________
**Completed**: ___________
**Total Time Spent**: ___________
