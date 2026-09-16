// FILE: frontend/src/theme/theme02.ts
import type { Theme } from "./types";
import { BRAND_HEX, darkStatusColors } from "./types";

/** Brand-led dark companion to Konnaxion Light. */
const blueCanvasTheme: Theme = {
  id: "blueCanvas",
  name: "Konnaxion Dark",
  label: "Konnaxion Dark",
  icon: "🌙",
  isDark: true,
  colors: {
    brand: BRAND_HEX,

    background: "#0b1413",
    backgroundAlt: "#101d1b",
    surface: "#121f1e",
    surfaceAlt: "#182826",

    border: "#2c423f",
    borderStrong: "#52716c",

    text: "#eaf4f3",
    textMuted: "#a9bcb9",
    textOnBrand: "#ffffff",

    primary: BRAND_HEX,
    primaryHover: "#2a7772",
    primaryActive: "#175753",
    primarySoft: "#3f918a",
    primarySubtle: "#173b38",

    accent1: "#58aaa3",
    accent2: "#7fa6c9",
    accent3: "#d39a61",
    accent4: "#b49acc",
    accent5: "#88a777",

    menuSelectedBg: BRAND_HEX,
    menuSelectedText: "#ffffff",

    brandAccent: "#58aaa3",
    focusRing: "rgba(88, 170, 163, 0.38)",

    ...darkStatusColors,
  },
};

export default blueCanvasTheme;
