export const en = {
  app: {
    title: "RHEEMY",
    tagline: "makes you a better rapper",
    browser_warning: {
      title: "Browser Not Supported",
      message: "Your browser does not support the Web Audio API, which is required for audio playback and recording. Please use a modern browser like Chrome, Firefox, Safari, or Edge."
    }
  },
  common: {
    start: "Start",
    stop: "Stop",
    next: "Next",
    previous: "Previous",
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    select: "Select",
    close: "×",
    play: "Play",
    processing: "Processing...",
    edit: "Edit",
    delete: "Delete",
    done: "Done",
    menu: "Menu"
  },
  recording: {
    start: "Start Recording",
    stop: "Stop Recording",
    toggle: "Recording",
    enabled: "Recording Enabled",
    disabled: "Recording Disabled"
  },
  recordings: {
    title: "My Recordings",
    open: "Open Recordings",
    empty: "No recordings yet. Start recording your freestyle by enabling recording and playing an instrumental!"
  },
  vocabulary: {
    selector: {
      title: "Selected Vocabulary",
      description: "Choose the vocabulary set you want to practice with",
      change: "Change Vocabulary",
      no_vocabularies: "No vocabularies available for the selected language",
      word_count: "{{count}} words"
    },
    difficulty: {
      easy: "Easy",
      medium: "Medium",
      hard: "Hard"
    },
    filter: {
      syllable_count: "Syllable Count",
      words_selected: "{0}/{1} words selected",
      words_selected_all: "{0}/{1} words selected from all vocabularies",
      to: "to",
      additional_settings: "Additional Settings"
    },
    modal: {
      title: "Select Vocabulary",
      word_count: "{{count}} words",
      create_custom: "Create Custom Vocabulary",
      create_custom_desc: "Create your own custom vocabulary",
      selected: "Selected",
      confirm_delete: "Are you sure you want to delete this vocabulary?",
      delete_error: "Error deleting vocabulary. Please try again.",
      all_vocabularies: "All Vocabularies",
      all_vocabularies_desc: "Combine all available vocabularies"
    },
    editor: {
      title_create: "Create Custom Vocabulary",
      title_edit: "Edit Custom Vocabulary",
      name_label: "Vocabulary Name",
      name_placeholder: "Enter a name for your vocabulary",
      instructions: "Enter your words (one per line)",
      placeholder: "Enter your words here...\nExample:\nkissa\nkoira\ntalo",
      no_words: "Please enter at least one word",
      error: "Error processing word list. Please check your input and try again."
    }
  },
  training: {
    modes: {
      title: "Training Modes",
      description: "Select your preferred training mode",
    },
    modeUnavailable: {
      message: "This mode is not available in English yet.",
      backToMenu: "Back to menu"
    },
    instrumentals: {
      title: "Select Instrumental",
      description: "Choose an instrumental for your freestyle",
      changeInstrumental: "Change Instrumental",
      instrumentalLabel: "Instrumental",
      bpmSuffix: "BPM",
      currentInstrumental: "Current Instrumental",
      noInstrumental: "No instrumental selected",
      select: "Select",
      current: "Current"
    }
  },
  settings: {
    language: "Language",
    english: "English",
    finnish: "Finnish",
  },
  feedback: {
    button: "Feedback",
    close: "Close",
    manual: {
      title: "Help make Rheemy better! 🎤",
      description: "Hey! I'm Juuso, the creator of Rheemy. I'd love to hear what you think!",
      question: "What would you like to tell me?",
      placeholder: "A bug, an idea, or just how it feels to use…",
      submit: "Send feedback",
      submitting: "Sending…"
    },
    survey: {
      title: "Quick question! 🎤",
      question: "What do you mainly use Rheemy for?",
      // Keep these in sync with USAGE_CATEGORIES in appConfig.js.
      options: {
        freestyle: "Practicing freestyle rap",
        rhyming: "Improving my rhyming skills",
        lyrics: "Writing lyrics",
        fun: "Just having fun",
        other: "Something else"
      },
      improveQuestion: "Anything you'd like us to improve?",
      improvePlaceholder: "Optional — a sentence is plenty",
      submit: "Send",
      submitting: "Sending…"
    },
    thanks: {
      title: "Thank you! 🎤",
      message: "Got it. This really helps me make Rheemy better."
    },
    video: {
      action: "🎥 Tell me more in a short video interview",
      explanation: "It takes a few minutes and helps us understand how people use Rheemy."
    },
    errors: {
      empty: "Write a few words first — even a short note helps.",
      category: "Pick the option that fits you best.",
      generic: "That didn't send. Your text is still here, so you can try again in a moment."
    }
  }
}; 