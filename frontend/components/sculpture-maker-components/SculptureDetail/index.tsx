'use client'

/**
 * Description: Sculpture Detail page component
 * Author: Hieu Chu
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Row, Carousel, Typography, List, Empty, Spin } from 'antd'
import { ColStyled, CardStyled } from '../style'
import { SculptureCardDescription } from '../SculptureGrid'
import api from '@/services/_request'
import Error from 'next/error'
import MyStaticMap from '../../map-components/StaticMap'
import Head from 'next/head'
import SculptureComment from './SculptureComment'
import type { SculptureCommentItem } from './SculptureComment'
import SculptureTrend from './SculptureTrend'
import { normalizeError } from '@/shared/errors'

const { Title } = Typography

// --- Types ---
type HttpError = { statusCode: number; message: string }

type Maker = {
  firstName?: string
  lastName?: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
  wikiUrl?: string | null
}

type ImageItem = {
  url: string
  created: string | number | Date
}

type Sculpture = {
  accessionId: string
  name: string
  images: ImageItem[]
  latitude?: number | null
  longitude?: number | null
  productionDate?: string | null
  material?: string | null
  creditLine?: string | null
  locationNotes?: string | null
  totalLikes?: number
  totalComments?: number
  totalVisits?: number
  primaryMaker?: Maker
}

const SculptureDetail = () => {
  const params = useParams<{ id?: string; sculptureId?: string }>()
  const id = (params?.id ?? params?.sculptureId) as string | undefined

  const [sculpture, setSculpture] = useState<Sculpture | null>(null)
  const [comments, setComments] = useState<SculptureCommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HttpError | null>(null)

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const sculpturePromise = api.get<Sculpture>(`/sculpture/${id}`)
        const commentPromise = api.get<SculptureCommentItem[]>(`/comment/sculpture-id/${id}`)
        const [sculptureRes, commentsRes] = await Promise.all([sculpturePromise, commentPromise])

        setSculpture(sculptureRes)
        // Ensure commentId is a string to match SculptureCommentItem
        setComments(Array.isArray(commentsRes) ? commentsRes.map((c) => ({ ...c, commentId: String(c.commentId) })) : [])
      } catch (e: unknown) {
        const { message, statusCode } = normalizeError(e)
        setError({ statusCode: Number(statusCode ?? 500), message })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const deleteComment = (commentId: string | number) => {
    setComments((c) => c.filter((x) => x.commentId !== String(commentId)))
    setSculpture((x) =>
      x
        ? {
            ...x,
            totalComments: Math.max(0, Number(x.totalComments ?? 0) - 1),
          }
        : x,
    )
  }

  const addComment = (comment: SculptureCommentItem) => {
    setComments((c) => [comment, ...c])
    setSculpture((x) =>
      x
        ? {
            ...x,
            totalComments: Number(x.totalComments ?? 0) + 1,
          }
        : x,
    )
  }

  if (loading)
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin />
      </div>
    )
  if (error) return <Error statusCode={error.statusCode} title={error.message} />

  const {
    images = [],
    name = '',
    primaryMaker = {},
    accessionId = '',
    longitude = 0,
    latitude = 0,
    productionDate = '',
    material = '',
    creditLine = '',
    locationNotes = '',
    totalLikes = 0,
    totalComments = 0,
    totalVisits = 0,
  } = (sculpture ?? {}) as Sculpture

  const { birthYear, deathYear, nationality, wikiUrl } = (primaryMaker ?? {}) as Maker

  const markerLat = Number(latitude ?? 0)
  const markerLng = Number(longitude ?? 0)

  const sortedImages = [...images].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
  )
  const imageList = sortedImages.length
    ? sortedImages.map((image, idx) => (
        <div key={idx}>
          <img
            src={image.url}
            style={{ height: 450, width: '100%', objectFit: 'cover' }}
            alt={`sculpture-${idx}`}
          />
        </div>
      ))
    : [
        <div key="empty">
          <Empty description="No Image" />
        </div>,
      ]

  return (
    <>
      <Head>
        <title>{name ? `${name} • Sculpture` : 'Sculpture Detail'}</title>
      </Head>

      <Row gutter={16}>
        {/* Sculpture detail */}
        <ColStyled xs={24} lg={15}>
          <CardStyled>
            <Title level={3} style={{ marginBottom: 8 }}>
              {name}
            </Title>

            <Carousel autoplay>{imageList}</Carousel>

            <div style={{ marginTop: 12 }}>
              <SculptureCardDescription
                totalLikes={totalLikes}
                totalComments={totalComments}
                totalVisits={totalVisits}
                makerName={`${primaryMaker?.firstName ?? ''} ${primaryMaker?.lastName ?? ''}`}
              />

              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    title="Accession ID"
                    description={accessionId && !accessionId.includes('unknown') ? accessionId : 'N/A'}
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta title="Production Date" description={productionDate || 'N/A'} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta title="Material" description={material || 'N/A'} />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Credit Line"
                    description={
                      creditLine
                        ? creditLine
                            .trim()
                            .split('\n')
                            .map((line, idx) => <div key={idx}>{line}</div>)
                        : 'N/A'
                    }
                  />
                </List.Item>
                <List.Item>
                  <List.Item.Meta
                    title="Location Details"
                    description={
                      locationNotes
                        ? locationNotes
                            .trim()
                            .split('\n')
                            .map((line, idx) => <div key={idx}>{line}</div>)
                        : 'N/A'
                    }
                  />
                </List.Item>
              </List>
            </div>
          </CardStyled>

          <SculptureTrend
            totalLikes={totalLikes}
            totalComments={totalComments}
            totalVisits={totalVisits}
            sculptureId={id as string}
          />
        </ColStyled>

        {/* Maker detail */}
        <ColStyled xs={24} lg={9}>
          <MyStaticMap markerLat={markerLat} markerLng={markerLng} />
          <CardStyled title="Primary maker details" style={{ marginTop: 10 }}>
            <List itemLayout="horizontal" style={{ marginTop: -20 }}>
              <List.Item>
                <List.Item.Meta
                  title="Full Name"
                  description={`${primaryMaker?.firstName ?? ''} ${primaryMaker?.lastName ?? ''}`}
                />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Nationality" description={nationality || 'N/A'} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Born" description={birthYear ?? 'N/A'} />
              </List.Item>
              <List.Item>
                <List.Item.Meta title="Passed away" description={deathYear ?? 'N/A'} />
              </List.Item>
              <List.Item>
                <List.Item.Meta
                  title="Website"
                  description={wikiUrl ? <a href={`${wikiUrl}`}>{wikiUrl}</a> : 'N/A'}
                />
              </List.Item>
            </List>
          </CardStyled>

          <SculptureComment
            comments={comments}
            deleteComment={deleteComment}
            addComment={addComment}
            sculptureId={id as string}
          />
        </ColStyled>
      </Row>
    </>
  )
}

export default SculptureDetail
