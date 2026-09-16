// FILE: frontend/src/theme/theme04.ts
import type { Theme } from "./types";
import { BRAND_HEX, darkStatusColors } from "./types";

/** Deep blue-black theme with restrained cyan highlights. */
const deepCurrentTheme: Theme = {
  id: "deepCurrent",
  name: "Deep Ocean",
  label: "Deep Ocean",
  icon: "🌊",
  isDark: true,
  colors: {
    brand: BRAND_HEX,

    background: "#07141d",
    backgroundAlt: "#0a1a25",
    surface: "#0d202c",
    surfaceAlt: "#122a38",

    border: "#244151",
    borderStrong: "#4a7082",

    text: "#ecf5f8",
    textMuted: "#a4b8c2",
    textOnBrand: "#ffffff",

    primary: "#1f6f8b",
    primaryHover: "#2a7b97",
    primaryActive: "#195e76",
    primarySoft: "#4a91a7",
    primarySubtle: "#173846",

    accent1: "#4aa7c1",
    accent2: "#4c9992",
    accent3: "#7899d0",
    accent4: "#c49365",
    accent5: "#7da788",

    menuSelectedBg: "#195d75",
    menuSelectedText: "#ffffff",

    brandAccent: BRAND_HEX,
    focusRing: "rgba(74, 167, 193, 0.36)",

    ...darkStatusColors,
  },
};

export default deepCurrentTheme;
