'use client'

import { Layout } from 'antd'
import styled, { css } from 'styled-components'

const StyledMain = styled(
  ({ collapsed: _c, ...rest }) => <Layout {...rest} />,
)<{ collapsed: boolean }>`
  transition: 0.2s all;

  /* décalage = largeur réelle du sider (ouvert) */
  margin-left: var(--ant-layout-sider-width);

  background: var(--ant-layout-color-bg-layout);

  /* décalage quand le sider est réduit */
  ${({ collapsed }) =>
    collapsed &&
    css`
      margin-left: var(--ant-layout-sider-collapsed-width);
    `}

  @media (max-width: 575.98px) {
    margin-left: 0;
  }
`

export default function Main({
  children,
  collapsed,
}: {
  children: React.ReactNode
  collapsed: boolean
}) {
  return <StyledMain collapsed={collapsed}>{children}</StyledMain>
}
