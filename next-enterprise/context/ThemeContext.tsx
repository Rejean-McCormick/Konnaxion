// File: /context/ThemeContext.tsx
'use client'

import React, {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useEffect,
  ReactNode,
} from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import themes, { ThemeType, themeKeys } from '@/theme'

type TokenBag = (typeof themes)[ThemeType]
// clés perso que vous exposez sur <html> (optionnel)
const cssVars = ['bgMain', 'bgLight', 'bgDark', 'textMain', 'accent'] as const

interface ThemeContextProps {
  token: TokenBag
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

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeType, setThemeType] = useState<ThemeType>('funkyTheme')
  const defaultSeed = antdTheme.defaultSeed

  // Restore from localStorage
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const saved = localStorage.getItem('themeType') as ThemeType | null
    if (saved && themeKeys.includes(saved)) {
      setThemeType(saved)
    }
  }, [])

  // Raw theme or empty
  const raw: Partial<TokenBag> = themes[themeType] ?? {}

  // Expose custom CSS vars on <html>
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const html = document.documentElement
    themeKeys.forEach(k => html.classList.remove(k))
    html.classList.add(themeType)
    cssVars.forEach(key => {
      const name = `--${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}`
      html.style.setProperty(name, String((raw as any)[key]))
    })
  }, [themeType, raw])

  // Persist choice
  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('themeType', themeType)
  }, [themeType])

  // Cycle themes
  const cycleTheme = () => {
    const idx = themeKeys.indexOf(themeType)
    setThemeType(themeKeys[(idx + 1) % themeKeys.length])
  }

  // Merge with fallback on defaultSeed
  const mergedToken = {
    ...defaultSeed,
    ...(raw as any),

    // ** TEXT **
    colorText            : raw.colorText            ?? defaultSeed.colorText,
    colorTextBase        : raw.colorTextBase        ?? defaultSeed.colorTextBase,
    colorTextSecondary   : raw.colorTextSecondary   ?? defaultSeed.colorTextSecondary,
    colorTextTertiary    : raw.colorTextTertiary    ?? defaultSeed.colorTextTertiary,
    colorTextPlaceholder : raw.colorTextPlaceholder ?? defaultSeed.colorTextPlaceholder,
    colorTextDisabled    : raw.colorTextDisabled    ?? defaultSeed.colorTextDisabled,

    // Form labels
    colorTextLabel       : (raw as any).colorTextLabel    ?? defaultSeed.colorTextLabel,
    colorTextStrong      : (raw as any).colorTextStrong   ?? defaultSeed.colorTextStrong,

    // Seed overrides
    colorPrimary         : raw.colorPrimary         ?? defaultSeed.colorPrimary,
    colorLink            : raw.accent               ?? defaultSeed.colorLink,
    colorLinkHover       : raw.accent               ?? defaultSeed.colorLinkHover,

    // Layout & containers
    colorBgLayout        : raw.colorBgLayout        ?? defaultSeed.colorBgLayout,
    colorBgContainer     : raw.colorBgContainer     ?? defaultSeed.colorBgContainer,

    // Elevated surfaces
    colorBgElevated      : raw.colorBgElevated      ?? defaultSeed.colorBgElevated,
    colorBgMask          : raw.colorBgMask          ?? defaultSeed.colorBgMask,
    colorBgSpotlight     : raw.colorBgSpotlight     ?? defaultSeed.colorBgSpotlight,

    // Solid buttons
    colorBgSolid         : raw.colorBgSolid         ?? defaultSeed.colorBgSolid,
    colorBgSolidHover    : raw.colorBgSolidHover    ?? defaultSeed.colorBgSolidHover,

    // Menu & sidebar
    colorMenuItemHoverBg    : (raw as any).menuItemHoverBg    ?? defaultSeed.colorMenuItemHoverBg,
    colorMenuItemSelectedBg : (raw as any).menuItemSelectedBg ?? defaultSeed.colorMenuItemSelectedBg,
    colorMenuItemText       : (raw as any).menuItemTextColor  ?? defaultSeed.colorMenuItemText,

    // Dropdown & Popconfirm
    colorBgPopconfirm    : raw.colorBgPopconfirm    ?? defaultSeed.colorBgPopconfirm,

    // Borders & splits
    colorBorder          : raw.colorBorder          ?? defaultSeed.colorBorder,
    colorSplit           : raw.colorSplit           ?? defaultSeed.colorSplit,

    // Shadows
    boxShadow            : raw.boxShadow            ?? defaultSeed.boxShadow,
    boxShadowSecondary   : raw.boxShadowSecondary   ?? defaultSeed.boxShadowSecondary,

    // Typography & spacing
    fontFamily                : raw.fontFamily                ?? defaultSeed.fontFamily,
    fontSize                  : raw.fontSize                  ?? defaultSeed.fontSize,
    fontSizeLG                : raw.fontSizeLG                ?? defaultSeed.fontSizeLG,
    paddingContentHorizontalLG: raw.paddingContentHorizontalLG ?? defaultSeed.paddingContentHorizontalLG,
    paddingContentVerticalLG  : raw.paddingContentVerticalLG   ?? defaultSeed.paddingContentVerticalLG,
  }

  const algorithm = raw.algorithm ?? antdTheme.defaultAlgorithm

  return (
    <ThemeContext.Provider value={{ token: raw as TokenBag, themeType, setThemeType, cycleTheme }}>
      <ConfigProvider
        theme={{
          algorithm,
          cssVar: true,     // ← utilise le préfixe `--ant-*`
          hashed: false,
          token: mergedToken,
          components: {
            Table: {
              // background for table headers
              colorBgHeader: (raw as any).tableHeaderBg ?? mergedToken.colorBgContainer,
              // ensure header text is readable
              colorText:     mergedToken.colorTextBase,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  )
}
