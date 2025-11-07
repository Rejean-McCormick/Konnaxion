'use client';

import React, { useState } from 'react';
import PageContainer from '@/components/PageContainer';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Spin,
  message as antdMessage,
} from 'antd';
import {
  SyncOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Paragraph, Text } = Typography;

type OfflineContentPackage = {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  downloaded: boolean;
  syncing: boolean;
  size?: string;
};

const initialPackages: OfflineContentPackage[] = [
  {
    id: 'foundation-js',
    title: 'JavaScript Foundations',
    description: 'Core JS concepts for beginners to intermediate learners.',
    lastUpdated: 'Never',
    downloaded: false,
    syncing: false,
  },
  {
    id: 'react-advanced',
    title: 'Advanced React',
    description: 'Hooks, performance patterns, suspense and more.',
    lastUpdated: 'Never',
    downloaded: false,
    syncing: false,
  },
  {
    id: 'data-viz',
    title: 'Data Visualization Toolkit',
    description: 'Build charts and dashboards with modern libraries.',
    lastUpdated: 'Never',
    downloaded: false,
    syncing: false,
  },
];

export default function OfflineContentPage(): JSX.Element {
  const [packages, setPackages] = useState<OfflineContentPackage[]>(initialPackages);

  // Sync / download a single package
  const handleSync = (id: string) => {
    // mark as syncing
    setPackages(prev =>
      prev.map(pkg => (pkg.id === id ? { ...pkg, syncing: true } : pkg)),
    );

    // simulate download
    setTimeout(() => {
      setPackages(prev =>
        prev.map(pkg =>
          pkg.id === id
            ? {
                ...pkg,
                syncing: false,
                downloaded: true,
                lastUpdated: new Date().toLocaleString(),
                size: pkg.size || '100 MB',
              }
            : pkg,
        ),
      );
      antdMessage.success(`Package "${id}" synced successfully!`);
    }, 2000);
  };

  // Sync all packages
  const handleSyncAll = () => {
    setPackages(prev => prev.map(pkg => ({ ...pkg, syncing: true })));

    setTimeout(() => {
      setPackages(prev =>
        prev.map(pkg => ({
          ...pkg,
          syncing: false,
          downloaded: true,
          lastUpdated: new Date().toLocaleString(),
          size: pkg.size || '100 MB',
        })),
      );
      antdMessage.success('All packages synced successfully!');
    }, 2000);
  };

  return (
    <PageContainer title="Offline Content">
      {/* Global Sync All button */}
      <Row justify="end" style={{ marginBottom: 24 }}>
        <Button type="primary" onClick={handleSyncAll}>
          Sync All
        </Button>
      </Row>

      {/* Grid of packages */}
      <Row gutter={[16, 16]}>
        {packages.map(pkg => (
          <Col xs={24} sm={12} md={8} key={pkg.id}>
            <Card
              title={pkg.title}
              extra={
                pkg.syncing ? (
                  <Spin
                    indicator={<SyncOutlined style={{ fontSize: 24 }} spin />}
                  />
                ) : (
                  <Button type="primary" onClick={() => handleSync(pkg.id)}>
                    {pkg.downloaded ? 'Sync Updates' : 'Download'}
                  </Button>
                )
              }
            >
              <Paragraph>{pkg.description}</Paragraph>
              <Text strong>Last Updated:</Text> <span>{pkg.lastUpdated}</span>
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
}
