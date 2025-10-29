'use client'

import React from 'react'
import { Drawer } from 'antd'
import styled from 'styled-components'

/* ------------------------------------------------------------------ */
/*  Drawer stylé : suit les variables CSS du thème et bloque le scroll */
/* ------------------------------------------------------------------ */
const StyledDrawer = styled(Drawer)`
  .ant-drawer-wrapper-body {
    overflow: hidden !important;
  }

  .ant-drawer-content {
    background: var(--ant-color-bg-container) !important;
    color: var(--ant-color-text);
  }
`

interface Props {
  drawerVisible: boolean
  closeDrawer : () => void
  children    : React.ReactNode
}

export default function LayoutDrawer({
  drawerVisible,
  closeDrawer,
  children,
}: Props) {
  return (
    <StyledDrawer
      placement="left"
      closable={false}
      onClose={closeDrawer}
      open={drawerVisible}
        styles={{
			body: {
			margin: 0,
			padding: 0,
			background: 'var(--ant-color-bg-container)',
		},
      }}
    >
      {children}
    </StyledDrawer>
  )
}
