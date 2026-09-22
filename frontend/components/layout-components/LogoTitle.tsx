'use client';

import { DownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';

import { useWorld } from '@/context/WorldContext';
import {
  DEFAULT_ENTRY,
  SUITE_GROUPS,
  SUITE_KEYS,
  SUITE_LABELS,
  type SuiteKey,
} from '@/routes/suites';

const TitleWrapper = styled.div<{ $variant: 'sider' | 'header' }>`
  position: relative;
  display: flex;
  align-items: center;
  height: 64px;
  padding-left: ${({ $variant }) => ($variant === 'sider' ? '24px' : '16px')};
  padding-right: 16px;
  gap: 12px;
  overflow: hidden;
  background: var(--ant-color-bg-container);
  transition: background 0.3s ease;
`;

const Logo = styled.img`
  display: block;
  height: 32px;
  width: auto;
`;

const ModuleToggle = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--ant-color-text);
  font-weight: 600;
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: var(--ant-color-fill-secondary);
  }
`;

interface LogoTitleProps {
  onSidebarChange: (key: SuiteKey) => void;
  selectedSidebar?: string | SuiteKey;
  variant?: 'sider' | 'header';
  className?: string;
}

const menuItems: MenuProps['items'] = SUITE_GROUPS.flatMap((group, index) => {
  const groupItems = group.map((key) => ({
    key,
    label: SUITE_LABELS[key],
  }));

  if (index === SUITE_GROUPS.length - 1) return groupItems;
  return [...groupItems, { type: 'divider' as const }];
});

function normalizeSuite(raw: string | SuiteKey | null | undefined): SuiteKey {
  if (!raw) return 'ekoh';

  const normalized = String(raw).toLowerCase();
  if ((SUITE_KEYS as readonly string[]).includes(normalized)) {
    return normalized as SuiteKey;
  }

  return 'ekoh';
}

export default function LogoTitle({
  onSidebarChange,
  selectedSidebar,
  variant = 'sider',
  className,
}: LogoTitleProps) {
  const { href } = useWorld();
  const suite = normalizeSuite(selectedSidebar);
  const label = SUITE_LABELS[suite];
  const homeHref = href(DEFAULT_ENTRY[suite]);

  const handleMenuClick: MenuProps['onClick'] = (info) => {
    const key = String(info.key) as SuiteKey;
    if ((SUITE_KEYS as readonly string[]).includes(key)) {
      onSidebarChange(key);
    }
  };

  return (
    <TitleWrapper $variant={variant} className={className}>
      <Link
        href={{ pathname: homeHref, query: { sidebar: suite } }}
        aria-label={`Go to ${label} home`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
        }}
      >
        <Logo src="/LogoK.svg" alt="Konnaxion logo" />
      </Link>

      <Dropdown
        trigger={['click']}
        menu={{
          items: menuItems,
          onClick: handleMenuClick,
          style: {
            background: 'var(--ant-color-bg-container)',
            boxShadow: 'var(--ant-box-shadow-secondary)',
          },
        }}
      >
        <ModuleToggle type="button" aria-label={`Current space: ${label}`}>
          <span>{label}</span>
          <DownOutlined />
        </ModuleToggle>
      </Dropdown>
    </TitleWrapper>
  );
}
