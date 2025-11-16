// app/keenkonnect/layout.tsx
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
 * Inner shell that forces the KeenKonnect sidebar to be active
 * via the ?sidebar=keenkonnect query param.
 */
function KeenKonnectShell({ children }: SegmentLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const currentSidebar = searchParams.get('sidebar')

    if (currentSidebar === 'keenkonnect') return

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('sidebar', 'keenkonnect')

    router.replace(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  return <MainLayout>{children}</MainLayout>
}

/**
 * Segment layout for all /keenkonnect/* pages.
 * Reuses the global MainLayout (Ant Design Layout + navigation)
 * and provides an Ant Design–based Suspense fallback.
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
      <KeenKonnectShell>{children}</KeenKonnectShell>
    </Suspense>
  )
}
