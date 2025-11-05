// src/theme/types.ts
// Typage permissif mais utile pour nos thèmes Ant Design + quelques clés custom.
export interface ThemeObject {
  /* Libellés / UI */
  label: string;
  icon?: string;

  /* Algorithme AntD (light/dark). On laisse `any` pour éviter de dépendre d'APIs internes */
  algorithm?: any;

  /* Couleurs seed / alias fréquentes */
  colorPrimary?: string;
  colorInfo?: string;
  colorSuccess?: string;
  colorWarning?: string;
  colorError?: string;

  colorBgLayout?: string;
  colorBgContainer?: string;
  colorBgElevated?: string;
  colorBgMask?: string;
  colorBgSpotlight?: string;
  colorBgSolid?: string;
  colorBgSolidHover?: string;
  colorBgPopconfirm?: string;

  colorText?: string;
  colorTextBase?: string;
  colorTextSecondary?: string;
  colorTextTertiary?: string;
  colorTextPlaceholder?: string;
  colorTextDisabled?: string;

  colorBorder?: string;
  colorSplit?: string;

  /* Rayon / typo / dimensions */
  borderRadius?: number;
  borderRadiusLG?: number;
  controlHeight?: number;
  fontFamily?: string;
  fontSize?: number;
  fontSizeLG?: number;
  paddingContentHorizontalLG?: number;
  paddingContentVerticalLG?: number;

  /* Clés "raw" utilisées dans ThemeProvider (menu, dropdown…) */
  menuBg?: string;
  menuItemHoverBg?: string;
  menuItemSelectedBg?: string;
  menuItemTextColor?: string;
  dropdownBg?: string;
  dropdownItemHoverBg?: string;

  /* Variables perso exposées en CSS (voir ThemeContext) */
  bgMain?: string;
  bgLight?: string;
  bgDark?: string;
  textMain?: string;
  accent?: string;

  /* Éventuelles extensions */
  [key: string]: string | number | boolean | undefined;
}
