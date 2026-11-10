/**
 * Feedback preference storage.
 * Remembers a successful submission, a survey dismissal, and whether this
 * browser was sampled into the proactive survey (about 30% of eligible users).
 */

import StorageService from './StorageService.js';
import { FEEDBACK_CONFIG } from '../data/appConfig.js';

const STORAGE_KEY = 'rheemyFeedback';

const emptyPreferences = () => ({
  submittedAt: null,
  dismissedAt: null,
  // null until the first time this browser is eligible and we roll once
  inSurveySample: null,
});

const readPreferences = () => {
  const stored = StorageService.get(STORAGE_KEY, null);
  if (!stored || typeof stored !== 'object') return emptyPreferences();

  return {
    submittedAt: typeof stored.submittedAt === 'number' ? stored.submittedAt : null,
    dismissedAt: typeof stored.dismissedAt === 'number' ? stored.dismissedAt : null,
    inSurveySample: typeof stored.inSurveySample === 'boolean' ? stored.inSurveySample : null,
  };
};

const writePreferences = (preferences) => {
  StorageService.set(STORAGE_KEY, preferences);
};

/** A successful send permanently stops the automatic survey on this browser. */
export const markFeedbackSubmitted = (now = Date.now()) => {
  const preferences = readPreferences();
  preferences.submittedAt = now;
  writePreferences(preferences);
};

/** Dismissal hides the survey until the cooldown has passed. */
export const markSurveyDismissed = (now = Date.now()) => {
  const preferences = readPreferences();
  preferences.dismissedAt = now;
  writePreferences(preferences);
};

/**
 * Whether the proactive survey may open for this browser.
 * The 30% sample is chosen once, the first time the user is eligible,
 * and then remembered. Call this only after the training-time check.
 */
export const shouldShowProactiveSurvey = (now = Date.now()) => {
  const preferences = readPreferences();

  if (preferences.submittedAt) return false;

  if (
    preferences.dismissedAt &&
    now - preferences.dismissedAt < FEEDBACK_CONFIG.dismissalCooldownMs
  ) {
    return false;
  }

  if (preferences.inSurveySample === false) return false;

  if (preferences.inSurveySample === null) {
    preferences.inSurveySample = Math.random() < FEEDBACK_CONFIG.surveySampleRate;
    writePreferences(preferences);
    if (!preferences.inSurveySample) return false;
  }

  return true;
};
