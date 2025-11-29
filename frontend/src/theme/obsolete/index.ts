// FILE: frontend/src/theme/obsolete/index.ts
import type { Theme, ThemeId } from './types';

import lightTheme from './lightTheme';
import modernTheme from './modernTheme';
import darkTheme from './darkTheme';
import oceanTheme from './oceanTheme';
import sunsetTheme from './sunsetTheme';
import cyberTheme from './cyberTheme';
import funkyTheme from './funkyTheme';
import mauveRainbowTheme from './mauveRainbowTheme';

export const allThemes: Theme[] = [
  lightTheme,
  modernTheme,
  darkTheme,
  oceanTheme,
  sunsetTheme,
  cyberTheme,
  funkyTheme,
  mauveRainbowTheme,
];

export const defaultTheme = lightTheme;

export const themeById: Record<ThemeId, Theme> = allThemes.reduce(
  (map, theme) => {
    map[theme.id] = theme;
    return map;
  },
  {} as Record<ThemeId, Theme>,
);

export {
  lightTheme,
  modernTheme,
  darkTheme,
  oceanTheme,
  sunsetTheme,
  cyberTheme,
  funkyTheme,
  mauveRainbowTheme,
};
