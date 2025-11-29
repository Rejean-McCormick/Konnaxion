// FILE: frontend/app/ethikos/layout.tsx
// app/ethikos/layout.tsx
'use client'

/**
 * Updated Ethikos segment layout.
 *
 * Changes:
 *  - Keep existing defaulting to ?sidebar=ethikos (preserves URL hash on replace).
 *  - Use shared <MainLayout /> container for global nav + header.
 *  - Improve Suspense fallback with reusable <Loading fullscreen />.
 *  - Wrap children with ProComponents <WaterMark> to subtly brand the suite.
 *
 * Source references:
 *  - Original layout baseline: :contentReference[oaicite:0]{index=0}
 *  - MainLayout (global AntD shell): :contentReference[oaicite:1]{index=1}
 *  - Loading component used in fallback: :contentReference[oaicite:2]{index=2}
 */

import type { ReactNode } from 'react'
import React, { Suspense, useEffect } from 'react'
import { Layout } from 'antd'
import { WaterMark } from '@ant-design/pro-components'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import MainLayout from '@/components/layout-components/MainLayout'
import Loading from '@/components/Loading'

const { Content } = Layout

interface SegmentLayoutProps {
  children: ReactNode
}

/**
 * Inner shell that *defaults* the sidebar to "ethikos" via ?sidebar=ethikos
 * when the query param is missing.
 *
 * Important:
 * - If ?sidebar is already set (ekoh, keenkonnect, kreative, …), it is respected.
 *   This lets the module switcher (LogoTitle) change suites even while you are
 *   on a /ethikos/* URL.
 */
function EthikosShell({ children }: SegmentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentSidebar = searchParams.get('sidebar')

    // Only inject the default if the param is absent.
    // Do NOT override if the user explicitly chose another suite.
    if (currentSidebar !== null) return

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('sidebar', 'ethikos')

    // Preserve current hash if present (client-only)
    const hash =
      typeof window !== 'undefined' && window.location?.hash
        ? window.location.hash
        : ''

    router.replace(`${pathname}?${params.toString()}${hash}`)
    // We intentionally depend on the stable searchParams object + router + pathname.
  }, [router, pathname, searchParams])

  return (
    <MainLayout>
      {/* Subtle suite watermark; page-level PageContainer can still set ghost or override visuals */}
      <WaterMark
        content="ethiKos"
        gapX={120}
        gapY={120}
        fontColor="rgba(0,0,0,0.04)"
      >
        {children}
      </WaterMark>
    </MainLayout>
  )
}

/**
 * Segment layout for all /ethikos/* pages.
 *
 * - Wraps content in MainLayout (global Ant Design layout + navigation).
 * - Ensures the Ethikos suite is active by default in the sidebar.
 * - Provides an Ant Design–based Suspense fallback while children load.
 */
export default function SegmentLayout({ children }: SegmentLayoutProps) {
  return (
    <Suspense
      fallback={
        <Layout style={{ minHeight: '100vh' }}>
          <Content
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Loading fullscreen message="Loading ethiKos…" />
          </Content>
        </Layout>
      }
    >
      <EthikosShell>{children}</EthikosShell>
    </Suspense>
  )
}
