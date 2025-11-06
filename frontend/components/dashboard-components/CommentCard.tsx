'use client'

/**
 * Description: Comment statistics card, including total comments and trend graph
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
  TOTAL_COMMENTS: number
  DAILY_COMMENTS: number
  DAILY_COMMENTS_CHANGE: number
  COMMENT_DATA: Point[]
}

export default function CommentCard({
  TOTAL_COMMENTS,
  DAILY_COMMENTS,
  DAILY_COMMENTS_CHANGE,
  COMMENT_DATA,
}: Props) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <MainIcon type="message" twoToneColor="rgb(205, 34, 255)" />
        <NumberInfoStyled subTitle="Comments" total={TOTAL_COMMENTS} />
      </div>

      <BarContainer>
        <ChartCard type="area" data={COMMENT_DATA} height={90} />
      </BarContainer>

      <CardDivider />

      <CardFooter
        title="Daily comments"
        value={DAILY_COMMENTS}
        change={DAILY_COMMENTS_CHANGE}
      />
    </>
  )
}
