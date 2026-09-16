// FILE: frontend/src/theme/theme08.ts
import type { Theme } from "./types";
import { BRAND_HEX, darkStatusColors } from "./types";

/** Warm plum dark theme: softer than graphite, calmer than a high-saturation purple UI. */
const mauveAuroraTheme: Theme = {
  id: "mauveAurora",
  name: "Plum Nocturne",
  label: "Plum Nocturne",
  icon: "🌒",
  isDark: true,
  colors: {
    brand: BRAND_HEX,

    background: "#171019",
    backgroundAlt: "#211522",
    surface: "#261a28",
    surfaceAlt: "#312135",

    border: "#4a354d",
    borderStrong: "#876889",

    text: "#f7eff6",
    textMuted: "#c7b2c4",
    textOnBrand: "#ffffff",

    primary: "#815072",
    primaryHover: "#925e82",
    primaryActive: "#6d405e",
    primarySoft: "#a36f94",
    primarySubtle: "#3b2638",

    accent1: "#c28cad",
    accent2: "#68a39d",
    accent3: "#c6925a",
    accent4: "#8192c4",
    accent5: "#8da071",

    menuSelectedBg: "#724663",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(194, 140, 173, 0.38)",

    ...darkStatusColors,
  },
};

export default mauveAuroraTheme;
