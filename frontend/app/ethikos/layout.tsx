// app/ethikos/layout.tsx
'use client'

import type { ReactNode } from 'react'
import React, { Suspense, useEffect } from 'react'
import { Layout, Spin } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import MainLayout from '@/components/layout-components/MainLayout'

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

    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return <MainLayout>{children}</MainLayout>
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
            <Spin size="large" />
          </Content>
        </Layout>
      }
    >
      <EthikosShell>{children}</EthikosShell>
    </Suspense>
  )
}
