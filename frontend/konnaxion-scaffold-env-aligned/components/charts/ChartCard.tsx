'use client';
import React from 'react';
import { Card } from 'antd';

export default function ChartCard({
  title,
  extra,
  height = 120,
  children,
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  height?: number;
  children?: React.ReactNode;
}) {
  return (
    <Card title={title} extra={extra} bordered={false}>
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
        {children ?? <em>Chart placeholder</em>}
      </div>
    </Card>
  );
}
