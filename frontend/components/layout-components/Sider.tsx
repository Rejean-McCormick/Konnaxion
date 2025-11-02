'use client'

import { Layout } from 'antd'
import styled     from 'styled-components'

const { Sider } = Layout

/* Sider fixe alimenté par les variables Ant Design */
const FixedSider = styled(Sider)`
  background : var(--ant-color-bg-container) !important;
  overflow   : auto;
  height     : 100vh;
  position   : fixed;
  left       : 0;
  box-shadow : var(--ant-box-shadow-secondary, 2px 0 6px rgba(0, 21, 41, .35));
  transition : background 0.3s ease;

  @media (max-width: 575.98px) {
    display: none;
  }
`

interface Props {
  collapsed    : boolean
  setCollapsed : (c: boolean) => void
  children     : React.ReactNode
}

export default function SiderWrapper({
  collapsed,
  setCollapsed,
  children,
}: Props) {
  return (
    <FixedSider
      trigger={null}
      width={256}
      collapsible
      collapsed={collapsed}
      breakpoint="lg"
      onBreakpoint={setCollapsed}
    >
      {children}
    </FixedSider>
  )
}
