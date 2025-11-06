'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, Statistic, Skeleton } from 'antd';
import type { TinyColumnConfig } from '@ant-design/plots';

// SSR-safe dynamic import of TinyColumn
const TinyColumn = dynamic(
  () => import('@ant-design/plots').then((m) => m.TinyColumn),
  { ssr: false }
);

export interface UserCardProps {
  title?: string;                       // Default: 'New Users'
  total: number;                        // Total users (or new users)
  trend?: number[];                     // Tiny column series (e.g., daily counts)
  loading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  title = 'New Users',
  total,
  trend = [],
  loading = false,
}) => {
  const data: number[] = Array.isArray(trend) ? trend : [];

  const config: TinyColumnConfig = {
    data,
    autoFit: true,
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
          <TinyColumn {...config} />
        </div>
      )}
    </Card>
  );
};

export default UserCard;
