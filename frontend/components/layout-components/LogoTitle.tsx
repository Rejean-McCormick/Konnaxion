// FILE: frontend/components/layout-components/LogoTitle.tsx
// C:\MyCode\Konnaxionv14\frontend\components\layout-components\LogoTitle.tsx
'use client'

import styled from 'styled-components'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import Link from 'next/link'
import { DownOutlined } from '@ant-design/icons'

/* ------------ module keys & mappings ------------ */

const SUITE_KEYS = ['ekoh', 'ethikos', 'keenkonnect', 'konnected', 'kreative'] as const
type SuiteKey = (typeof SUITE_KEYS)[number]

const TITLE_BY_SUITE: Record<SuiteKey, string> = {
  ekoh       : 'EkoH',
  ethikos    : 'EthiKos',
  keenkonnect: 'keenKonnect',
  konnected  : 'KonnectED',
  kreative   : 'Kreative',
}

const DEFAULT_ENTRY: Record<SuiteKey, string> = {
  ekoh       : '/ekoh/dashboard',
  ethikos    : '/ethikos/pulse/overview',
  keenkonnect: '/keenkonnect/dashboard',
  konnected  : '/konnected/dashboard',
  kreative   : '/kreative/dashboard',
}

/* ------------ styled ------------ */

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
`

const Logo = styled.img`
  display: block;
  height: 32px;
  width: auto;
`

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
`

/* ------------ types ------------ */

interface LogoTitleProps {
  /** Callback when the user selects another module from the dropdown */
  onSidebarChange: (key: SuiteKey) => void
  /** Current active module key (e.g. "ekoh", "ethikos", …) */
  selectedSidebar?: string | SuiteKey
  /** Visual variant for use in the top header vs. the sider */
  variant?: 'sider' | 'header'
  /** Optional passthrough className for external styling */
  className?: string
}

/* ------------ helpers ------------ */

const menuItems: MenuProps['items'] = SUITE_KEYS.map(key => ({
  key,
  label: TITLE_BY_SUITE[key],
}))

function normalizeSuite(raw: string | SuiteKey | null | undefined): SuiteKey {
  if (!raw) return 'ekoh'
  const lower = String(raw).toLowerCase()
  if ((SUITE_KEYS as readonly string[]).includes(lower as SuiteKey)) {
    return lower as SuiteKey
  }
  return 'ekoh'
}

/* ------------ component ------------ */

export default function LogoTitle({
  onSidebarChange,
  selectedSidebar,
  variant = 'sider',
  className,
}: LogoTitleProps) {
  const suite = normalizeSuite(selectedSidebar)
  const label = TITLE_BY_SUITE[suite]
  const homeHref = DEFAULT_ENTRY[suite]

  const handleMenuClick: MenuProps['onClick'] = info => {
    const key = String(info.key) as SuiteKey
    if ((SUITE_KEYS as readonly string[]).includes(key)) {
      onSidebarChange(key)
    }
  }

  return (
    <TitleWrapper $variant={variant} className={className}>
      {/* Brand logo → navigates to the current module dashboard */}
      <Link
        href={{ pathname: homeHref, query: { sidebar: suite } }}
        aria-label="Go to module dashboard"
        style={{
          display        : 'inline-flex',
          alignItems     : 'center',
          textDecoration : 'none',
        }}
      >
        <Logo src="/LogoK.svg" alt="Konnaxion logo" />
      </Link>

      {/* Module switcher dropdown (EkoH, ethiKos, keenKonnect, …) */}
      <Dropdown
        trigger={['click']}
        menu={{
          items : menuItems,
          onClick: handleMenuClick,
          style : {
            background: 'var(--ant-color-bg-container)',
            boxShadow : 'var(--ant-box-shadow-secondary)',
          },
        }}
      >
        <ModuleToggle type="button">
          <span>{label ?? 'Konnaxion'}</span>
          <DownOutlined />
        </ModuleToggle>
      </Dropdown>
    </TitleWrapper>
  )
}
