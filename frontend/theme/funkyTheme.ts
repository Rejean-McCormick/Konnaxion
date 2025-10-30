import { theme as antdTheme } from 'antd'
const { darkAlgorithm } = antdTheme

export default {
  label         : 'Funky Disco',
  icon          : '🪩',

  // Base algorithm (dark)
  algorithm     : darkAlgorithm,

  // Seed tokens
  colorPrimary           : '#FF69B4',   // Hot Pink
  colorLink              : '#00FFFF',   // Cyan
  colorLinkHover         : '#7FFFD4',   // Aquamarine

  // Texte (pour --ant-color-text et --ant-color-text-base)
  colorText              : '#FFFFFF',
  colorTextBase          : '#FFFFFF',
  colorTextSecondary     : '#FFD700',
  colorTextTertiary      : '#E0E0E0',
  colorTextPlaceholder   : '#BBBBBB',
  colorTextDisabled      : '#777777',

  // Arrondis / typo
  borderRadius           : 8,
  fontFamily             : '"Comic Sans MS", cursive, sans-serif',

  // Fonds généraux
  colorBgLayout          : '#1E1E2F',
  colorBgContainer       : '#2E1A47',
  colorBgElevated        : '#41295A',
  colorBgMask            : 'rgba(0,0,0,0.6)',
  colorBgSpotlight       : '#FFD700',
  colorBgSolid           : '#FF4500',
  colorBgSolidHover      : '#FF6347',

  // Menu / Sidebar (raw keys custom)
  menuBg                 : '#2E1A47',
  menuItemHoverBg        : '#584F8E',
  menuItemSelectedBg     : '#7D5BA6',
  menuItemTextColor      : '#FFFFFF',

  // Dropdown / Popconfirm
  dropdownBg             : '#383838',
  dropdownItemHoverBg    : '#4A4A4A',
  colorBgPopconfirm      : '#383838',

  // Bordures / séparateurs
  colorBorder            : '#FF69B4',
  colorSplit             : '#884EA0',

  // Ombres
  boxShadow              : '0 4px 12px rgba(255,255,255,0.1)',
  boxShadowSecondary     : '0 2px 8px rgba(0,0,0,0.2)',

  // Espacements & typo
  fontSize               : 14,
  fontSizeLG             : 18,
  paddingContentHorizontalLG: 24,
  paddingContentVerticalLG  : 24,

  // Variables perso (si vous les exposez sur <html>)
  bgMain   : '#1E1E2F',
  bgLight  : '#2E1A47',
  bgDark   : '#0F0B20',
  textMain : '#FFFFFF',
  accent   : '#00FF00',
} as const
