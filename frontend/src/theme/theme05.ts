// FILE: frontend/src/theme/theme05.ts
import type { Theme } from "./types";
import { BRAND_HEX, lightStatusColors } from "./types";

/** Warm, paper-like light theme with copper actions and restrained earth tones. */
const sunburstTheme: Theme = {
  id: "sunburst",
  name: "Copper Sand",
  label: "Copper Sand",
  icon: "🏺",
  isDark: false,
  colors: {
    brand: BRAND_HEX,

    background: "#fbf7f2",
    backgroundAlt: "#f1e9de",
    surface: "#fffefc",
    surfaceAlt: "#f6efe7",

    border: "#ddcfc0",
    borderStrong: "#9d8b78",

    text: "#2a211a",
    textMuted: "#706257",
    textOnBrand: "#ffffff",

    primary: "#9a4e2f",
    primaryHover: "#ab5a39",
    primaryActive: "#843f26",
    primarySoft: "#bd7454",
    primarySubtle: "#f3ded2",

    accent1: BRAND_HEX,
    accent2: "#b27b39",
    accent3: "#6b6f8e",
    accent4: "#78805b",
    accent5: "#8f6574",

    menuSelectedBg: "#884126",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(154, 78, 47, 0.28)",

    ...lightStatusColors,
  },
};

export default sunburstTheme;
