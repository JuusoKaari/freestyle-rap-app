# Rhyme System Unification Plan

## Scope
- Unify rhyme logic across the app: reconcile RhymeHandler and RhymeSearch differences.
- Align rules, scoring, and vocabulary sources for consistent results.

## Goals
1. Unify algorithms: single/double vowel handling, consonant weighting.
2. Standardize quality: consistent scoring and filtering.
3. Optimize performance: pre-computed vs real-time strategies.
4. Enhance fallbacks: multi-tier matching (exact → extended → partial).

## Architecture
```text
Enhanced RhymeHandler
├── Linguistic Rules (single/double vowel, consonant weighting)
├── Multi-Tier Matching (exact → extended → partial)
├── Quality Scoring (similarity + distinctive consonants)
├── Vocabulary Awareness (themed vs full dict context)
└── Performance Modes (pre-computed vs real-time)
```

## Integration Contract
- Consumes VocabularyService canonical API (no direct file/localStorage reads).
- Accepts CanonicalVocabulary and full dictionary in canonical shape.
- Avoids format assumptions beyond the contract.

## Migration Plan (Phase 2/3)
1. Document exact differences between current rhyme implementations.
2. Define unified linguistic rule specification and scoring model.
3. Implement enhanced RhymeHandler behind a feature flag.
4. Replace/align RhymeSearch usages with the unified handler.
5. Remove temporary shims once consumers migrated.

## Success Criteria
- Consistent rhyme quality across modes.
- Unified rules and fallback strategies.
- Shared vocabulary source and context awareness.
- Maintained or improved performance.

## Status / Dependencies
- Status: Implemented and enabled (handlers + WordListService + FI Search)
- Dependency: VocabularyService canonical contract available

## Differences (documented)
- Handlers vs FI Search:
  - Handlers: group-based exact/slant logic, consume themed + full dicts.
  - FI Search: computes patterns from raw input, queries full dict by suffix; includes custom similarity sorting in UI.
- Unified handler now provides tiers (exact/extended/partial) and similarity scoring; FI Search consumes it when `VITE_RHYME_UNIFIED` is enabled.

