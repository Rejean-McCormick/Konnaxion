'use client';

import { Layout, Spin } from 'antd';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import React, { Suspense, useEffect } from 'react';

import MainLayout from '@/components/layout-components/MainLayout';

const { Content } = Layout;

interface KonsensusLayoutProps {
  children: ReactNode;
}

function KonsensusShell({ children }: KonsensusLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sidebarParam = searchParams.get('sidebar');
  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (sidebarParam !== null) return;

    const params = new URLSearchParams(searchParamsString);
    params.set('sidebar', 'ethikos');

    const hash =
      typeof window !== 'undefined' && window.location.hash
        ? window.location.hash
        : '';

    router.replace(`${pathname}?${params.toString()}${hash}`);
  }, [router, pathname, sidebarParam, searchParamsString]);

  return <MainLayout>{children}</MainLayout>;
}

/** Konsensus is technically mounted at /konsensus but product-owned by ethiKos. */
export default function KonsensusLayout({ children }: KonsensusLayoutProps) {
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
      <KonsensusShell>{children}</KonsensusShell>
    </Suspense>
  );
}
