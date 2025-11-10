import { theme as antdTheme } from 'antd';
const { darkAlgorithm } = antdTheme;

export default {
  label : 'Cyber',
  icon  : '🕶️',

  // Base algorithm (dark)
  algorithm: darkAlgorithm,

  // Couleurs principales
  colorPrimary          : '#39FF14',
  colorLink             : '#00FFB3',
  colorLinkHover        : '#39FF14',
  colorSuccess          : '#00FF9C',
  colorWarning          : '#FFD700',
  colorError            : '#FF3B3B',

  // Texte global
  colorText             : '#AEFAFF',
  colorTextBase         : '#AEFAFF',
  colorTextSecondary    : '#6EF7B8',
  colorTextTertiary     : '#3DDAD7',

  // Fonds / Layout
  colorBgLayout         : '#000C1A',
  colorBgContainer      : '#001627',
  colorBgElevated       : '#002033',
  layoutColorBgSider    : '#000C1A',
  colorBgMask           : 'rgba(0,255,150,0.1)',

  // Menu / Sidebar
  colorMenuItemText         : '#AEFAFF',
  colorMenuItemHoverBg      : '#003B2E',
  colorMenuItemSelectedBg   : '#004C3A',
  colorMenuItemSelectedText : '#39FF14',

  // Bordures / séparateurs
  colorBorder           : '#003B2E',
  colorSplit            : '#004C3A',

  // Ombres
  boxShadow             : '0 4px 12px rgba(57,255,20,0.15)',
  boxShadowSecondary    : '0 2px 8px rgba(0,255,150,0.2)',

  // Tokens personnalisés
  bgMain                : '#000C1A',
  bgLight               : '#001627',
  bgDark                : '#00E0FF1A',
  textMain              : '#AEFAFF',
  accent                : '#39FF14',
  accentSoft            : '#00FF99',
  accentGlow            : '0 0 8px rgba(57,255,20,0.5)',
} as const;
