'use client'

/**
 * Description: Sculpture's trends graph component
 * Author: Hieu Chu
 */

import {
  ColStyled,
  VisitCard,
  LikeCard,
  CommentCard
} from '../../dashboard-components/'
import { Popover, DatePicker, Button } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

import dayjs, { Dayjs } from 'dayjs'
import React, { useState, useEffect, useRef } from 'react'
import Loading from '../../Loading'
import Error from 'next/error'
import type { AxiosError } from 'axios'
import api from '../../../api'
import { CardStyled, ShadowCard } from '../../dashboard-components/style'
import { normalizeError } from '../../../shared/errors'

type DailyPoint = { x: string; y: number }

interface TrendState {
  TOTAL_VISITS: number
  DAILY_VISITS: number
  DAILY_VISITS_CHANGE: number
  TOTAL_LIKES: number
  DAILY_LIKES: number
  DAILY_LIKES_CHANGE: number
  TOTAL_COMMENTS: number
  DAILY_COMMENTS: number
  DAILY_COMMENTS_CHANGE: number
  VISIT_DATA: DailyPoint[]
  LIKE_DATA: DailyPoint[]
  COMMENT_DATA: DailyPoint[]
}

interface SculptureTrendProps {
  totalLikes: number
  totalComments: number
  totalVisits: number
  sculptureId: string
}

interface RequestError {
  statusCode: number
  message: string
}

const formatDailyData = (rawData: Record<string, number>): DailyPoint[] => {
  const result: DailyPoint[] = []
  for (const date of Object.keys(rawData)) {
    result.push({
      x: dayjs(date).format('MMM D YYYY'),
      y: Number(rawData[date] ?? 0),
    })
  }
  // sort in correct order
  result.sort((a, b) => dayjs(a.x).valueOf() - dayjs(b.x).valueOf())
  return result
}

const SculptureTrend: React.FC<SculptureTrendProps> = ({
  totalLikes,
  totalComments,
  totalVisits,
  sculptureId
}) => {
  const [state, setState] = useState<TrendState>({
    TOTAL_VISITS: 0,
    DAILY_VISITS: 0,
    DAILY_VISITS_CHANGE: 0,
    TOTAL_LIKES: 0,
    DAILY_LIKES: 0,
    DAILY_LIKES_CHANGE: 0,
    TOTAL_COMMENTS: 0,
    DAILY_COMMENTS: 0,
    DAILY_COMMENTS_CHANGE: 0,
    VISIT_DATA: [],
    LIKE_DATA: [],
    COMMENT_DATA: []
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<RequestError | null>(null)

  const defaultEndDate = useRef<Dayjs>(dayjs(new Date())).current
  const defaultStartDate = useRef<Dayjs>(dayjs(defaultEndDate).subtract(7, 'days')).current

  const [startDate, setStartDate] = useState<Dayjs>(defaultStartDate)
  const [endDate, setEndDate] = useState<Dayjs>(defaultEndDate)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const past = startDate.format('YYYY-MM-DD')
        const today = endDate.format('YYYY-MM-DD')
        const defaultToday = defaultEndDate.format('YYYY-MM-DD')

        const likesPromise = api.get<Record<string, number>>(
          `/stats/likes/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )
        const commentsPromise = api.get<Record<string, number>>(
          `/stats/comments/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )
        const visitPromise = api.get<Record<string, number>>(
          `/stats/visits/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )

        const defaultLikesPromise = api.get<Record<string, number>>(
          `/stats/likes/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )
        const defaultCommentsPromise = api.get<Record<string, number>>(
          `/stats/comments/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )
        const defaultVisitsPromise = api.get<Record<string, number>>(
          `/stats/visits/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )

        const [
          rawLikes,
          rawComments,
          rawVisits,
          rawDefaultLikes,
          rawDefaultComments,
          rawDefaultVisits
        ] = await Promise.all([
          likesPromise,
          commentsPromise,
          visitPromise,
          defaultLikesPromise,
          defaultCommentsPromise,
          defaultVisitsPromise
        ])

        // format daily data statistics
        const LIKE_DATA = formatDailyData(rawLikes)
        const COMMENT_DATA = formatDailyData(rawComments)
        const VISIT_DATA = formatDailyData(rawVisits)

        const DEFAULT_LIKE_DATA = formatDailyData(rawDefaultLikes)
        const DEFAULT_COMMENT_DATA = formatDailyData(rawDefaultComments)
        const DEFAULT_VISIT_DATA = formatDailyData(rawDefaultVisits)

        const lastVisit = DEFAULT_VISIT_DATA.at(-1)?.y ?? 0
        const prevVisit = DEFAULT_VISIT_DATA.at(-2)?.y ?? 0
        const DAILY_VISITS = lastVisit
        const DAILY_VISITS_CHANGE = lastVisit - prevVisit

        const lastLike = DEFAULT_LIKE_DATA.at(-1)?.y ?? 0
        const prevLike = DEFAULT_LIKE_DATA.at(-2)?.y ?? 0
        const DAILY_LIKES = lastLike
        const DAILY_LIKES_CHANGE = lastLike - prevLike

        const lastComment = DEFAULT_COMMENT_DATA.at(-1)?.y ?? 0
        const prevComment = DEFAULT_COMMENT_DATA.at(-2)?.y ?? 0
        const DAILY_COMMENTS = lastComment
        const DAILY_COMMENTS_CHANGE = lastComment - prevComment

        setState(s => ({
          ...s,
          TOTAL_VISITS: totalVisits,
          DAILY_VISITS,
          DAILY_VISITS_CHANGE,
          TOTAL_LIKES: totalLikes,
          DAILY_LIKES,
          DAILY_LIKES_CHANGE,
          TOTAL_COMMENTS: totalComments,
          DAILY_COMMENTS,
          DAILY_COMMENTS_CHANGE,
          VISIT_DATA,
          LIKE_DATA,
          COMMENT_DATA
        }))
      } catch (e: unknown) {
        const n = normalizeError(e as AxiosError<any>)
        setError({ statusCode: n.statusCode ?? 500, message: n.message || 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [
    defaultEndDate,
    endDate,
    sculptureId,
    startDate,
    totalComments,
    totalLikes,
    totalVisits
  ])

  const dateFormat = 'MMM D YYYY'
  const staticToday = dayjs(new Date())

  const renderPicker = (start: Dayjs, end: Dayjs) => {
    const disabledDate = (current: Dayjs) => current.valueOf() > staticToday.valueOf()
    return (
      <RangePicker
        defaultValue={[start, end]}
        value={[start, end]}
        format={dateFormat}
        size="large"
        allowClear={false}
        separator="-"
        disabledDate={disabledDate}
        ranges={{
          'Past week': [dayjs(staticToday).subtract(7, 'days'), dayjs(staticToday)],
          'Past 2 weeks': [dayjs(staticToday).subtract(14, 'days'), dayjs(staticToday)],
          'Past month': [dayjs(staticToday).subtract(30, 'days'), dayjs(staticToday)]
        }}
        onChange={(dates) => {
          if (!dates || !dates[0] || !dates[1]) return
          if (dates[0].valueOf() !== dates[1].valueOf()) {
            setStartDate(dates[0])
            setEndDate(dates[1])
          }
        }}
      />
    )
  }

  const {
    TOTAL_VISITS,
    DAILY_VISITS,
    DAILY_VISITS_CHANGE,
    TOTAL_LIKES,
    DAILY_LIKES,
    DAILY_LIKES_CHANGE,
    TOTAL_COMMENTS,
    DAILY_COMMENTS,
    DAILY_COMMENTS_CHANGE,
    VISIT_DATA,
    LIKE_DATA,
    COMMENT_DATA
  } = state

  if (loading) return <Loading />
  if (error) return <Error statusCode={error.statusCode} title={error.message} />

  return (
    <CardStyled
      title="Trends"
      extra={
        <Popover content={renderPicker(startDate, endDate)} trigger="click" placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} />
        </Popover>
      }
      type="stats"
      style={{ marginTop: 12 }}
    >
      <ColStyled xs={24}>
        <ShadowCard>
          <LikeCard
            total={TOTAL_LIKES}
            trend={LIKE_DATA.map(p => p.y)}
          />
        </ShadowCard>
      </ColStyled>

      <ColStyled xs={24}>
        <ShadowCard>
          <CommentCard
            TOTAL_COMMENTS={TOTAL_COMMENTS}
            DAILY_COMMENTS={DAILY_COMMENTS}
            DAILY_COMMENTS_CHANGE={DAILY_COMMENTS_CHANGE}
            COMMENT_DATA={COMMENT_DATA}
          />
        </ShadowCard>
      </ColStyled>

      <ColStyled xs={24}>
        <ShadowCard>
          <VisitCard
            TOTAL_VISITS={TOTAL_VISITS}
            DAILY_VISITS={DAILY_VISITS}
            DAILY_VISITS_CHANGE={DAILY_VISITS_CHANGE}
            VISIT_DATA={VISIT_DATA}
            SINGLE_SCULPTURE
          />
        </ShadowCard>
      </ColStyled>
    </CardStyled>
  )
}

export default SculptureTrend
