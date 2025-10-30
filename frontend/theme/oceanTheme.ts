import { theme as antdTheme } from 'antd'
const { darkAlgorithm } = antdTheme

export default {
  label         : 'Ocean',
  icon          : '🌊',

  // Base algorithm (dark)
  algorithm     : darkAlgorithm,

  // Seed tokens
  colorPrimary           : '#1E90FF',
  colorLink              : '#00BFFF',
  colorLinkHover         : '#87CEFA',

  // Texte global
  colorText              : '#FFFFFF',
  colorTextBase          : '#FFFFFF',
  colorTextSecondary     : '#ADD8E6',

  // Fonds
  colorBgLayout          : '#001F3F',
  colorBgContainer       : '#002B5C',
  colorBgElevated        : '#003366',
  

  // **Ajout décisif** pour le sider
  layoutColorBgSider     : '#001F3F',

  // Sidebar / Menu
  colorMenuItemText      : '#FFFFFF',
  colorMenuItemHoverBg   : '#004080',
  colorMenuItemSelectedBg: '#00509E',
  colorMenuItemSelectedText: '#FFFFFF',

  // Bordures / séparateurs
  colorBorder            : '#1E90FF',
  colorSplit             : '#004080',

  // Ombres
  boxShadow              : '0 4px 12px rgba(255,255,255,0.1)',
  boxShadowSecondary     : '0 2px 8px rgba(0,0,0,0.2)',
  
  // entete tableaux
  tableHeaderBg : '#24242A',
} as const
