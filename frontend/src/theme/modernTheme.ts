import { theme } from 'antd';
const { defaultAlgorithm } = theme;

export default {
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

  // Custom tokens
  bgMain  : '#F9FAFB',
  bgLight : '#FFFFFF',
  bgDark  : '#E2E8F0',
  textMain: '#0F172A',
  accent  : '#475569',
} as const;
