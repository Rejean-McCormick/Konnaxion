import type { ThemeObject } from './types';
import { theme }             from 'antd';
const { defaultAlgorithm } = theme;

const modernTheme: ThemeObject = {
  label       : 'Modern',
  icon        : '🖌️',

  algorithm   : defaultAlgorithm,
  colorPrimary: '#475569',
  colorInfo   : '#2563eb',
  colorSuccess: '#22c55e',
  colorWarning: '#facc15',
  colorError  : '#ef4444',

  colorBgLayout   : '#f9fafb',
  colorBgContainer: '#ffffff',
  colorTextBase   : '#0f172a',

  borderRadiusLG : 16,
  controlHeight  : 40,

  /* raw Tailwind vars (R G B) */
  bgMain    : '249 250 251',
  bgLight   : '255 255 255',
  bgDark    : '226 232 240',
  textMain  : '15 23 42',
  accent    : '71 85 105',
};

export default modernTheme;
