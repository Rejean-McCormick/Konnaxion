'use client'

/**
 * Description: Like statistics card, including total likes and trend graph
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
  TOTAL_LIKES: number
  DAILY_LIKES: number
  DAILY_LIKES_CHANGE: number
  LIKE_DATA: Point[]
}

export default function LikeCard({
  TOTAL_LIKES,
  DAILY_LIKES,
  DAILY_LIKES_CHANGE,
  LIKE_DATA,
}: Props) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MainIcon type="heart" twoToneColor="#eb2f96" />
        <NumberInfoStyled subTitle="Likes" total={TOTAL_LIKES} />
      </div>

      <BarContainer>
        <ChartCard type="area" data={LIKE_DATA} height={90} />
      </BarContainer>

      <CardDivider />

      <CardFooter
        title="Daily likes"
        value={DAILY_LIKES}
        change={DAILY_LIKES_CHANGE}
      />
    </>
  )
}
