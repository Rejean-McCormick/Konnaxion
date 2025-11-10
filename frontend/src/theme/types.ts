// File: /src/theme/types.ts
// Permissive typing for Ant Design seeds + a few app-specific keys.
export interface ThemeObject {
  /* Labels / UI */
  label: string;
  icon?: string;

  /* AntD algorithm (light/dark). Keep `any` to avoid internal API coupling. */
  algorithm?: any;

  /* Common seed / alias colors */
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

  /* Radius / typography / dimensions */
  borderRadius?: number;
  borderRadiusLG?: number;
  controlHeight?: number;
  fontFamily?: string;
  fontSize?: number;
  fontSizeLG?: number;
  paddingContentHorizontalLG?: number;
  paddingContentVerticalLG?: number;

  /* “Raw” keys consumed by ThemeProvider for component remaps */
  // Layout
  layoutColorBgSider?: string;

  // Menu
  menuBg?: string;
  menuItemHoverBg?: string;
  menuItemSelectedBg?: string;
  menuItemTextColor?: string;

  // Dropdown
  dropdownBg?: string;
  dropdownItemHoverBg?: string;

  // Table
  tableHeaderBg?: string;

  /* Custom CSS variables (exported to :root in ThemeContext) */
  bgMain?: string;
  bgLight?: string;
  bgDark?: string;
  textMain?: string;
  accent?: string;

  /* Optional extensions */
  [key: string]: string | number | boolean | undefined;
}
