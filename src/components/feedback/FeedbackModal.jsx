/**
 * Shared feedback dialog.
 * Used for the Feedback button (a free-text note) and the proactive survey
 * (one required choice, then an optional note). Both post to Formspree.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from '@formspree/react';
import { FEEDBACK_CONFIG, USAGE_CATEGORIES, getVideoInterviewUrl } from '../../data/appConfig';
import { useTranslation } from '../../services/TranslationContext';
import { trackVideoInterviewClicked } from '../../services/AnalyticsService';
import '../../styles/Feedback.css';

const FOCUSABLE = [
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'a[href]',
].join(', ');

const VideoInterviewOffer = () => {
  const { translate } = useTranslation();
  const url = getVideoInterviewUrl();
  if (!url) return null;

  return (
    <div className="feedback-video">
      <a
        className="feedback-video-link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackVideoInterviewClicked()}
      >
        {translate('feedback.video.action')}
      </a>
      <p>{translate('feedback.video.explanation')}</p>
    </div>
  );
};

const FeedbackModal = ({ variant, trainingMode, onClose, onSubmitted }) => {
  const { translate, language } = useTranslation();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const requestCloseRef = useRef(() => {});
  const submittedReportedRef = useRef(false);
  const payloadRef = useRef({});
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [clientError, setClientError] = useState(null);

  const isSurvey = variant === 'survey';

  payloadRef.current = {
    feedbackType: variant,
    language,
    trainingMode: trainingMode || '',
  };
  onCloseRef.current = onClose;

  const [state, handleSubmit, resetForm] = useForm(FEEDBACK_CONFIG.formspreeFormId, {
    data: {
      feedback_type: () => payloadRef.current.feedbackType,
      language: () => payloadRef.current.language,
      training_mode: () => payloadRef.current.trainingMode || undefined,
      submitted_at: () => new Date().toISOString(),
      _subject: () => (
        payloadRef.current.feedbackType === 'survey'
          ? 'Rheemy feedback (survey)'
          : 'Rheemy feedback (manual)'
      ),
    },
  });

  const submittingRef = useRef(false);
  submittingRef.current = state.submitting;

  const showThanks = state.succeeded && !state.errors;

  useEffect(() => {
    if (!showThanks || submittedReportedRef.current) return;
    submittedReportedRef.current = true;
    onSubmitted();
  }, [showThanks, onSubmitted]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;

    const focusInitial = () => {
      const target = dialog?.querySelector('[data-autofocus]');
      target?.focus();
    };
    const focusFrame = window.requestAnimationFrame(focusInitial);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        requestCloseRef.current();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (!showThanks) return;
    dialogRef.current?.querySelector('[data-thanks-close]')?.focus();
  }, [showThanks]);

  useEffect(() => {
    if (!isSurvey || !selectedCategory) return;
    dialogRef.current?.querySelector('.feedback-followup')?.scrollIntoView({ block: 'nearest' });
  }, [isSurvey, selectedCategory]);

  const requestClose = () => {
    if (state.submitting) return;
    onClose({ submitted: state.succeeded });
  };
  requestCloseRef.current = requestClose;

  const onOverlayMouseDown = (event) => {
    if (event.target === event.currentTarget) requestClose();
  };

  const onMessageChange = (event) => {
    setMessage(event.target.value);
    if (clientError) setClientError(null);
    if (state.errors) resetForm();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed !== message) setMessage(trimmed);

    if (!isSurvey && !trimmed) {
      setClientError('empty');
      return;
    }
    if (isSurvey && !selectedCategory) {
      setClientError('category');
      return;
    }
    if (!FEEDBACK_CONFIG.formspreeFormId) {
      setClientError('generic');
      return;
    }

    setClientError(null);
    const data = new FormData(event.currentTarget);
    if (trimmed) data.set('message', trimmed);
    else data.delete('message');

    try {
      await handleSubmit(data);
    } catch {
      setClientError('generic');
    }
  };

  const title = translate(isSurvey ? 'feedback.survey.title' : 'feedback.manual.title');
  const descriptionId = isSurvey ? 'feedback-survey-question' : 'feedback-description';
  const serverError = !clientError && state.errors && !state.submitting && !showThanks;

  return (
    <div className="feedback-overlay" onMouseDown={onOverlayMouseDown}>
      <div
        className="feedback-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        aria-describedby={showThanks ? 'feedback-thanks' : descriptionId}
        aria-busy={state.submitting}
        ref={dialogRef}
        tabIndex={-1}
      >
        <div className="feedback-header">
          <h2 id="feedback-title">{showThanks ? translate('feedback.thanks.title') : title}</h2>
          <button
            type="button"
            className="feedback-close"
            onClick={requestClose}
            disabled={state.submitting}
            aria-label={translate('feedback.close')}
            data-thanks-close={showThanks ? '' : undefined}
          >
            ×
          </button>
        </div>

        {showThanks ? (
          <div className="feedback-body">
            <p id="feedback-thanks" className="feedback-thanks">{translate('feedback.thanks.message')}</p>
            <VideoInterviewOffer />
            <button type="button" className="feedback-submit" onClick={requestClose}>
              {translate('feedback.close')}
            </button>
          </div>
        ) : (
          <form className="feedback-body" onSubmit={onSubmit} noValidate>
            {!isSurvey && (
              <>
                <p id="feedback-description" className="feedback-description">
                  {translate('feedback.manual.description')}
                </p>
                <label className="feedback-label" htmlFor="feedback-message">
                  {translate('feedback.manual.question')}
                </label>
              </>
            )}

            {isSurvey && (
              <div
                className="feedback-options"
                role="radiogroup"
                aria-labelledby="feedback-survey-question"
              >
                <p id="feedback-survey-question" className="feedback-label">
                  {translate('feedback.survey.question')}
                </p>
                {USAGE_CATEGORIES.map((category, index) => (
                  <button
                    key={category.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedCategory === category.value}
                    className={`feedback-option ${selectedCategory === category.value ? 'is-selected' : ''}`}
                    data-autofocus={index === 0 ? '' : undefined}
                    onClick={() => {
                      setSelectedCategory(category.value);
                      if (clientError) setClientError(null);
                    }}
                    onKeyDown={(event) => {
                      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) return;
                      event.preventDefault();
                      const forward = event.key === 'ArrowDown' || event.key === 'ArrowRight';
                      const nextIndex = (index + (forward ? 1 : -1) + USAGE_CATEGORIES.length) % USAGE_CATEGORIES.length;
                      const next = USAGE_CATEGORIES[nextIndex];
                      setSelectedCategory(next.value);
                      if (clientError) setClientError(null);
                      const options = dialogRef.current?.querySelectorAll('[role="radio"]');
                      options?.[nextIndex]?.focus();
                    }}
                  >
                    {translate(`feedback.survey.options.${category.id}`)}
                  </button>
                ))}
              </div>
            )}

            {isSurvey && selectedCategory && (
              <input type="hidden" name="usage_category" value={selectedCategory} />
            )}

            {(!isSurvey || selectedCategory) && (
              <div className="feedback-followup">
                {isSurvey && (
                  <label className="feedback-label" htmlFor="feedback-message">
                    {translate('feedback.survey.improveQuestion')}
                  </label>
                )}
                <textarea
                  id="feedback-message"
                  name="message"
                  className="feedback-text"
                  rows={isSurvey ? 3 : 4}
                  maxLength={4000}
                  value={message}
                  placeholder={translate(isSurvey
                    ? 'feedback.survey.improvePlaceholder'
                    : 'feedback.manual.placeholder')}
                  data-autofocus={isSurvey ? undefined : ''}
                  aria-required={isSurvey ? undefined : true}
                  aria-invalid={clientError === 'empty' ? true : undefined}
                  aria-describedby={clientError || serverError ? 'feedback-error' : undefined}
                  onChange={onMessageChange}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
              </div>
            )}

            <input
              type="text"
              name="_gotcha"
              className="feedback-gotcha"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            {(clientError || serverError) && (
              <p id="feedback-error" className="feedback-error" role="alert">
                {translate(clientError ? `feedback.errors.${clientError}` : 'feedback.errors.generic')}
              </p>
            )}

            {(!isSurvey || selectedCategory) && (
              <button type="submit" className="feedback-submit" disabled={state.submitting}>
                {state.submitting
                  ? translate(isSurvey ? 'feedback.survey.submitting' : 'feedback.manual.submitting')
                  : translate(isSurvey ? 'feedback.survey.submit' : 'feedback.manual.submit')}
              </button>
            )}

            {!isSurvey && <VideoInterviewOffer />}
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
