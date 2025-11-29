// FILE: frontend/src/components/ThemeSwitcher.tsx
import React from 'react';
import { Button } from 'antd';
import { useTheme } from '@/context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { token, cycleTheme } = useTheme();   // token contient label + icon

  return (
    <Button onClick={cycleTheme}>
      {token.icon ? `${token.icon} ` : ''}{token.label ?? 'Theme'}
    </Button>
  );
};

export default ThemeSwitcher;
