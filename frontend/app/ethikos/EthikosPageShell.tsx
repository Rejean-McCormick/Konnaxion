// app/ethikos/EthikosPageShell.tsx
'use client';

import React, { ReactNode } from 'react';
import { Typography, Space } from 'antd';

const { Title, Paragraph } = Typography;

export type EthikosPageShellProps = {
  /** Main page title (big, H1-equivalent) */
  title: string;
  /** Optional subtitle / helper text under the title */
  subtitle?: ReactNode;
  /** Main CTA on the right (e.g. primary button) */
  primaryAction?: ReactNode;
  /** Secondary actions on the right (e.g. ghost buttons, filters) */
  secondaryActions?: ReactNode;
  /** Main page content */
  children: ReactNode;
};

/**
 * Central layout wrapper for Ethikos pages.
 *
 * Usage rules:
 * - No extra big <h1> / Title outside of this shell in your pages.
 * - No breadcrumb here (rely on the global layout / shell).
 * - All Ethikos pages should use this for consistent padding & header.
 */
export default function EthikosPageShell({
  title,
  subtitle,
  primaryAction,
  secondaryActions,
  children,
}: EthikosPageShellProps): JSX.Element {
  const hasActions = Boolean(primaryAction || secondaryActions);

  return (
    <div className="container mx-auto p-5">
      {/* Header: title + subtitle + actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Title level={2} className="!mb-1">
            {title}
          </Title>
          {subtitle && (
            <Paragraph type="secondary" className="!mb-0">
              {subtitle}
            </Paragraph>
          )}
        </div>

        {hasActions && (
          <Space wrap>
            {secondaryActions}
            {primaryAction}
          </Space>
        )}
      </div>

      {/* Main content */}
      {children}
    </div>
  );
}
