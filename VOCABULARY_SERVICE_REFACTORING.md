# VocabularyService Refactoring Plan

## Scope
- Address vocabulary management issues: scattered CRUD, format inconsistency, duplicated storage access, and Finnish-only custom vocabularies.
- Provide a single, stable API for all components and future rhyme systems.

## Goals
1. Centralize management: single VocabularyService for CRUD.
2. Standardize formats: one canonical data shape for all vocabularies.
3. Expand language support: enable custom vocabularies for Finnish and English.
4. Improve validation: centralized processing and validation for word lists.

## Architecture
```text
VocabularyService
├── CRUD Operations (create, read, update, delete)
├── Format Standardization (old ↔ new format conversion)
├── Validation & Processing (word list → vocabulary structure)
├── Storage Management (localStorage abstraction)
└── Language Support (FI + EN custom vocabularies)
```

## API Contract (canonical)
- getVocabularyData(vocabId, language): returns canonical format only.
- getVocabularies(language): returns built-ins + customs for the language.
- Internally, adapters convert any legacy sources to the canonical format.
- Versioning: include an optional schemaVersion in returns for forward compatibility.

### Canonical format (summary)
```ts
type CanonicalVocabulary = Array<{
  pattern: string[];        // vowel pattern per syllable
  syllableCount: number;
  words: Array<{ word: string; syllables: string[] }>
}>;
```

## Migration Plan (Phase 1)
1. Implement VocabularyService with canonical returns and internal adapters.
2. Migrate custom vocabulary CRUD and storage to the service.
3. Keep compatibility shim for current consumers (temporary old-format mapping).
4. Enable EN custom vocabulary creation in UI and service.
5. Update components to depend only on VocabularyService.

## Success Criteria
- Single source of truth for vocabulary operations.
- Consistent data format across built-in and custom vocabularies.
- Multi-language custom vocabulary support (FI and EN).
- Simplified component logic; no direct localStorage access in UI.

## Status / Dependencies
- Status: Planning
- Dependency: Main refactoring plan Task #8

