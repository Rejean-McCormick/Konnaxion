// FILE: frontend/src/theme/theme01.ts
import type { Theme } from "./types";
import { BRAND_HEX, lightStatusColors } from "./types";

/**
 * Default Konnaxion theme.
 * Quiet, brand-led and intentionally neutral so dense product screens stay readable.
 */
const sandstoneTheme: Theme = {
  id: "sandstone",
  name: "Konnaxion Light",
  label: "Konnaxion Light",
  icon: "☀️",
  isDark: false,
  colors: {
    brand: BRAND_HEX,

    background: "#f4f8f7",
    backgroundAlt: "#e7f1f0",
    surface: "#ffffff",
    surfaceAlt: "#edf5f4",

    border: "#c9dad8",
    borderStrong: "#789895",

    text: "#152524",
    textMuted: "#526b68",
    textOnBrand: "#ffffff",

    primary: BRAND_HEX,
    primaryHover: "#277671",
    primaryActive: "#185955",
    primarySoft: "#3a817c",
    primarySubtle: "#dcebe9",

    accent1: "#2f7b76",
    accent2: "#365f7c",
    accent3: "#a36a3f",
    accent4: "#756a9d",
    accent5: "#6f8064",

    menuSelectedBg: BRAND_HEX,
    menuSelectedText: "#ffffff",

    brandAccent: "#2f7b76",
    focusRing: "rgba(30, 104, 100, 0.28)",

    ...lightStatusColors,
  },
};

export default sandstoneTheme;
