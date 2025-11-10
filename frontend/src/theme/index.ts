// src/theme/index.ts
import light        from './lightTheme';
import dark         from './darkTheme';
import funky        from './funkyTheme';
import cyber        from './cyberTheme';
import kktheme      from './kktheme';
import sunsetTheme  from './sunsetTheme';
import oceanTheme   from './oceanTheme';
import minimalTheme from './minimalTheme';
import modernTheme  from './modernTheme';

export const themes = {
  light,
  dark,
  funky,
  cyber,
  kktheme,
  sunsetTheme,
  oceanTheme,
  minimalTheme,
  modernTheme,
} as const;

export type ThemeType = keyof typeof themes;
export const themeKeys = Object.keys(themes) as ThemeType[];
export default themes;
