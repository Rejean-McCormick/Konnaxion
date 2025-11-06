'use client'

/**
 * Description: User statistics card, including total users and trend graph
 * Author: Hieu Chu
 */

import React from 'react'
import ChartCard from '@/components/charts/ChartCard'
import {
  MainIcon,
  CardDivider,
  NumberInfoStyled,
  CardFooter,
  BarContainer,
} from './style'

type Point = { x: string | number; y: number }

interface Props {
  TOTAL_USERS: number
  DAILY_USERS: number
  DAILY_USERS_CHANGE: number
  USER_DATA: Point[]
}

export default function UserCard({
  TOTAL_USERS,
  DAILY_USERS,
  DAILY_USERS_CHANGE,
  USER_DATA,
}: Props) {
  return (
    <>
      <div style={{ display: 'flex' }}>
        <MainIcon type="team" style={{ color: 'rgb(24, 144, 255)' }} />
        <NumberInfoStyled subTitle="Total users" total={TOTAL_USERS} />
      </div>

      <BarContainer>
        <ChartCard type="area" data={USER_DATA} height={90} />
      </BarContainer>

      <CardDivider />

      <CardFooter
        title="Daily users"
        value={DAILY_USERS}
        change={DAILY_USERS_CHANGE}
      />
    </>
  )
}
