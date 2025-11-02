// components/charts/ChartCard.tsx
'use client';
import React from 'react';
import { Line, Area } from '@ant-design/plots';

interface ChartCardProps {
  /** choose a compact chart variant */
  type: 'line' | 'area';
  /** [{ x: …, y: … }] or any fields you map with xField / yField */
  data: { x?: string | number; y: number }[];
  height?: number;
  /* forward any extra Ant Design Plot options */
  [key: string]: any;
}

export default function ChartCard({
  type,
  data,
  height = 60,
  ...rest
}: ChartCardProps) {
  const commonCfg = {
    data,
    height,
    autoFit: true,
    smooth: true,
    xField: 'x',
    yField: 'y',
    ...rest,               // allow overrides
  };

  return type === 'area'
    ? <Area {...commonCfg} />
    : <Line {...commonCfg} />;
}
