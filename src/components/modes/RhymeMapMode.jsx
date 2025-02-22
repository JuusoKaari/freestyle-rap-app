/**
 * RhymeMapMode Component
 * ==========================
 * 
 * A wrapper component that renders the appropriate language-specific
 * RhymeMapMode component based on the current language setting.
 */

import React from 'react';
import { useTranslation } from '../../services/TranslationContext';
import RhymeMapMode_FI from './RhymeMapMode_FI';
import RhymeMapMode_EN from './RhymeMapMode_EN';

const RhymeMapMode = (props) => {
  const { language } = useTranslation();

  // Render the appropriate language version
  if (language === 'fi') {
    return <RhymeMapMode_FI {...props} />;
  }

  // Default to English version
  return <RhymeMapMode_EN {...props} />;
};

export default RhymeMapMode; 