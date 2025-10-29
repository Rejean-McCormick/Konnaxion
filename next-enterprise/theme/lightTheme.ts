import { theme } from 'antd';
const { defaultAlgorithm } = theme;

export default {
  label           : 'Light',
  icon            : '☀️',

  algorithm       : defaultAlgorithm,
  colorPrimary    : '#3b82f6',
  colorBgLayout   : '#ffffff',
  colorBgContainer: '#ffffff',
  colorTextBase   : '#141414',

  bgMain   : '#ffffff',
  bgLight  : '#f5f5f5',
  bgDark   : '#e5e5e5',
  textMain : '#141414',
  accent   : '#3b82f6',
} as const;
