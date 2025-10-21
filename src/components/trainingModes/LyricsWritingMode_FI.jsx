/**
 * LyricsWritingMode_FI Component
 * ==============================
 *
 * Finnish lyrics writing tool with a notepad editor and an always-visible
 * rhyme suggestions panel. Selecting text in the editor triggers rhyme
 * lookups; users can drag-and-drop suggestions into the editor to insert
 * or replace the current selection. ESC clears selection. Keyboard behavior
 * in the editor remains native (arrows move caret, Enter inserts newline).
 *
 * Props (BaseTrainingMode):
 * - onReturnToMenu, modeName, helperText, isPlaying, onPlayPause, isLoading
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import BaseTrainingMode from './BaseTrainingMode';
import '../../styles/trainingModeStyles/LyricsWritingMode.css';
import { useTranslation } from '../../services/TranslationContext';
import { trainingModes } from '../../data/trainingModes';
import { splitIntoSyllables, getSyllableVowelPattern } from '../../utils/wordProcessor';
import { EnhancedRhymeHandler } from '../../services/rhyming/EnhancedRhymeHandler';
import { getCanonicalFullDictionary, canonicalToGroupMap } from '../../services/VocabularyService';

const STORAGE_KEY = 'lyricsWritingDraft_fi_v1';

const LyricsWritingModeFI = ({
  onReturnToMenu,
  modeName,
  helperText,
  isPlaying,
  onPlayPause,
  isLoading,
}) => {
  const { language } = useTranslation();
  const translations = trainingModes.find(mode => mode.id === 'lyrics-writing').translations[language];

  const editorRef = useRef(null);
  const editorContainerRef = useRef(null);
  const lastRangeRef = useRef(null);

  const [draft, setDraft] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');
  const [dropCaret, setDropCaret] = useState(null); // {left, top, height}

  // Load draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setDraft(saved);
        if (editorRef.current) {
          editorRef.current.innerText = saved;
        }
      } else {
        // Initialize with 10 newlines for comfortable line drops
        const initial = "\n\n\n\n\n\n\n\n\n\n";
        setDraft(initial);
        if (editorRef.current) {
          editorRef.current.innerText = initial;
        }
      }
    } catch {}
  }, []);

  // Autosave draft
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, draft);
    } catch {}
  }, [draft]);

  // Process rhyme search from selected text
  const processSearch = (raw) => {
    const word = (raw || '').trim();
    if (!word) {
      setSearchResults(null);
      setError('');
      return;
    }

    const cleanWord = word.toLowerCase().replace(/\s+/g, '');
    if (!cleanWord) {
      setSearchResults(null);
      setError('');
      return;
    }

    const syllabified = splitIntoSyllables(cleanWord);
    if (!syllabified) {
      setError(translations.invalidWordError || 'Invalid word structure');
      setSearchResults(null);
      return;
    }

    const [vowelPattern, syllableCount] = getSyllableVowelPattern(syllabified);
    if (!vowelPattern || !syllableCount) {
      setError(translations.invalidPatternError || 'Could not determine vowel pattern');
      setSearchResults(null);
      return;
    }

    const exactPattern = vowelPattern.join('-');
    const searchWordNoDashes = cleanWord.replace(/-/g, '');
    const results = [];

    const fullCanonical = getCanonicalFullDictionary('fi_generic_rap');
    const fullDict = canonicalToGroupMap(fullCanonical);
    const themedDict = {};

    const handler = new EnhancedRhymeHandler('fi');
    const { full } = handler.findUnifiedRhymes(cleanWord, exactPattern, themedDict, fullDict, {
      maxPerBucket: 150,
      minRequired: 1,
    });

    const exactWords = full
      .filter(r => r.group === exactPattern && !r.isSlant)
      .map(r => r.word.replace(/-/g, ''))
      .filter(w => w !== searchWordNoDashes && w !== cleanWord);

    const extendedWords = full
      .filter(r => r.isSlant && r.group)
      .map(r => r.word.replace(/-/g, ''))
      .filter(w => w !== searchWordNoDashes && w !== cleanWord);

    const partialWords = full
      .filter(r => !r.group)
      .map(r => r.word.replace(/-/g, ''))
      .filter(w => w !== searchWordNoDashes && w !== cleanWord);

    if (exactWords.length > 0) {
      results.push(['exact', { pattern: exactPattern, words: Array.from(new Set(exactWords)) }]);
    }
    if (extendedWords.length > 0) {
      results.push(['extended', { pattern: `*-${exactPattern}`, words: Array.from(new Set(extendedWords)) }]);
    }
    if (partialWords.length > 0 && results.length === 0) {
      results.push(['partial', { pattern: `*-${vowelPattern.slice(-1).join('-')}`, words: Array.from(new Set(partialWords)) }]);
    }

    if (results.length > 0) {
      setError('');
      setSearchResults(results);
    } else {
      setError(translations.noMatchesFound || 'No rhyming words found');
      setSearchResults(null);
    }
  };

  // Debounce selection-based search
  useEffect(() => {
    const handle = setTimeout(() => {
      processSearch(selectedText);
    }, 250);
    return () => clearTimeout(handle);
  }, [selectedText]);

  // Selection helpers
  const getSelectedToken = (value, start, end) => {
    if (start == null || end == null || start === end) return '';
    const selected = value.slice(start, end);
    // If multi-word selection, use the last word token
    const tokens = selected.trim().split(/\s+/);
    const last = tokens[tokens.length - 1] || '';
    // Strip punctuation typical around words
    return last.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
  };

  const onEditorSelectLikeEvent = () => {
    const el = editorRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setSelectedText('');
      return;
    }
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer) || !el.contains(range.endContainer)) {
      setSelectedText('');
      return;
    }
    const selected = sel.toString();
    if (!selected || selected.trim() === '') {
      // Keep previous selection token to preserve suggestions
      return;
    }
    const tokens = selected.trim().split(/\s+/);
    const last = tokens[tokens.length - 1] || '';
    const token = last.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    setSelectedText(token);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSelectedText('');
      setSearchResults(null);
      setError('');
      setDropCaret(null);
      // Clear selection visually
      const sel = window.getSelection();
      if (sel) sel.removeAllRanges();
    }
  };

  // Drag & Drop from suggestions to editor
  const handleDragStart = (e, word) => {
    e.dataTransfer.setData('text/plain', word);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const updateDropCaretFromPoint = (clientX, clientY) => {
    const el = editorRef.current;
    const container = editorContainerRef.current;
    if (!el || !container) return;
    let range = null;
    if (document.caretRangeFromPoint) {
      range = document.caretRangeFromPoint(clientX, clientY);
    } else if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(clientX, clientY);
      if (pos) {
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      }
    }
    if (!range) return;
    if (!el.contains(range.startContainer)) return;
    lastRangeRef.current = range;
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const editorRect = el.getBoundingClientRect();
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 18;

    let top;
    let left;

    if ((rect.width === 0 && rect.height === 0) || !isFinite(rect.top) || !isFinite(rect.left)) {
      // Fallback: position caret based on mouse position, clamped within editor bounds
      const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft) || 2;
      const minLeft = (editorRect.left - containerRect.left) + paddingLeft;
      const proposedLeft = clientX - containerRect.left;
      left = Math.max(minLeft, proposedLeft);
      top = clientY - containerRect.top;
    } else {
      top = rect.top - containerRect.top;
      left = rect.left - containerRect.left;
    }

    const height = Math.max(rect.height || 0, lineHeight);
    setDropCaret({ left, top, height });
  };

  const handleEditorDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    updateDropCaretFromPoint(e.clientX, e.clientY);
  };

  const handleEditorDrop = (e) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (!word) return;
    const el = editorRef.current;
    if (!el) return;
    // Determine drop range (use last computed during dragover or compute now)
    let range = lastRangeRef.current;
    if (!range) {
      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }
    }
    if (!range || !el.contains(range.startContainer)) return;

    // Build text insertion with spacing based on neighbors
    const preCharRange = range.cloneRange();
    preCharRange.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
    const preChar = preCharRange.toString().slice(-1);
    const postCharRange = range.cloneRange();
    postCharRange.setEnd(range.endContainer, Math.min(range.endContainer.length || 0, range.endOffset + 1));
    const postChar = postCharRange.toString().charAt(0);
    const needsSpaceBefore = preChar && !/\s/.test(preChar);
    const needsSpaceAfter = postChar && !/\s/.test(postChar);
    const textToInsert = `${needsSpaceBefore ? ' ' : ''}${word}${needsSpaceAfter ? ' ' : ''}`;

    const node = document.createTextNode(textToInsert);
    range.insertNode(node);
    // Build a range right after inserted text
    const afterRange = document.createRange();
    afterRange.setStart(node, node.textContent.length);
    afterRange.collapse(true);

    // Clear indicator and update draft now
    setDropCaret(null);
    setDraft(el.innerText);

    // Ensure focus and visible caret after drop
    requestAnimationFrame(() => {
      el.focus();
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(afterRange);
      }
      // Re-run search for the previously selected token to keep suggestions visible
      if (selectedText) {
        processSearch(selectedText);
      }
    });
  };

  // Highlight rhyming words present in the editor when there is a selection and results
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapeHTML = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const getCaretOffsetWithin = (el) => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) return null;
    const preRange = range.cloneRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.startContainer, range.startOffset);
    return preRange.toString().length;
  };

  const setCaretOffsetWithin = (el, targetOffset) => {
    if (targetOffset == null) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let currentOffset = 0;
    let node = walker.nextNode();
    while (node) {
      const nextOffset = currentOffset + node.textContent.length;
      if (targetOffset <= nextOffset) {
        const offsetInNode = Math.max(0, targetOffset - currentOffset);
        const range = document.createRange();
        range.setStart(node, offsetInNode);
        range.collapse(true);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        return;
      }
      currentOffset = nextOffset;
      node = walker.nextNode();
    }
    // Fallback to end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const hasHighlights = el.querySelector('.rhyme-hit') != null;

    if (selectedText && searchResults && searchResults.length > 0) {
      const wordsSet = new Set();
      try {
        searchResults.forEach(([_, { words }]) => {
          words.forEach((w) => wordsSet.add(w.toLowerCase()));
        });
      } catch {}
      if (wordsSet.size === 0) return;

      const escaped = Array.from(wordsSet).sort((a, b) => b.length - a.length).map(escapeRegExp);
      if (escaped.length === 0) return;
      const pattern = `(?<!\\p{L})(?:${escaped.join('|')})(?!\\p{L})`;
      const re = new RegExp(pattern, 'giu');
      const source = el.innerText || '';
      const caret = getCaretOffsetWithin(el);
      const html = escapeHTML(source).replace(re, (m) => `<span class="rhyme-hit">${m}</span>`).replace(/\n/g, '<br/>');
      if (el.innerHTML !== html) {
        el.innerHTML = html;
        if (document.activeElement === el && caret != null) setCaretOffsetWithin(el, caret);
      }
      return;
    }

    // No selection/results: clear previous highlights only if present
    if (hasHighlights) {
      const caret = getCaretOffsetWithin(el);
      const plain = escapeHTML(el.innerText || '').replace(/\n/g, '<br/>');
      if (el.innerHTML !== plain) {
        el.innerHTML = plain;
        if (document.activeElement === el && caret != null) setCaretOffsetWithin(el, caret);
      }
    }
  }, [selectedText, searchResults]);

  const renderSuggestions = () => {
    return (
      <div className="suggestions-panel">
        <div className="suggestions-header">
          <div className="panel-title">{translations.suggestionsTitle || 'Rhymes'}</div>
          <div className="panel-subtitle">
            {selectedText ? `${translations.selected || 'Selected'}: ${selectedText}` : (translations.selectPrompt || 'Select a word in the editor')}
          </div>
        </div>
        <div className="suggestions-content">
          {error && <div className="error-message">{error}</div>}
          {!error && !searchResults && (
            <div className="placeholder">{translations.idleHint || 'Select a word to see rhymes here.'}</div>
          )}
          {!error && searchResults && searchResults.map(([type, { pattern, words }]) => (
            <div key={`${type}-${pattern}`} className="suggestion-section">
              <div className="section-header">
                <span className="section-title">
                  {type === 'exact' ? (translations.exactMatches || 'Exact') : type === 'extended' ? (translations.extendedMatches || 'Extended') : (translations.partialMatches || 'Partial')}
                </span>
                <span className="section-pattern">{pattern.replace('*-', '')}</span>
                <span className="section-count">({words.length})</span>
              </div>
              <div className="chips">
                {words.slice(0, 80).map((w, idx) => (
                  <span
                    key={`${w}-${idx}`}
                    className="chip"
                    draggable
                    onDragStart={(e) => handleDragStart(e, w)}
                    title={translations.dragToInsert || 'Drag into editor to insert'}
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <BaseTrainingMode
      modeName={modeName}
      helperText={helperText}
      onReturnToMenu={onReturnToMenu}
      isPlaying={isPlaying}
      onPlayPause={onPlayPause}
      isLoading={isLoading}
    >
      <div className="lyrics-writing">
        <div className="editor-panel" ref={editorContainerRef}>
          <div
            ref={editorRef}
            className="lyrics-editor"
            contentEditable
            suppressContentEditableWarning
            onInput={(e) => setDraft(e.currentTarget.innerText)}
            onSelect={onEditorSelectLikeEvent}
            onKeyUp={onEditorSelectLikeEvent}
            onMouseUp={onEditorSelectLikeEvent}
            onKeyDown={handleKeyDown}
            onDrop={handleEditorDrop}
            onDragOver={handleEditorDragOver}
            onDragLeave={() => setDropCaret(null)}
            data-placeholder={translations.editorPlaceholder || 'Kirjoita lyriikoita... Valitse sana nähdäksesi riimit.'}
          />
          {dropCaret && (
            <div
              className="drop-caret"
              style={{ left: `${dropCaret.left}px`, top: `${dropCaret.top}px`, height: `${dropCaret.height}px` }}
            />
          )}
        </div>
        {renderSuggestions()}
      </div>
    </BaseTrainingMode>
  );
};

export default LyricsWritingModeFI;


