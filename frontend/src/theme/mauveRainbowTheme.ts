const mauveRainbowTheme = {
  id: 'mauve-rainbow',
  name: 'Mauve + Rainbow',
  appearance: 'light',

  colors: {
    // Brand (Mauve)
    primary: '#8B5CF6',        // vibrant mauve (violet-500)
    primarySoft: '#EDE9FE',    // very soft mauve background
    primaryStrong: '#6D28D9',  // deeper mauve
    primaryGhost: 'rgba(139, 92, 246, 0.08)',
    onPrimary: '#FFFFFF',

    // Accent (Rainbow multi-purpose)
    // Choose a warm highlight from the rainbow set (gold/yellow)
    accent: '#FBBF24',          // yellow/gold (amber-400)
    accentSoft: '#FEF3C7',
    accentStrong: '#D97706',
    accentGhost: 'rgba(251, 191, 36, 0.12)',
    onAccent: '#0B1120',

    // Neutrals / surfaces
    background: '#F6F5F9',      // subtle mauve-tinted gray
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#ECEAF3',      // mauve-neutral
    surfaceMuted: '#F3F1F8',

    borderSubtle: '#E7E3EF',
    border: '#D5D0E0',
    borderStrong: '#A69EB8',

    overlay: 'rgba(30, 27, 75, 0.45)',

    // Text
    text: '#1A1430',            // dark mauve-neutral
    textMuted: '#6B647D',
    textSubtle: '#9D94B4',
    textOnColor: '#FFFFFF',
    textOnSoft: '#1A1430',

    // Status (full rainbow)
    success: '#10B981',        // green
    successSoft: '#D1FAE5',
    successStrong: '#059669',

    warning: '#FACC15',        // yellow
    warningSoft: '#FEF9C3',
    warningStrong: '#CA8A04',

    danger: '#EF4444',         // red
    dangerSoft: '#FEE2E2',
    dangerStrong: '#B91C1C',

    info: '#0EA5E9',           // blue
    infoSoft: '#E0F2FE',
    infoStrong: '#0284C7',
  },

  typography: {
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif",
    fontFamilyMono:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",

    baseSize: 14,
    lineHeight: 1.5,

    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600,
    weightBold: 700,

    h1: { size: 32, lineHeight: 1.25, weight: 700, letterSpacing: -0.02 },
    h2: { size: 24, lineHeight: 1.3, weight: 600, letterSpacing: -0.01 },
    h3: { size: 20, lineHeight: 1.35, weight: 600, letterSpacing: -0.005 },
    label: { size: 12, lineHeight: 1.4, weight: 500, letterSpacing: 0.04 },
  },

  radius: {
    xs: 4,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 999, // pill
  },

  shadows: {
    xs: '0 1px 2px rgba(30, 27, 75, 0.06)',
    sm: '0 1px 3px rgba(30, 27, 75, 0.08), 0 1px 2px rgba(30, 27, 75, 0.04)',
    md: '0 10px 30px rgba(30, 27, 75, 0.08)',
    lg: '0 18px 45px rgba(30, 27, 75, 0.12)',
    focus:
      '0 0 0 1px rgba(30, 27, 75, 0.10), 0 0 0 4px rgba(139, 92, 246, 0.35)',
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },

  components: {
    button: {
      heightSm: 28,
      heightMd: 32,
      heightLg: 40,
      paddingXSm: 10,
      paddingXMd: 14,
      paddingXLg: 18,
      radius: 999,
    },
    input: {
      height: 36,
      radius: 10,
      borderWidth: 1,
    },
    card: {
      radius: 14,
      padding: 16,
      shadow: 'md',
    },
  },
};

export default mauveRainbowTheme;
