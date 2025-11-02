import React from 'react'
import MainLayout from '@/components/layout-components/MainLayout'

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
