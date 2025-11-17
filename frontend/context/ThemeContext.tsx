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
    ...(raw.colorPrimary != null && { colorPrimary: raw.colorPrimary }),
    ...(raw.colorInfo != null && { colorInfo: raw.colorInfo }),
    ...(raw.colorSuccess != null && { colorSuccess: raw.colorSuccess }),
    ...(raw.colorWarning != null && { colorWarning: raw.colorWarning }),
    ...(raw.colorError != null && { colorError: raw.colorError }),

    ...(raw.colorBgLayout != null && { colorBgLayout: raw.colorBgLayout }),
    ...(raw.colorBgContainer != null && { colorBgContainer: raw.colorBgContainer }),
    ...(raw.colorBgElevated != null && { colorBgElevated: raw.colorBgElevated }),

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

  /** Map “raw” keys to component-level overrides, then strip empty objects */
  const componentsOverrides = pruneEmptyObjects({
    Layout: {
      ...(raw as any).layoutColorBgSider
        ? { siderBg: (raw as any).layoutColorBgSider }
        : {},
    },
    Menu: pruneEmptyObjects({
      ...(raw as any).menuItemTextColor ? { itemColor: (raw as any).menuItemTextColor } : {},
      ...(raw as any).menuItemHoverBg ? { itemHoverBg: (raw as any).menuItemHoverBg } : {},
      ...(raw as any).menuItemSelectedBg
        ? { itemSelectedBg: (raw as any).menuItemSelectedBg }
        : {},
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
        /** Force English UI (no more Chinese labels) */
        locale={enUS}
        /** Optional global defaults */
        componentSize="middle"
        theme={{
          algorithm,
          cssVar: true,
          hashed: false,
          token: tokenOverrides,
          components: componentsOverrides,
        }}
      >
        {/* Ant Design App wrapper: enables context-aware message/notification/modal in React 19 */}
        <AntdApp>
          {children}
        </AntdApp>
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
