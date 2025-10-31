'use client';
import React from 'react';
import { Card, Space, Typography } from 'antd';

/** Minimal PageContainer to avoid @ant-design/pro-components dependency. */
export default function PageContainer({
  title,
  extra,
  children,
  ghost = true,
  style,
}: {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children?: React.ReactNode;
  ghost?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div style={style}>
      {(title || extra) && (
        <Space style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 16 }}>
          <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
          <div>{extra}</div>
        </Space>
      )}
      <Card bordered={!ghost}>{children}</Card>
    </div>
  );
}
