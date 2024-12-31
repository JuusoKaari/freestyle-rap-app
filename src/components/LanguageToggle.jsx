import React from 'react';
import { useTranslation } from '../services/TranslationContext';
import '../styles/LanguageToggle.css';

const LanguageToggle = () => {
  const { language, changeLanguage } = useTranslation();

  return (
    <div className="language-toggle">
      <button 
        className={`language-button ${language === 'fi' ? 'active' : ''}`}
        onClick={() => changeLanguage('fi')}
      >
        FI
      </button>
      <button 
        className={`language-button ${language === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle; 