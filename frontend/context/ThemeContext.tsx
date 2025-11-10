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
import { ConfigProvider, theme as antdTheme } from 'antd'
import themes, { ThemeType, themeKeys } from '@/theme'
import type { ThemeObject } from '@/theme/types'

/** Le “sac” de tokens que tes composants consomment côté app */
type TokenBag = ThemeObject

/** Variables CSS perso à exporter */
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

/** Supprime les clés dont la valeur est un objet vide */
const pruneEmptyObjects = <T extends Record<string, any>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v && (typeof v !== 'object' || Object.keys(v).length > 0),
    ),
  ) as T

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  /** 1) clé valide */
  const [themeType, setThemeType] = useState<ThemeType>('funky')

  /** Restore depuis localStorage (coté client uniquement) */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('themeType') as ThemeType | null
      if (saved && themeKeys.includes(saved)) setThemeType(saved)
    } catch {
      /* stockage indisponible : ignorer */
    }
  }, [])

  /** Thème brut “tel que défini” */
  const raw: Partial<TokenBag> = useMemo(
    () => (themes?.[themeType] ?? {}) as Partial<TokenBag>,
    [themeType],
  )

  /** 2) Exposer data-theme + classes + variables CSS, et nettoyer les anciennes valeurs */
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const html = document.documentElement

    // Attribut data-theme
    html.setAttribute('data-theme', themeType)

    // Classes normalisées
    themeKeys.forEach(k => html.classList.remove(`theme-${k}`))
    html.classList.add(`theme-${themeType}`)

    // Variables CSS perso: set ou clear
    cssVars.forEach(key => {
      const name = `--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`
      const val = (raw as any)[key]
      if (val != null) html.style.setProperty(name, String(val))
      else html.style.removeProperty(name)
    })
  }, [themeType, raw])

  /** Persist */
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('themeType', themeType)
    } catch {
      /* stockage indisponible : ignorer */
    }
  }, [themeType])

  /** 3) Cycle sûr (même si themeKeys était vidé par erreur) */
  const cycleTheme = () => {
    const keys = themeKeys.length > 0 ? themeKeys : (['light'] as ThemeType[])
    const idx = keys.indexOf(themeType)
    const next = keys[(idx + 1) % keys.length] ?? 'light'
    setThemeType(next)
  }

  /** 4) Laisser AntD dériver les alias; `algorithm` peut être absent dans `ThemeObject` */
  const algorithm = (raw as any).algorithm ?? antdTheme.defaultAlgorithm

  /** 5) Overrides globaux strictement sur des seeds / communs si présents */
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

  /** 6) Remap des clés “raw” vers components.* puis purge des objets vides */
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
      // AntD attend headerBg/headerColor
      ...(raw as any).tableHeaderBg ? { headerBg: (raw as any).tableHeaderBg } : {},
    }),
  })

  /** 7) Exposer un token “safe” au contexte sans cast agressif */
  const safeToken: Readonly<Partial<TokenBag>> = useMemo(() => Object.freeze({ ...raw }), [raw])

  return (
    <ThemeContext.Provider value={{ token: safeToken, themeType, setThemeType, cycleTheme }}>
      <ConfigProvider
        theme={{
          algorithm,
          cssVar: true,
          hashed: false,
          token: tokenOverrides,
          components: componentsOverrides,
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
