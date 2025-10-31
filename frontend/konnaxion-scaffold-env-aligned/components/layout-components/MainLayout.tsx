'use client';
import React from 'react';
import { Layout } from 'antd';

type Props = { children: React.ReactNode };

export default function MainLayout({ children }: Props) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout.Header style={{ color: '#fff', fontWeight: 600 }}>Konnaxion</Layout.Header>
      <Layout.Content style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </Layout.Content>
    </Layout>
  );
}
