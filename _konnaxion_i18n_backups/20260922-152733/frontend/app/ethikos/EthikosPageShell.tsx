'use client';

import { Grid, Space, Typography } from 'antd';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import React, { type ReactNode } from 'react';

import usePageTitle from '@/hooks/usePageTitle';

const { Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

export type EthikosPageShellProps = {
  title: string;
  subtitle?: ReactNode;
  /**
   * Browser title. Defaults to:
   * - "ethiKos · {sectionLabel} · {title}" when a section is known
   * - "ethiKos · {title}" otherwise
   */
  metaTitle?: string;
  sectionLabel?: string;
  primaryAction?: ReactNode;
  secondaryActions?: ReactNode;
  children: ReactNode;
  maxWidth?: number | string;
};

function inferSectionLabel(
  pathname: string | null | undefined,
): string | undefined {
  if (!pathname) return undefined;

  const segments = pathname.split('/').filter(Boolean);

  // Konsensus is mounted separately but belongs to ethiKos > Decide.
  if (segments[0] === 'konsensus') return 'Decide';
  if (segments[0] !== 'ethikos') return undefined;

  switch (segments[1]) {
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

/** Central layout wrapper for ethiKos pages. */
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

  usePageTitle(finalMetaTitle);

  const isMobile = !screens.md;

  return (
    <>
      <Head>
        <title>{finalMetaTitle}</title>
      </Head>

      <div className="container mx-auto p-5" style={{ maxWidth }}>
        <div style={{ marginBottom: 24 }}>
          <Space
            direction={isMobile ? 'vertical' : 'horizontal'}
            align={isMobile ? 'start' : 'center'}
            size={isMobile ? 12 : 16}
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <Space direction="vertical" size={4} style={{ flex: 1, minWidth: 0 }}>
              <Title level={2} style={{ margin: 0, fontWeight: 600 }}>
                {title}
              </Title>

              {subtitle ? (
                <Paragraph
                  type="secondary"
                  style={{ margin: 0, maxWidth: 720 }}
                >
                  {subtitle}
                </Paragraph>
              ) : null}
            </Space>

            {hasActions ? (
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
            ) : null}
          </Space>
        </div>

        <div>{children}</div>
      </div>
    </>
  );
}

export default EthikosPageShell;
