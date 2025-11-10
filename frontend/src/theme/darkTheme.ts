import { theme as antdTheme } from 'antd';
const { darkAlgorithm } = antdTheme;

export default {
  label : 'Dark',
  icon  : '🌌',

  // Base algorithm (dark)
  algorithm: darkAlgorithm,

  // Couleurs principales
  colorPrimary          : '#00C4FF',
  colorLink             : '#1E90FF',
  colorLinkHover        : '#63C5DA',
  colorSuccess          : '#00B894',
  colorWarning          : '#FFA500',
  colorError            : '#FF4D4F',

  // Texte global
  colorText             : '#FFFFFF',
  colorTextBase         : '#F0F0F0',
  colorTextSecondary    : '#A0A0A0',
  colorTextTertiary     : '#7A7A7A',

  // Fonds / Layout
  colorBgLayout         : '#121214',
  colorBgContainer      : '#1A1A1E',
  colorBgElevated       : '#24242A',
  layoutColorBgSider    : '#16161A',
  colorBgMask           : 'rgba(0,0,0,0.6)',

  // Menu / Sidebar
  colorMenuItemText         : '#FFFFFF',
  colorMenuItemHoverBg      : '#002B36',
  colorMenuItemSelectedBg   : '#003B4C',
  colorMenuItemSelectedText : '#00C4FF',

  // Bordures / séparateurs
  colorBorder           : '#2C2C34',
  colorSplit            : '#303036',

  // Ombres
  boxShadow             : '0 4px 12px rgba(0,0,0,0.4)',
  boxShadowSecondary    : '0 2px 8px rgba(0,0,0,0.25)',

  // Tokens personnalisés
  bgMain                : '#18181C',
  bgLight               : '#24242A',
  bgDark                : '#0D0D10',
  textMain              : '#FFFFFF',
  accent                : '#00C4FF',
  accentSoft            : '#007A99',
  accentGlow            : '0 0 8px rgba(0,196,255,0.5)',
} as const;
