/**
 * ModeUnavailable Component
 * =========================
 * Shown when a training mode is not available for the current language.
 */

import React from 'react';
import { useTranslation } from '../services/TranslationContext';

const ModeUnavailable = ({ onReturnToMenu }) => {
  const { translate } = useTranslation();

  return (
    <div className="mode-unavailable">
      <p>{translate('training.modeUnavailable.message')}</p>
      <button className="menu-button" onClick={onReturnToMenu}>
        {translate('training.modeUnavailable.backToMenu')}
      </button>
    </div>
  );
};

export default ModeUnavailable;
