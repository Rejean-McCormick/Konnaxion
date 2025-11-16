// src/theme/modernTheme.ts
import { theme } from 'antd';
const { defaultAlgorithm } = theme;

export default {
  label : 'Mauve + Rainbow',
  icon  : '💜🌈',

  algorithm       : defaultAlgorithm,

  // Couleurs principales
  colorPrimary    : '#8B5CF6',       // mauve
  colorPrimaryBg  : '#8B5CF61a',
  colorBgLayout   : '#F6F5F9',       // léger fond mauve/gris
  colorBgContainer: '#FFFFFF',
  colorTextBase   : '#1A1430',       // neutre foncé tirant sur le mauve

  // Tokens personnalisés (comme minimal/kktheme)
  bgMain   : '#F6F5F9',
  bgLight  : '#FFFFFF',
  bgDark   : '#6D28D9',
  textMain : '#1A1430',
  accent   : '#FBBF24',              // accent “arc-en-ciel” chaud (doré)
} as const;
