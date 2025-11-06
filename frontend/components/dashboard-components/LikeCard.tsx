'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, Statistic, Skeleton } from 'antd';
import type { TinyLineConfig } from '@ant-design/plots';

// SSR-safe dynamic import of TinyLine
const TinyLine = dynamic(
  () => import('@ant-design/plots').then((m) => m.TinyLine),
  { ssr: false }
);

export interface LikeCardProps {
  title?: string;            // Default: 'Likes'
  total: number;             // Total likes
  trend?: number[];          // Sparkline series
  loading?: boolean;
}

const LikeCard: React.FC<LikeCardProps> = ({
  title = 'Likes',
  total,
  trend = [],
  loading = false,
}) => {
  const data: number[] = Array.isArray(trend) ? trend : [];

  const config: TinyLineConfig = {
    data,
    autoFit: true,
    smooth: true,
    height: 56,
    padding: 0,
    tooltip: {},
  };

  return (
    <Card bordered={false} bodyStyle={{ padding: 16 }}>
      <Statistic title={title} value={total} />
      {loading ? (
        <Skeleton active paragraph={false} style={{ marginTop: 8 }} />
      ) : (
        <div style={{ marginTop: 8 }}>
          <TinyLine {...config} />
        </div>
      )}
    </Card>
  );
};

export default LikeCard;
