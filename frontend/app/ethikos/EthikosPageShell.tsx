// app/ethikos/EthikosPageShell.tsx
'use client';

import React, { type ReactNode } from 'react';
import Head from 'next/head';
import { Typography, Space, Tag } from 'antd';
import usePageTitle from '@/hooks/usePageTitle';

const { Title, Paragraph, Text } = Typography;

export type EthikosPageShellProps = {
  /** Main page title (H1-equivalent) */
  title: string;
  /** Optional subtitle / helper text under the title */
  subtitle?: ReactNode;
  /**
   * Optional browser <title>.
   * If omitted, the shell generates:
   *  - "ethiKos · {sectionLabel} · {title}" when sectionLabel is set
   *  - "ethiKos · {title}" otherwise
   */
  metaTitle?: string;
  /**
   * Optional section label for the header row
   * Examples: "Debate Hub", "Consultation Hub", "Opinion Analytics",
   *           "Decide", "Deliberate", "Pulse", "Trust", "Impact", "Admin", "Learn"
   */
  sectionLabel?: string;
  /** Main CTA on the right (e.g. primary button) */
  primaryAction?: ReactNode;
  /** Secondary actions on the right (e.g. ghost buttons, filters) */
  secondaryActions?: ReactNode;
  /** Main page content */
  children: ReactNode;
  /** Max width for the central content container (like KeenPageShell) */
  maxWidth?: number | string;
};

/**
 * Central layout wrapper for ethiKos pages.
 *
 * Usage rules:
 * - All Ethikos suite screens (Decide, Deliberate, Pulse, Trust, Impact, Learn, Admin, Insights)
 *   should use this shell for consistent padding, heading and browser <title>.
 * - No extra big <h1> / Title outside of this shell in your pages.
 * - Do not repeat the "ethiKos" module branding in each page; the shell already handles it.
 */
function EthikosPageShell({
  title,
  subtitle,
  metaTitle,
  sectionLabel,
  primaryAction,
  secondaryActions,
  children,
  maxWidth = 1200,
}: EthikosPageShellProps): JSX.Element {
  const hasActions = Boolean(primaryAction || secondaryActions);

  const finalMetaTitle =
    metaTitle ??
    (sectionLabel
      ? `ethiKos · ${sectionLabel} · ${title}`
      : `ethiKos · ${title}`);

  // Keep browser/tab title in sync with the shell meta title
  usePageTitle(finalMetaTitle);

  return (
    <>
      <Head>
        <title>{finalMetaTitle}</title>
      </Head>

      <div className="container mx-auto p-5" style={{ maxWidth }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 24,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div>
            <Space direction="vertical" size={4}>
              {/* Module badge + optional section label */}
              <Space align="center" size={8}>
                <Tag color="purple">ethiKos</Tag>
                {sectionLabel && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {sectionLabel}
                  </Text>
                )}
              </Space>

              <Title
                level={2}
                style={{
                  margin: 0,
                  fontWeight: 600,
                }}
              >
                {title}
              </Title>

              {subtitle && (
                <Paragraph
                  type="secondary"
                  style={{
                    margin: 0,
                    maxWidth: 720,
                  }}
                >
                  {subtitle}
                </Paragraph>
              )}
            </Space>
          </div>

          {hasActions && (
            <div style={{ marginLeft: 'auto' }}>
              <Space align="start" size="middle">
                {secondaryActions}
                {primaryAction}
              </Space>
            </div>
          )}
        </div>

        {/* Main content */}
        <div>{children}</div>
      </div>
    </>
  );
}

export default EthikosPageShell;
