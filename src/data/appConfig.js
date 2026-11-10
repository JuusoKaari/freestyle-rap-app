/**
 * Application Feature Configuration
 * =================================
 * Central flags for language-gated features, feedback, and the optional
 * video interview. Mode language availability lives in modeRegistry.js.
 */

export const APP_FEATURES = {
  /** Languages that support user-created custom vocabularies */
  customVocabularyLanguages: ['fi'],
};

/**
 * Feedback forms and the optional video interview.
 * Both the Feedback button and the proactive survey post to the same form.
 *
 * Formspree dashboard (set these on the form, not in code):
 * - Do not require an email field. Rheemy does not ask for one.
 * - Leave the message field optional so a survey can be sent with only a category.
 */
export const FEEDBACK_CONFIG = {
  /**
   * Formspree form id — the last segment of https://formspree.io/f/mkjjdnzr.
   * Replace this value to point submissions at a different form.
   */
  formspreeFormId: 'mkjjdnzr',

  /**
   * YourVideoGuy interview URL.
   * Leave this empty to hide the video interview action.
   * Set a full http(s) URL to show it on the feedback form and thank-you screen.
   */
  videoInterviewUrl: '',

  /** Visible time inside a training mode before the survey can appear. */
  minTrainingActivityMs: 2 * 60 * 1000,

  /** Share of eligible browsers invited to the proactive survey (about 30%). */
  surveySampleRate: 0.3,

  /** After the survey is dismissed, wait this long before offering it again. */
  dismissalCooldownMs: 30 * 24 * 60 * 60 * 1000,
};

/** Stable usage categories. `value` is what gets submitted (always English). */
export const USAGE_CATEGORIES = [
  { id: 'freestyle', value: 'Practicing freestyle rap' },
  { id: 'rhyming', value: 'Improving my rhyming skills' },
  { id: 'lyrics', value: 'Writing lyrics' },
  { id: 'fun', value: 'Just having fun' },
  { id: 'other', value: 'Something else' },
];

/**
 * Returns the interview URL when it is a real http(s) link, otherwise null.
 * An empty or invalid value hides the video interview action.
 */
export const getVideoInterviewUrl = () => {
  const raw = FEEDBACK_CONFIG.videoInterviewUrl;
  if (typeof raw !== 'string') return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    return parsed.href;
  } catch {
    return null;
  }
};

export const isCustomVocabularyEnabled = (language) =>
  APP_FEATURES.customVocabularyLanguages.includes(language);
