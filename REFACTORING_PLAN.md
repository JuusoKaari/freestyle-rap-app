# Freestyle Rap App - Refactoring Plan 🔧

## Overview

This document outlines systematic improvements to reduce code duplication, improve maintainability, and enhance the overall architecture of the Freestyle Rap Training application.

**Analysis Date**: January 2025
**Total Issues Identified**: 8
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

### 4. Create Centralized Storage Service

- **Issue**: localStorage management scattered across components
- **Impact**: Inconsistent error handling, code duplication
- **Effort**: 1.5 hours

**Tasks:**

- [ ] Create `src/services/StorageService.js`:

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

- [ ] Refactor localStorage usage in:
  - [ ] `TranslationContext.jsx` (language preferences)
  - [ ] `DebugContext.jsx` (debug mode)
  - [ ] `useRecordingController.js` (recordings)
  - [ ] `CustomVocabularyEditor.jsx` (custom vocabularies)
  - [ ] `VocabularySelectModal.jsx` (custom vocabularies)
  - [ ] `SetupPunchlineMode.jsx` (rhyme hints setting)
- [ ] Test all localStorage-dependent features

### 5. Improve Language-Specific Component Pattern

- **Issue**: `RhymeMapMode.jsx` is just a simple router wrapper
- **Impact**: Unnecessary abstraction layer
- **Effort**: 45 minutes

**Tasks:**

- [ ] Analyze if the wrapper pattern is needed for other modes
- [ ] Consider alternatives:
  - [ ] Higher-order component approach
  - [ ] Configuration-based language handling
  - [ ] Direct component selection in `TrainingModeRenderer.jsx`
- [ ] Implement chosen approach and test
- [ ] Update `TrainingModeRenderer.jsx` if needed

---

## 🟢 **LOW PRIORITY** (Future Improvements)

### 6. Standardize Error Handling

- **Issue**: Inconsistent error handling patterns throughout the app
- **Impact**: Poor user experience, debugging difficulties
- **Effort**: 2 hours

**Tasks:**

- [ ] Create `src/services/ErrorService.js` for centralized error handling
- [ ] Replace `alert()` calls with toast notifications:
  - [ ] `CustomVocabularyEditor.jsx`
  - [ ] Other components using alerts
- [ ] Implement React Error Boundary:
  - [ ] Create `src/components/ErrorBoundary.jsx`
  - [ ] Wrap main app sections
- [ ] Standardize error logging format
- [ ] Add user-friendly error messages
- [ ] Test error scenarios

### 7. Consolidate CSS Organization

- **Issue**: Mixed CSS organization (component-specific vs centralized)
- **Impact**: Potential style conflicts, maintenance overhead
- **Effort**: 1 hour

**Tasks:**

- [ ] Audit all CSS files and their usage
- [ ] Identify duplicate styles across files
- [ ] Choose consistent pattern:
  - [ ] **Option A**: All CSS in `/src/styles/`
  - [ ] **Option B**: Component CSS co-located with components
- [ ] Migrate files to chosen pattern
- [ ] Update import statements
- [ ] Test all component styling

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

- [ ] All training modes work correctly
- [ ] Beat playback and recording function
- [ ] Language switching works
- [ ] Vocabulary selection and custom vocabularies work
- [ ] Debug mode toggles correctly
- [ ] Audio controls respond properly
- [ ] No console errors in browser
- [ ] Mobile responsiveness maintained

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

- Professional error handling
- Consistent styling approach
- Centralized vocabulary management
- Better user experience

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
