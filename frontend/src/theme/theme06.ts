// FILE: frontend/src/theme/theme06.ts
import type { Theme } from "./types";
import { BRAND_HEX, darkStatusColors } from "./types";

/** Sophisticated violet dark theme; expressive without neon glare. */
const neonCircuitTheme: Theme = {
  id: "neonCircuit",
  name: "Violet Night",
  label: "Violet Night",
  icon: "🌌",
  isDark: true,
  colors: {
    brand: BRAND_HEX,

    background: "#100e18",
    backgroundAlt: "#171321",
    surface: "#1b1727",
    surfaceAlt: "#241e32",

    border: "#3a304b",
    borderStrong: "#756486",

    text: "#f3eff8",
    textMuted: "#b8aec4",
    textOnBrand: "#ffffff",

    primary: "#6a4fa3",
    primaryHover: "#765bb0",
    primaryActive: "#58418a",
    primarySoft: "#8b6dc2",
    primarySubtle: "#2d2343",

    accent1: "#a78bca",
    accent2: "#579f98",
    accent3: "#d19a67",
    accent4: "#7d9fd0",
    accent5: "#8ba66f",

    menuSelectedBg: "#5d438f",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(167, 139, 202, 0.38)",

    ...darkStatusColors,
  },
};

export default neonCircuitTheme;
