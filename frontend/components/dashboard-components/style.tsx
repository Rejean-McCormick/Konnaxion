/**
 * Description: Stylesheet for dashboard components
 * Author: Hieu Chu
 */

import React from 'react'
import { Card, Tooltip, Divider, Col } from 'antd'
import { NumberInfo } from 'ant-design-pro'
import styled from 'styled-components'
import {
  InfoCircleOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
} from '@ant-design/icons'
import * as AntIcons from '@ant-design/icons'

/** helper: map legacy Icon `type` strings (e.g. "shopping-cart") to v4 components */
const legacyTypeToIcon = (type?: string) => {
  if (!type) return null
  const pascal =
    type
      .split('-')
      .map(s => s.charAt(0).toUpperCase() + s.slice(1))
      .join('') + 'Outlined'
  // @ts-ignore dynamic lookup
  return (AntIcons as any)[pascal] || null
}

export const CardStyled = (props: any) => {
  const bodyStyle: React.CSSProperties = {
    padding: '20px 24px 8px',
  }
  if (props.type === 'stats') {
    bodyStyle.padding = '20px 16px 16px'
  }
  return <Card bodyStyle={bodyStyle} bordered={false} {...props} />
}

export const NumberInfoStyled = (props: any) => (
  <NumberInfo
    {...props}
    total={<span style={{ fontSize: 30 }}>{props.total.toLocaleString()}</span>}
    style={{ display: 'inline-block' }}
  />
)

export const HelperIcon = (props: any) => (
  <div style={{ marginLeft: 'auto', alignSelf: 'flex-start' }}>
    <Tooltip {...props} placement="topLeft" arrowPointAtCenter={true}>
      <InfoCircleOutlined style={{ verticalAlign: -3, cursor: 'pointer' }} />
    </Tooltip>
  </div>
)

/**
 * Backward compatible MainIcon.
 * Preferred: <MainIcon icon={<YourIcon />} />
 * Legacy support: <MainIcon type="shopping-cart" />
 */
export const MainIcon = (props: any) => {
  const { icon, type, style, ...rest } = props
  const Resolved = icon
    ? icon
    : (() => {
        const Comp = legacyTypeToIcon(type)
        return Comp ? <Comp /> : null
      })()

  return (
    <div style={{ marginRight: 16 }} {...rest}>
      {React.isValidElement(Resolved)
        ? React.cloneElement(Resolved as React.ReactElement, {
            style: { ...(Resolved.props?.style || {}), ...(style || {}), fontSize: 54 },
          })
        : null}
    </div>
  )
}

export const CardFooter = (props: any) => {
  return (
    <div style={{ position: 'relative', zIndex: 99 }}>
      <span>{props.title}:</span>
      <span style={{ marginLeft: 8, color: 'rgba(0,0,0,.85)' }}>
        {props.value.toLocaleString()}
      </span>
      <Tooltip title="Change compared to yesterday">
        <span style={{ marginLeft: 16 }}>
          <span style={{ color: 'rgba(0,0,0,.55)', marginRight: 2 }}>
            {props.change.toLocaleString()}
          </span>

          {/* Up/down icon */}
          {props.change < 0 ? (
            <CaretDownOutlined style={{ color: '#f5222d', verticalAlign: 'text-bottom' }} />
          ) : (
            <CaretUpOutlined style={{ color: '#52c41a', verticalAlign: 'middle' }} />
          )}
        </span>
      </Tooltip>
    </div>
  )
}

export const ColStyled = styled(Col)`
  padding-bottom: 12px;
`

export const CardDivider = styled(Divider)`
  margin-top: 12px;
  margin-bottom: 9px;
`

export const BarContainer = styled.div`
  height: 90px;
  margin-top: 10px;
  margin-bottom: -10px;
`

export const ShadowCard = styled(CardStyled)`
  box-shadow: rgba(0, 0, 0, 0.06) 0px 9px 24px;
  border-width: 1px;
  border-style: solid;
  border-color: rgb(242, 242, 242);
  border-radius: 3px;
  transition: all 150ms ease-in-out 0s;

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 9px 24px;
    cursor: pointer;
    transition: all 150ms ease-in-out 0s;
  }
`
