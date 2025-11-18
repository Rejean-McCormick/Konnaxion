// File: /context/ThemeContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  ReactNode,
  useMemo,
} from 'react'
import { ConfigProvider, theme as antdTheme, App as AntdApp } from 'antd'
import enUS from 'antd/locale/en_US'
import themes, { ThemeType, themeKeys } from '@/theme'
import type { ThemeObject } from '@/theme/types'

/** The “bag” of design tokens your app consumes */
type TokenBag = ThemeObject

/** Custom CSS variables to export on <html> */
const cssVars = ['bgMain', 'bgLight', 'bgDark', 'textMain', 'accent'] as const

interface ThemeContextProps {
  token: Readonly<Partial<TokenBag>>
  themeType: ThemeType
  setThemeType: (t: ThemeType) => void
  cycleTheme: () => void
}

const ThemeContext = createContext<ThemeContextProps | null>(null)

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

/** Strip keys whose value is an empty object */
const pruneEmptyObjects = <T extends Record<string, any>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v && (typeof v !== 'object' || Object.keys(v).length > 0),
    ),
  ) as T

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /** 1) Current theme key */
  const [themeType, setThemeType] = useState<ThemeType>('funky')

  /** Restore from localStorage on client */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('themeType') as ThemeType | null
      if (saved && themeKeys.includes(saved)) setThemeType(saved)
    } catch {
      // Storage unavailable: ignore
    }
  }, [])

  /** Raw theme object as defined in your theme registry */
  const raw: Partial<TokenBag> = useMemo(
    () => ((themes?.[themeType] ?? {}) as unknown as Partial<TokenBag>),
    [themeType],
  )

  /** 2) Expose data-theme + CSS classes + CSS variables on <html> */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const html = document.documentElement

    // data-theme attribute
    html.setAttribute('data-theme', themeType)

    // Normalized classes
    themeKeys.forEach(k => html.classList.remove(`theme-${k}`))
    html.classList.add(`theme-${themeType}`)

    // Custom CSS variables: set or clear
    cssVars.forEach(key => {
      const name = `--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`
      const val = (raw as any)[key]
      if (val != null) html.style.setProperty(name, String(val))
      else html.style.removeProperty(name)
    })
  }, [themeType, raw])

  /** Persist current theme key */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('themeType', themeType)
    } catch {
      // Storage unavailable: ignore
    }
  }, [themeType])

  /** Safe cycling even if themeKeys is accidentally empty */
  const cycleTheme = () => {
    const keys = themeKeys.length > 0 ? themeKeys : (['light'] as ThemeType[])
    const idx = keys.indexOf(themeType)
    const next = keys[(idx + 1) % keys.length] ?? 'light'
    setThemeType(next)
  }

  /** Let AntD derive aliases; fallback to default algorithm */
  const algorithm = (raw as any).algorithm ?? antdTheme.defaultAlgorithm

  /** Global token overrides only where explicitly provided */
  const tokenOverrides: Record<string, any> = {
    // Core semantic colors
    ...(raw.colorPrimary != null && { colorPrimary: raw.colorPrimary }),
    ...((raw as any).colorPrimaryBg != null && {
      colorPrimaryBg: (raw as any).colorPrimaryBg,
    }),
    ...((raw as any).colorPrimaryHover != null && {
      colorPrimaryHover: (raw as any).colorPrimaryHover,
    }),
    ...((raw as any).colorPrimaryActive != null && {
      colorPrimaryActive: (raw as any).colorPrimaryActive,
    }),
    ...(raw.colorInfo != null && { colorInfo: raw.colorInfo }),
    ...(raw.colorSuccess != null && { colorSuccess: raw.colorSuccess }),
    ...(raw.colorWarning != null && { colorWarning: raw.colorWarning }),
    ...(raw.colorError != null && { colorError: raw.colorError }),

    // Backgrounds
    ...((raw as any).colorBgBase != null && {
      colorBgBase: (raw as any).colorBgBase,
    }),
    ...(raw.colorBgLayout != null && { colorBgLayout: raw.colorBgLayout }),
    ...(raw.colorBgContainer != null && { colorBgContainer: raw.colorBgContainer }),
    ...(raw.colorBgElevated != null && { colorBgElevated: raw.colorBgElevated }),
    ...(raw.colorBgMask != null && { colorBgMask: raw.colorBgMask }),
    ...(raw.colorBgSpotlight != null && { colorBgSpotlight: raw.colorBgSpotlight }),
    ...(raw.colorBgSolid != null && { colorBgSolid: raw.colorBgSolid }),
    ...(raw.colorBgSolidHover != null && {
      colorBgSolidHover: raw.colorBgSolidHover,
    }),
    ...(raw.colorBgPopconfirm != null && {
      colorBgPopconfirm: raw.colorBgPopconfirm,
    }),

    // Text
    ...(raw.colorText != null && { colorText: raw.colorText }),
    ...(raw.colorTextBase != null && { colorTextBase: raw.colorTextBase }),
    ...(raw.colorTextSecondary != null && {
      colorTextSecondary: raw.colorTextSecondary,
    }),
    ...(raw.colorTextTertiary != null && {
      colorTextTertiary: raw.colorTextTertiary,
    }),
    ...(raw.colorTextPlaceholder != null && {
      colorTextPlaceholder: raw.colorTextPlaceholder,
    }),
    ...(raw.colorTextDisabled != null && {
      colorTextDisabled: raw.colorTextDisabled,
    }),

    // Borders
    ...(raw.colorBorder != null && { colorBorder: raw.colorBorder }),
    ...(raw.colorSplit != null && { colorSplit: raw.colorSplit }),

    // Shadows
    ...((raw as any).boxShadow != null && { boxShadow: (raw as any).boxShadow }),
    ...((raw as any).boxShadowSecondary != null && {
      boxShadowSecondary: (raw as any).boxShadowSecondary,
    }),

    // Radius / typography / layout
    ...(raw.borderRadius != null && { borderRadius: raw.borderRadius }),
    ...(raw.borderRadiusLG != null && { borderRadiusLG: raw.borderRadiusLG }),
    ...(raw.controlHeight != null && { controlHeight: raw.controlHeight }),
    ...(raw.fontFamily != null && { fontFamily: raw.fontFamily }),
    ...(raw.fontSize != null && { fontSize: raw.fontSize }),
    ...(raw.fontSizeLG != null && { fontSizeLG: raw.fontSizeLG }),
    ...(raw.paddingContentHorizontalLG != null && {
      paddingContentHorizontalLG: raw.paddingContentHorizontalLG,
    }),
    ...(raw.paddingContentVerticalLG != null && {
      paddingContentVerticalLG: raw.paddingContentVerticalLG,
    }),
  }

  /**
   * Normalize menu-related raw keys across themes:
   * - funkyTheme uses custom menuItem* keys
   * - other themes (light/dark/cyber/ocean/sunset) use colorMenuItem* keys
   * This helper merges both into AntD Menu component tokens.
   */
  const menuItemTextColor =
    (raw as any).menuItemTextColor ?? (raw as any).colorMenuItemText
  const menuItemHoverBg =
    (raw as any).menuItemHoverBg ?? (raw as any).colorMenuItemHoverBg
  const menuItemSelectedBg =
    (raw as any).menuItemSelectedBg ?? (raw as any).colorMenuItemSelectedBg
  const menuItemSelectedColor =
    (raw as any).menuItemSelectedText ?? (raw as any).colorMenuItemSelectedText
  const menuBg = (raw as any).menuBg

  /** Map “raw” keys to component-level overrides, then strip empty objects */
  const componentsOverrides = pruneEmptyObjects({
    Layout: {
      ...(raw as any).layoutColorBgSider
        ? { siderBg: (raw as any).layoutColorBgSider }
        : {},
    },
    Menu: pruneEmptyObjects({
      ...(menuItemTextColor ? { itemColor: menuItemTextColor } : {}),
      ...(menuItemHoverBg ? { itemHoverBg: menuItemHoverBg } : {}),
      ...(menuItemSelectedBg ? { itemSelectedBg: menuItemSelectedBg } : {}),
      ...(menuItemSelectedColor ? { itemSelectedColor: menuItemSelectedColor } : {}),
      ...(menuBg ? { itemBg: menuBg } : {}),
    }),
    Dropdown: pruneEmptyObjects({
      ...(raw as any).dropdownBg ? { colorBgElevated: (raw as any).dropdownBg } : {},
      ...(raw as any).dropdownItemHoverBg
        ? { controlItemBgHover: (raw as any).dropdownItemHoverBg }
        : {},
    }),
    Popconfirm: pruneEmptyObjects({
      ...(raw as any).colorBgPopconfirm
        ? { colorBgElevated: (raw as any).colorBgPopconfirm }
        : {},
    }),
    Table: pruneEmptyObjects({
      ...(raw as any).tableHeaderBg ? { headerBg: (raw as any).tableHeaderBg } : {},
    }),
  })

  /** Expose a frozen token bag to the rest of the app */
  const safeToken: Readonly<Partial<TokenBag>> = useMemo(
    () => Object.freeze({ ...raw }),
    [raw],
  )

  return (
    <ThemeContext.Provider
      value={{ token: safeToken, themeType, setThemeType, cycleTheme }}
    >
      <ConfigProvider
        locale={enUS}
        componentSize="middle"
        theme={{
          algorithm,
          cssVar: true,
          hashed: false,
          token: tokenOverrides,
          components: componentsOverrides,
        }}
      >
        <AntdApp>{children}</AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
