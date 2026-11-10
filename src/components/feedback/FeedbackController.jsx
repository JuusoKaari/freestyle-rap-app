/**
 * Feedback entry point.
 * Shows the Feedback button on every screen, and opens the proactive survey
 * after the user has spent time on a training screen and come back to the menu.
 * Practice time follows the training route, so time on the menu is not counted.
 * Debug mode adds a button that opens the survey immediately for production checks.
 * That preview still posts to Formspree, and it does not change survey eligibility.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FEEDBACK_CONFIG } from '../../data/appConfig';
import { useTrainingActivity } from '../../hooks/useTrainingActivity';
import { useDebug } from '../../services/DebugContext';
import { useTranslation } from '../../services/TranslationContext';
import {
  markFeedbackSubmitted,
  markSurveyDismissed,
  shouldShowProactiveSurvey,
} from '../../services/feedbackPreferences';
import {
  trackFeedbackModalOpened,
  trackFeedbackSubmitted,
  trackProactiveSurveyDismissed,
  trackProactiveSurveyDisplayed,
} from '../../services/AnalyticsService';
import FeedbackModal from './FeedbackModal';
import '../../styles/Feedback.css';

const FeedbackController = ({ isInTrainingMode, isPlaying, isOnMenu, trainingMode }) => {
  const { translate } = useTranslation();
  const { isDebugMode } = useDebug();
  // Declared first so its effect commits practice time before the survey effect reads it.
  const trainingMsRef = useTrainingActivity(isInTrainingMode);
  const wasTrainingRef = useRef(false);
  const lastModeRef = useRef(null);
  const submittedRef = useRef(false);
  const pendingSurveyRef = useRef(false);
  // True while the open dialog was launched from the debug test button.
  const adminPreviewRef = useRef(false);
  const [modal, setModal] = useState(null);
  const [modalTrainingMode, setModalTrainingMode] = useState(null);
  const modalRef = useRef(null);

  modalRef.current = modal;

  useEffect(() => {
    if (trainingMode) lastModeRef.current = trainingMode;
  }, [trainingMode]);

  const openSurvey = useCallback(() => {
    adminPreviewRef.current = false;
    submittedRef.current = false;
    setModalTrainingMode(lastModeRef.current);
    setModal('survey');
    trackProactiveSurveyDisplayed();
  }, []);

  const openAdminSurvey = () => {
    if (modalRef.current) return;
    adminPreviewRef.current = true;
    pendingSurveyRef.current = false;
    submittedRef.current = false;
    setModalTrainingMode(trainingMode || lastModeRef.current);
    setModal('survey');
  };

  useEffect(() => {
    if (isInTrainingMode) {
      wasTrainingRef.current = true;
      // Leave a debug preview open so it can be checked on a training screen.
      if (modalRef.current === 'survey' && !adminPreviewRef.current) setModal(null);
      return;
    }

    if (!wasTrainingRef.current) return;
    // Wait until they are actually back on the menu and audio has stopped.
    if (!isOnMenu || isPlaying) return;

    wasTrainingRef.current = false;
    if (trainingMsRef.current < FEEDBACK_CONFIG.minTrainingActivityMs) return;
    if (!shouldShowProactiveSurvey()) return;

    if (modalRef.current) {
      if (!adminPreviewRef.current) pendingSurveyRef.current = true;
      return;
    }

    openSurvey();
  }, [isInTrainingMode, isOnMenu, isPlaying, trainingMsRef, openSurvey]);

  const openManual = () => {
    if (modalRef.current) return;
    adminPreviewRef.current = false;
    submittedRef.current = false;
    setModalTrainingMode(trainingMode || null);
    setModal('manual');
    trackFeedbackModalOpened();
  };

  const handleSubmitted = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (adminPreviewRef.current) return;
    markFeedbackSubmitted();
    trackFeedbackSubmitted(modalRef.current === 'survey' ? 'survey' : 'manual');
  };

  const handleClose = ({ submitted = false } = {}) => {
    if (submitted) handleSubmitted();
    const current = modalRef.current;
    const didSubmit = submittedRef.current;
    submittedRef.current = false;

    if (current === 'survey' && !didSubmit) {
      if (!adminPreviewRef.current) {
        markSurveyDismissed();
        trackProactiveSurveyDismissed();
      }
      adminPreviewRef.current = false;
      pendingSurveyRef.current = false;
      setModal(null);
      return;
    }

    adminPreviewRef.current = false;

    setModal(null);

    if (pendingSurveyRef.current && !didSubmit && shouldShowProactiveSurvey()) {
      pendingSurveyRef.current = false;
      openSurvey();
      return;
    }

    pendingSurveyRef.current = false;
  };

  return (
    <>
      {isDebugMode && (
        <button
          type="button"
          className="feedback-admin-launcher"
          onClick={openAdminSurvey}
        >
          Test survey
        </button>
      )}
      <button
        type="button"
        className="feedback-launcher"
        onClick={openManual}
        aria-haspopup="dialog"
        aria-expanded={modal !== null}
      >
        {translate('feedback.button')}
      </button>
      {modal && (
        <FeedbackModal
          key={modal}
          variant={modal}
          trainingMode={modalTrainingMode}
          onClose={handleClose}
          onSubmitted={handleSubmitted}
        />
      )}
    </>
  );
};

export default FeedbackController;
