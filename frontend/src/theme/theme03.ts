// FILE: frontend/src/theme/theme03.ts
import type { Theme } from "./types";
import { BRAND_HEX, lightStatusColors } from "./types";

/** Cool editorial light theme for analytical and information-dense screens. */
const midnightHarborTheme: Theme = {
  id: "midnightHarbor",
  name: "Northstar",
  label: "Northstar",
  icon: "🧭",
  isDark: false,
  colors: {
    brand: BRAND_HEX,

    background: "#f5f7fa",
    backgroundAlt: "#e9eef4",
    surface: "#ffffff",
    surfaceAlt: "#f0f3f7",

    border: "#d1d9e3",
    borderStrong: "#8492a1",

    text: "#18212b",
    textMuted: "#586878",
    textOnBrand: "#ffffff",

    primary: "#315e8d",
    primaryHover: "#3b6b9d",
    primaryActive: "#274f78",
    primarySoft: "#6686a8",
    primarySubtle: "#dfeaf5",

    accent1: BRAND_HEX,
    accent2: "#6c5e93",
    accent3: "#a0643c",
    accent4: "#687a54",
    accent5: "#9a667b",

    menuSelectedBg: "#2b567f",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(49, 94, 141, 0.28)",

    ...lightStatusColors,
  },
};

export default midnightHarborTheme;
