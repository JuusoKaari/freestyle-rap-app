/**
 * Translation Context Service
 * =========================
 * 
 * React Context provider for handling multilingual support throughout the application.
 * Manages language switching and text translations for UI elements.
 * 
 * Features:
 * - Language state management (FI/EN)
 * - Translation key resolution
 * - Dynamic language switching
 * - Fallback handling for missing translations
 * 
 * Usage:
 * - Wrap application with TranslationProvider
 * - Use useTranslation hook to access translations
 * - Access current language and translation function
 * 
 * The service ensures consistent language handling across all components
 * and provides a centralized translation management system.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { en } from '../data/translations/en';
import { fi } from '../data/translations/fi';

const translations = {
  en,
  fi,
};

const TranslationContext = createContext();

export const TranslationProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage || 'fi';
  });

  const setLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      localStorage.setItem('language', newLang);
    }
  };

  const translate = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }
    
    return value;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ translate, language, changeLanguage: setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 