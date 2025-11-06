'use client'

/**
 * Description: Component for Recent activity page
 * Author: Hieu Chu
 */

import { useState, useEffect } from 'react'
import { Row } from 'antd'
import { ColStyled } from './style'
import api from '@/services/_request'
import Loading from '../Loading'
import NextError from 'next/error'
import Head from 'next/head'
import RecentComments from './RecentComments'
import RecentVisits from './RecentVisits'
import RecentLikes from './RecentLikes'
import { normalizeError } from '../../shared/errors'

type ErrorShape = { statusCode?: number; message: string }

// Minimal item shapes to avoid implicit any
type CommentItem = { commentId: string | number } & Record<string, unknown>
type VisitItem = Record<string, unknown>
type LikeItem = Record<string, unknown>

const RecentActivity = () => {
  const [comments, setComments] = useState<CommentItem[]>([])
  const [visits, setVisits] = useState<VisitItem[]>([])
  const [likes, setLikes] = useState<LikeItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // FIX: explicit union type instead of plain null
  const [error, setError] = useState<ErrorShape | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [rawComments, rawVisits, rawLikes] = await Promise.all([
          api.get('/comment'),
          api.get('/visit'),
          api.get('/like'),
        ])

        if (!mounted) return
        setComments((rawComments?.data as CommentItem[]) ?? [])
        setVisits((rawVisits?.data as VisitItem[]) ?? [])
        setLikes((rawLikes?.data as LikeItem[]) ?? [])
      } catch (e: unknown) {
        if (!mounted) return
        // FIX: normalize unknown error; remove direct e.response access
        const { message, statusCode } = normalizeError(e)
        setError({ statusCode, message })
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchData()
    return () => {
      mounted = false
    }
  }, [])

  const deleteComment = (commentId: string | number) => {
    setComments((c) => c.filter((x) => x.commentId !== commentId))
  }

  if (loading) return <Loading />
  if (error) return <NextError statusCode={error.statusCode ?? 500} title={error.message} />

  return (
    <>
      <Head>
        <title>Recent Activity - UOW Sculptures</title>
      </Head>

      <Row gutter={16}>
        <ColStyled xs={24} lg={12}>
          <RecentComments comments={comments} deleteComment={deleteComment} />
          <RecentVisits visits={visits} />
        </ColStyled>

        <ColStyled xs={24} lg={12}>
          <RecentLikes likes={likes} />
        </ColStyled>
      </Row>
    </>
  )
}

export default RecentActivity
