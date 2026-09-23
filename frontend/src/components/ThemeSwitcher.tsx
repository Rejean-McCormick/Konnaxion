'use client';

// FILE: frontend/src/components/ThemeSwitcher.tsx
import { Button } from 'antd';
import React from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { t } = useLanguage();
  const { token, cycleTheme } = useTheme();   // token contient label + icon

  return (
    <Button onClick={cycleTheme} aria-label={t('theme.change')}>
      {token.icon ? t("ui.src.themeswitcher.text", { icon: token.icon }) : ''}
      {token.label ?? t('theme.fallbackLabel')}
    </Button>
  );
};

export default ThemeSwitcher;
