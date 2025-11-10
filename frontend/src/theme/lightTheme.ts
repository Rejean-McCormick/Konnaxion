import { theme as antdTheme } from 'antd';
const { defaultAlgorithm } = antdTheme;

export default {
  label : 'Light',
  icon  : '☀️',

  // Base algorithm (light)
  algorithm: defaultAlgorithm,

  // Couleurs principales
  colorPrimary          : '#D4AF37', // or élégant
  colorLink             : '#D4AF37',
  colorLinkHover        : '#E6BE4A',
  colorSuccess          : '#5DBB63',
  colorWarning          : '#E1B12C',
  colorError            : '#D45D5D',

  // Texte global
  colorText             : '#1A1A1A',
  colorTextBase         : '#141414',
  colorTextSecondary    : '#5C5C5C',
  colorTextTertiary     : '#8C8C8C',

  // Fonds / Layout
  colorBgLayout         : '#FFFFFF',
  colorBgContainer      : '#FAFAFA',
  colorBgElevated       : '#F5F5F5',
  layoutColorBgSider    : '#FFFFFF',
  colorBgMask           : 'rgba(212,175,55,0.1)',

  // Menu / Sidebar
  colorMenuItemText         : '#1A1A1A',
  colorMenuItemHoverBg      : '#FFF5DA',
  colorMenuItemSelectedBg   : '#FFF2C2',
  colorMenuItemSelectedText : '#D4AF37',

  // Bordures / séparateurs
  colorBorder           : '#E5E5E5',
  colorSplit            : '#E0E0E0',

  // Ombres
  boxShadow             : '0 4px 12px rgba(0,0,0,0.05)',
  boxShadowSecondary    : '0 2px 8px rgba(0,0,0,0.04)',

  // Tokens personnalisés
  bgMain                : '#FFFFFF',
  bgLight               : '#F5F5F5',
  bgDark                : '#E5E5E5',
  textMain              : '#141414',
  accent                : '#D4AF37',
  accentComplementary   : '#2A9DF4', // bleu royal complémentaire du doré
  accentSoft            : '#E6BE4A',
  accentGlow            : '0 0 8px rgba(212,175,55,0.4)',
} as const;
