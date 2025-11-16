// app/konnected/layout.tsx
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
 * Inner shell that forces the KonnectED sidebar to be active
 * via the ?sidebar=konnected query param.
 *
 * Responsibilities:
 * - Ensure that when a user is under /konnected/*, the "KonnectED" suite
 *   is selected in MainLayout (so the correct routes and label show up).
 * - Delegate all global chrome (sidebar, header, breadcrumbs) to MainLayout.
 * - Do NOT handle page-level titles or actions; those belong to KonnectedPageShell.
 */
function KonnectedShell({ children }: SegmentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentSidebar = searchParams.get('sidebar')

    if (currentSidebar === 'konnected') return

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('sidebar', 'konnected')

    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return <MainLayout>{children}</MainLayout>
}

/**
 * Segment layout for all /konnected/* pages.
 *
 * - Wraps content in MainLayout (global Ant Design layout + navigation).
 * - Provides an Ant Design–based Suspense fallback while children load.
 * - Keeps page-level layout concerns in KonnectedPageShell (used by pages themselves).
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
      <KonnectedShell>{children}</KonnectedShell>
    </Suspense>
  )
}
