import { theme } from 'antd';
const { darkAlgorithm } = theme;

export default {
  label           : 'Dark',
  icon            : '🌙',

  algorithm       : darkAlgorithm,
  colorPrimary    : '#00c4ff',
  colorBgLayout   : '#18181c',
  colorBgContainer: '#18181c',
  colorTextBase   : '#f0f0f0',

  bgMain   : '#18181c',
  bgLight  : '#24242a',
  bgDark   : '#0d0d10',
  textMain : '#f0f0f0',
  accent   : '#00c4ff',
} as const;
