import { theme as antdTheme } from 'antd'
const { darkAlgorithm } = antdTheme

export default {
  label         : 'Sunset',
  icon          : '🌅',

  // Base algorithm (dark)
  algorithm     : darkAlgorithm,

  // Seed tokens
  colorPrimary           : '#FF4500',
  colorLink              : '#FF8C00',
  colorLinkHover         : '#FFA500',

  // Texte global
  colorText              : '#FFFFFF',
  colorTextBase          : '#FFFFFF',
  colorTextSecondary     : '#FFD700',

  // Fonds
  colorBgLayout          : '#2E1E1E',
  colorBgContainer       : '#3C1E1E',
  colorBgElevated        : '#4A2A2A',

  // **Ajout décisif** pour le sider
  layoutColorBgSider     : '#2E1E1E',

  // Sidebar / Menu
  colorMenuItemText      : '#FFFFFF',
  colorMenuItemHoverBg   : '#662222',
  colorMenuItemSelectedBg: '#880000',
  colorMenuItemSelectedText: '#FFFFFF',

  // Bordures / séparateurs
  colorBorder            : '#FF4500',
  colorSplit             : '#884A2E',

  // Ombres
  boxShadow              : '0 4px 12px rgba(255,255,255,0.1)',
  boxShadowSecondary     : '0 2px 8px rgba(0,0,0,0.2)',
} as const
