// FILE: frontend/src/theme/theme07.ts
import type { Theme } from "./types";
import { BRAND_HEX, lightStatusColors } from "./types";

/** Calm botanical light theme for long sessions and low visual fatigue. */
const candyCarnivalTheme: Theme = {
  id: "candyCarnival",
  name: "Sage Paper",
  label: "Sage Paper",
  icon: "🌿",
  isDark: false,
  colors: {
    brand: BRAND_HEX,

    background: "#f6f8f3",
    backgroundAlt: "#ebf0e6",
    surface: "#ffffff",
    surfaceAlt: "#f0f4ec",

    border: "#d1dccb",
    borderStrong: "#85977b",

    text: "#1f2a1d",
    textMuted: "#5d6c59",
    textOnBrand: "#ffffff",

    primary: "#4f6f45",
    primaryHover: "#5c7c50",
    primaryActive: "#405d38",
    primarySoft: "#748f69",
    primarySubtle: "#e1eadf",

    accent1: BRAND_HEX,
    accent2: "#8c6a49",
    accent3: "#64708f",
    accent4: "#8c5f73",
    accent5: "#a07b3d",

    menuSelectedBg: "#46643e",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(79, 111, 69, 0.28)",

    ...lightStatusColors,
  },
};

export default candyCarnivalTheme;
