// File: /components/layout-components/LogoTitle.tsx
'use client'

import styled from 'styled-components'
import { Dropdown } from 'antd'

/* ------------ styled ------------ */
export const Logo = styled.img`
  display: block;
  height: 32px;
  vertical-align: middle;
`

const Title = styled.span`
  display: inline-block;
  color: var(--ant-color-text);
  font-weight: 600;
  font-size: 20px;
  margin-left: 12px;
  font-family: 'Arial';
  vertical-align: middle;
`

const TitleWrapper = styled.div`
  position: relative;
  height: 64px;
  padding-left: 24px;
  overflow: hidden;
  line-height: 64px;
  transition: background 0.3s ease;
  background: var(--ant-color-bg-container);
`

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

/* ------------ mapping du label par sidebar ------------ */
const titleMapping = {
  ekoh        : 'EkoH',
  ethikos     : 'EthiKos',
  keenkonnect : 'keenKonnect',
  konnected   : 'KonnectED',
  kreative    : 'Kreative',
} as const

interface Props {
  onSidebarChange : (key: string) => void
  selectedSidebar?: string
}

/* ------------ composant ------------ */
export default function LogoTitle({
  onSidebarChange,
  selectedSidebar,
}: Props) {
  const sidebar = selectedSidebar?.toLowerCase() ?? 'ekoh'

  const menuItems = Object.entries(titleMapping).map(([key, label]) => ({
    key, label,
  }))

  return (
    <TitleWrapper>
      <Dropdown
        trigger={['click']}
        menu={{
          items: menuItems,
          onClick: ({ key }) => onSidebarChange(key),
          // **ici on force un fond opaque + ombre**
          style: {
            background: 'var(--ant-color-bg-container)',
            boxShadow: 'var(--ant-box-shadow-secondary)',
          },
        }}
      >
        <LogoContainer>
          <Logo src="/LogoK.svg" alt="Konnaxion logo" />
          <Title>
            {titleMapping[sidebar as keyof typeof titleMapping] ?? 'UOW Sculptures'}
          </Title>
        </LogoContainer>
      </Dropdown>
    </TitleWrapper>
  )
}
