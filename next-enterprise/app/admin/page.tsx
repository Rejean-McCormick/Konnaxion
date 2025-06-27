// File: app/admin/page.tsx
'use client'

import { Col, Row } from 'antd'
import React from 'react'
import { ModerationQueue, UserStats } from '@/admin/components'

export default function AdminPage() {
  return (
    <Row gutter={16}>
      <Col span={12}><UserStats /></Col>
      <Col span={12}><ModerationQueue /></Col>
    </Row>
  )
}
