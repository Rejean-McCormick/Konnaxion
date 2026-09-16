// FILE: frontend/src/theme/types.ts
export type ThemeId =
  | "sandstone"
  | "blueCanvas"
  | "midnightHarbor"
  | "deepCurrent"
  | "sunburst"
  | "neonCircuit"
  | "candyCarnival"
  | "mauveAurora";

export interface ThemeColors {
  // Brand + primary action system
  brand: string;
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySoft: string;
  primarySubtle: string;

  // Surfaces
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;

  // Borders
  border: string;
  borderStrong: string;

  // Text
  text: string;
  textMuted: string;
  textOnBrand: string;

  // Decorative / data-viz accents. Keep these distinct from semantic status colors.
  accent1?: string;
  accent2?: string;
  accent3?: string;
  accent4?: string;
  accent5?: string;

  // Sidebar/menu selection helpers
  menuSelectedBg?: string;
  menuSelectedText?: string;

  // Optional extras
  brandAccent?: string;
  focusRing?: string;

  // Semantic status colors
  success: string;
  warning: string;
  danger: string;
  info: string;
}

export interface Theme {
  id: ThemeId;
  name: string;   // internal / free use
  label: string;  // what you show in ThemeSwitcher
  icon: string;   // emoji/icon for ThemeSwitcher
  isDark: boolean;
  colors: ThemeColors;
}

export const BRAND_HEX = "#1e6864";

/**
 * Status colors are intentionally different in light and dark themes.
 * Light variants are dark enough to remain legible on white surfaces;
 * dark variants are lifted enough to remain legible on near-black surfaces.
 */
export const lightStatusColors: Pick<
  ThemeColors,
  "success" | "warning" | "danger" | "info"
> = {
  success: "#2d754f",
  warning: "#9a5b00",
  danger: "#b43b46",
  info: "#2f668f",
};

export const darkStatusColors: Pick<
  ThemeColors,
  "success" | "warning" | "danger" | "info"
> = {
  success: "#62c08d",
  warning: "#e6b35f",
  danger: "#e47c85",
  info: "#71add4",
};

// Backward-compatible export for any code that still imports the old name.
export const sharedStatusColors = lightStatusColors;
