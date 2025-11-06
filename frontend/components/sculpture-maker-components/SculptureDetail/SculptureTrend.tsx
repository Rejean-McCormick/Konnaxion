'use client'

/**
 * Description: Sculpture's trends graph component
 * Author: Hieu Chu
 */

import 'ant-design-pro/lib/Charts/style/index.less'
import {
  ColStyled,
  VisitCard,
  LikeCard,
  CommentCard
} from '../../dashboard-components/'
import { Popover, DatePicker, Button } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

const { RangePicker } = DatePicker

import dayjs from 'dayjs'
import { useState, useEffect, useRef } from 'react'
import Loading from '../../Loading'
import Error from 'next/error'
import api from '../../../api'
import { CardStyled, ShadowCard } from '../../dashboard-components/style'
import { normalizeError } from "../../../shared/errors";

const formatDailyData = rawData => {
  const result = []
  for (const date of Object.keys(rawData)) {
    result.push({
      x: dayjs(date).format('MMM D YYYY'),
      y: rawData[date]
    })
  }
  // sort in correct order
  result.sort((a, b) => dayjs(a.x).valueOf() - dayjs(b.x).valueOf())
  return result
}

const SculptureTrend = ({
  totalLikes,
  totalComments,
  totalVisits,
  sculptureId
}) => {
  const [state, setState] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const defaultEndDate = useRef(dayjs(new Date())).current
  const defaultStartDate = useRef(dayjs(defaultEndDate).subtract(7, 'days'))
    .current

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const past = startDate.format('YYYY-MM-DD')
        const today = endDate.format('YYYY-MM-DD')
        const defaultToday = defaultEndDate.format('YYYY-MM-DD')

        const likesPromise = api.get(
          `/stats/likes/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )
        const commentsPromise = api.get(
          `/stats/comments/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )
        const visitPromise = api.get(
          `/stats/visits/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${today}`
        )

        const defaultLikesPromise = api.get(
          `/stats/likes/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )
        const defaultCommentsPromise = api.get(
          `/stats/comments/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )
        const defaultVisitsPromise = api.get(
          `/stats/visits/sculpture-id/${sculptureId}?fromDate=${past}&toDate=${defaultToday}`
        )

        const [
          { data: rawLikes },
          { data: rawComments },
          { data: rawVisits },
          { data: rawDefaultLikes },
          { data: rawDefaultComments },
          { data: rawDefaultVisits }
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

        const DAILY_VISITS = DEFAULT_VISIT_DATA[DEFAULT_VISIT_DATA.length - 1].y
        const DAILY_VISITS_CHANGE =
          DAILY_VISITS - DEFAULT_VISIT_DATA[DEFAULT_VISIT_DATA.length - 2].y

        const DAILY_LIKES = DEFAULT_LIKE_DATA[DEFAULT_LIKE_DATA.length - 1].y
        const DAILY_LIKES_CHANGE =
          DAILY_LIKES - DEFAULT_LIKE_DATA[DEFAULT_LIKE_DATA.length - 2].y

        const DAILY_COMMENTS =
          DEFAULT_COMMENT_DATA[DEFAULT_COMMENT_DATA.length - 1].y
        const DAILY_COMMENTS_CHANGE =
          DAILY_COMMENTS -
          DEFAULT_COMMENT_DATA[DEFAULT_COMMENT_DATA.length - 2].y

        setState(state => ({
          ...state,
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
        const { message, statusCode } = normalizeError(e);
        const { statusCode, message } = e.response.data
        setError({ statusCode, message })
      }
      setLoading(false)
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

  const renderPicker = (startDate, endDate) => {
    const disabledDate = current => current.valueOf() > staticToday.valueOf()
    return (
      <RangePicker
        defaultValue={[startDate, endDate]}
        value={[startDate, endDate]}
        format={dateFormat}
        size="large"
        allowClear={false}
        separator="-"
        disabledDate={disabledDate}
        ranges={{
          'Past week': [dayjs(staticToday).subtract(7, 'days'), dayjs(staticToday)],
          'Past 2 weeks': [
            dayjs(staticToday).subtract(14, 'days'),
            dayjs(staticToday)
          ],
          'Past month': [
            dayjs(staticToday).subtract(30, 'days'),
            dayjs(staticToday)
          ]
        }}
        onChange={date => {
          if (date[0].valueOf() !== date[1].valueOf()) {
            setStartDate(date[0])
            setEndDate(date[1])
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
            TOTAL_LIKES={TOTAL_LIKES}
            DAILY_LIKES={DAILY_LIKES}
            DAILY_LIKES_CHANGE={DAILY_LIKES_CHANGE}
            LIKE_DATA={LIKE_DATA}
            startDate={startDate}
            endDate={endDate}
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
            startDate={startDate}
            endDate={endDate}
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
            startDate={startDate}
            endDate={endDate}
            SINGLE_SCULPTURE
          />
        </ShadowCard>
      </ColStyled>
    </CardStyled>
  )
}

export default SculptureTrend
