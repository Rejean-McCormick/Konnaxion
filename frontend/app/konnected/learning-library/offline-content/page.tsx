'use client'

import React, { useState } from 'react';
import { NextPage } from 'next';
import { Row, Col, Card, Button, Typography, Spin, message } from 'antd';
import { SyncOutlined, CheckCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Paragraph, Text } = Typography;

interface OfflineContentPackage {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  downloaded: boolean;
  size?: string;
  syncing: boolean;
}

const initialPackages: OfflineContentPackage[] = [
  {
    id: '1',
    title: 'Package A: Course Material',
    description: 'Includes video lectures, study guides, and supplemental notes.',
    lastUpdated: '2025-04-10 14:00',
    downloaded: true,
    size: '150 MB',
    syncing: false,
  },
  {
    id: '2',
    title: 'Package B: Interactive Quiz',
    description: 'Contains interactive quizzes and practice tests.',
    lastUpdated: '2025-04-09 10:30',
    downloaded: false,
    syncing: false,
  },
  {
    id: '3',
    title: 'Package C: Supplemental Readings',
    description: 'A collection of additional readings and research articles.',
    lastUpdated: '2025-04-08 09:15',
    downloaded: true,
    size: '75 MB',
    syncing: false,
  },
  // Add more packages as needed...
];

const OfflineContentPage: NextPage = () => {
  const [packages, setPackages] = useState<OfflineContentPackage[]>(initialPackages);

  // Trigger sync/download for a single package
  const handleSync = (id: string) => {
    // Mark the package as syncing
    setPackages(prev =>
      prev.map(pkg =>
        pkg.id === id ? { ...pkg, syncing: true } : pkg
      )
    );
    // Simulate a download/sync delay
    setTimeout(() => {
      setPackages(prev =>
        prev.map(pkg => {
          if (pkg.id === id) {
            return {
              ...pkg,
              syncing: false,
              downloaded: true,
              lastUpdated: new Date().toLocaleString(),
              size: pkg.size || '100 MB',
          }
          return pkg;
        })
      );
      message.success(`Package "${id}" synced successfully!`);
    }, 2000);

  // Global "Sync All" action for all packages
  const handleSyncAll = () => {
    setPackages(prev =>
      prev.map(pkg => ({ ...pkg, syncing: true }))
    );
    setTimeout(() => {
      setPackages(prev =>
        prev.map(pkg => ({
          ...pkg,
          syncing: false,
          downloaded: true,
          lastUpdated: new Date().toLocaleString(),
          size: pkg.size || '100 MB',
        }))
      );
      message.success('All packages synced successfully!');
    }, 2000);

  return (
    <PageContainer title="Offline Content">
      {/* Global Sync All button */}
      <Row justify="end" style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={handleSyncAll}>
          Sync All
        </Button>
      </Row>

      {/* Grid display of content packages */}
      <Row gutter={[16, 16]}>
        {packages.map((pkg) => (
          <Col xs={24} sm={12} md={8} key={pkg.id}>
            <Card
              title={pkg.title}
              extra={
                pkg.syncing ? (
                  <Spin indicator={<SyncOutlined style={{ fontSize: 24 }} spin />} />
                ) : (
                  <Button type="primary" onClick={() => handleSync(pkg.id)}>
                    {pkg.downloaded ? 'Sync Updates' : 'Download'}
                  </Button>
                )
              }
            >
              <Paragraph>{pkg.description}</Paragraph>
              <Text strong>Last Updated:</Text> {pkg.lastUpdated}
              {pkg.downloaded && (
                <>
                  <br />
                  <Text type="success">
                    <CheckCircleOutlined /> Up to date
                  </Text>
                  <br />
                  <Text>Size: {pkg.size}</Text>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </PageContainer>
  );

// Wrap the page with MainLayout

  return <MainLayout>{page}</MainLayout>;

export default OfflineContentPage;
