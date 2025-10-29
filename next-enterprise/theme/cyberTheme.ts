import { theme } from 'antd';
const { darkAlgorithm } = theme;

export default {
  label           : 'Cyber',
  icon            : '🕶️',

  algorithm       : darkAlgorithm,
  colorPrimary    : '#39ff14',
  colorBgLayout   : '#000c1a',
  colorBgContainer: '#000c1a',
  colorTextBase   : '#aefaff',

  bgMain   : '#000c1a',
  bgLight  : '#001627',
  bgDark   : '#00e0ff1a',
  textMain : '#aefaff',
  accent   : '#39ff14',
} as const;
