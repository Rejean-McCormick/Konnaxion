import { theme as antdTheme } from 'antd'
const { darkAlgorithm } = antdTheme

export default {
  label         : 'Bleu & Jaune',
  icon          : '💙💛',

  algorithm     : darkAlgorithm,

  // Couleurs principales
  colorPrimary           : '#1E90FF',   // Bleu vif
  colorLink              : '#FFD700',   // Jaune or
  colorLinkHover         : '#FFE55C',

  // Texte
  colorTextBase          : '#FFFFFF',
  colorText              : '#FFFFFF',
  colorTextSecondary     : '#D0E4FF',
  colorTextTertiary      : '#A9C8FF',

  // Fond global
  colorBgBase            : '#0A1A2A',
  colorBgContainer       : '#112B44',
  colorBgElevated        : '#163454',

  // Boutons
  colorPrimaryActive     : '#0F75E0',
  colorPrimaryHover      : '#5AAEFF',
  colorError             : '#FFCC00',

  // Inputs / Champs
  colorFillSecondary     : '#1A3C5F',
  colorBorderInput       : '#4D8AD6',

  // Sidebar / Menu
  colorMenuItemText      : '#FFFFFF',
  colorMenuItemHoverBg   : '#1E3A5F',
  colorMenuItemSelectedBg: '#255080',
  colorMenuItemSelectedText: '#FFD700',

  // Bordures
  colorBorder            : '#1E90FF',
  colorSplit             : '#15406A',

  // Ombres
  boxShadow              : '0 4px 12px rgba(0,0,0,0.25)',
  boxShadowSecondary     : '0 2px 8px rgba(0,0,0,0.2)',
} as const
