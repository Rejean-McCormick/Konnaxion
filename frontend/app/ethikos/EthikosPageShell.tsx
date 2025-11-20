// app/ethikos/EthikosPageShell.tsx
'use client';

import React, { type ReactNode } from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { Typography, Space, Tag, Grid } from 'antd';
import usePageTitle from '@/hooks/usePageTitle';

const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

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
   *
   * If omitted, the shell will try to infer it from the current /ethikos/* route.
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
 * Best-effort inference of the Ethikos section label from the current pathname.
 * This lets /ethikos/* pages get a reasonable default section label without
 * having to pass it explicitly from each page component.
 */
function inferSectionLabel(pathname: string | null | undefined): string | undefined {
  if (!pathname) return undefined;

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'ethikos') return undefined;

  const section = segments[1];

  switch (section) {
    case 'decide':
      return 'Decide';
    case 'deliberate':
      return 'Deliberate';
    case 'pulse':
      return 'Pulse';
    case 'trust':
      return 'Trust';
    case 'impact':
      return 'Impact';
    case 'learn':
      return 'Learn';
    case 'admin':
      return 'Admin';
    case 'insights':
      return 'Opinion Analytics';
    default:
      return undefined;
  }
}

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
  const pathname = usePathname();
  const screens = useBreakpoint();

  const inferredSectionLabel = inferSectionLabel(pathname);
  const effectiveSectionLabel = sectionLabel ?? inferredSectionLabel;

  const hasActions = Boolean(primaryAction || secondaryActions);

  const finalMetaTitle =
    metaTitle ??
    (effectiveSectionLabel
      ? `ethiKos · ${effectiveSectionLabel} · ${title}`
      : `ethiKos · ${title}`);

  // Keep browser/tab title in sync with the shell meta title
  usePageTitle(finalMetaTitle);

  const isMobile = !screens.md;

  return (
    <>
      <Head>
        <title>{finalMetaTitle}</title>
      </Head>

      <div className="container mx-auto p-5" style={{ maxWidth }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Space
            direction={isMobile ? 'vertical' : 'horizontal'}
            align={isMobile ? 'start' : 'center'}
            size={isMobile ? 12 : 16}
            style={{ width: '100%', justifyContent: 'space-between', gap: 16 }}
          >
            <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 0 }}>
              {/* Module badge + optional section label */}
              <Space align="center" size={8} wrap>
                <Tag color="purple">ethiKos</Tag>
                {effectiveSectionLabel && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {effectiveSectionLabel}
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

            {hasActions && (
              <Space
                align="start"
                size="middle"
                wrap
                style={{
                  justifyContent: isMobile ? 'flex-start' : 'flex-end',
                  marginLeft: isMobile ? 0 : 'auto',
                  minWidth: isMobile ? 'auto' : 0,
                }}
              >
                {secondaryActions}
                {primaryAction}
              </Space>
            )}
          </Space>
        </div>

        {/* Main content */}
        <div>{children}</div>
      </div>
    </>
  );
}

export default EthikosPageShell;
