// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\SculptureGrid.tsx
'use client'

/**
 * Sculpture list
 */

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Row, Card, Typography, Tooltip, Input, Empty, Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import {
  PlusOutlined,
  SortAscendingOutlined,
  DownOutlined,
  HeartTwoTone,
  MessageTwoTone,
  EnvironmentOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { ColStyled, CardStyled, ShadowCard, Subtitle, EmptyImage } from './style'
import Loading from '@/components/Loading' // corrigé: anciennement './Loading'
import NextError from 'next/error'
import { get } from '@/services/_request'
import { normalizeError } from '@/shared/errors'

const { Text } = Typography
const { Meta } = Card
const { Search } = Input

type SortCriterion = 'Default' | 'Likes' | 'Comments' | 'Visits'

type Maker = { firstName: string; lastName: string }
type ImageItem = { url: string; created: string | number | Date }
type Sculpture = {
  accessionId: string
  name: string
  totalVisits: number
  totalLikes: number
  totalComments: number
  primaryMaker: Maker
  images: ImageItem[]
}
type ErrorState = { statusCode: number; message: string }

const NO_IMAGE_PLACEHOLDER = '/static/no-image.png'

/**
 * Sanitize d’URL d’image:
 * - autorise http/https et les chemins relatifs (ex: /static/…)
 * - optionnel: allowlist d’hôtes via NEXT_PUBLIC_IMG_HOSTS=host1,host2
 * - fallback vers NO_IMAGE_PLACEHOLDER pour tout le reste
 */
function safeImageUrl(raw?: string): string {
  try {
    if (!raw) return NO_IMAGE_PLACEHOLDER
    if (raw.startsWith('/')) return raw
    const u = new URL(raw)
    if (!['http:', 'https:'].includes(u.protocol)) return NO_IMAGE_PLACEHOLDER

    const allow = (process.env.NEXT_PUBLIC_IMG_HOSTS ?? '')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)

    if (allow.length && !allow.includes(u.hostname)) return NO_IMAGE_PLACEHOLDER
    return u.toString()
  } catch {
    return NO_IMAGE_PLACEHOLDER
  }
}

const SculptureCard = ({ info }: { info: Sculpture }) => {
  const { accessionId, name, totalVisits, totalLikes, totalComments, primaryMaker, images } = info
  const makerName = `${primaryMaker.firstName} ${primaryMaker.lastName}`

  // Tri ancien → récent et sélection robuste de la première image
  const sortedImages: ImageItem[] = [...(images ?? [])].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime(),
  )

  const firstImage = sortedImages[0]
  const cover = firstImage ? (
    <div style={{ height: 450 }}>
      <img
        src={safeImageUrl(firstImage.url)}
        style={{ height: '100%', width: '100%', objectFit: 'cover' }}
        alt={name}
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget
          if (img.src !== NO_IMAGE_PLACEHOLDER) img.src = NO_IMAGE_PLACEHOLDER
        }}
      />
    </div>
  ) : (
    // Pas d’image: UI claire + pas d’accès non sûr à images[0]
    <EmptyImage image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Images" />
  )

  return (
    <Link href={`/sculptures/id/${accessionId}`}>
      <a style={{ display: 'inline-block', width: '100%' }}>
        <ShadowCard cover={cover} bordered>
          <Meta
            title={name}
            description={
              <SculptureCardDescription
                totalLikes={totalLikes}
                totalComments={totalComments}
                totalVisits={totalVisits}
                makerName={makerName}
              />
            }
          />
        </ShadowCard>
      </a>
    </Link>
  )
}

export const SculptureCardDescription = ({
  totalLikes,
  totalComments,
  totalVisits,
  makerName,
}: {
  totalLikes: number
  totalComments: number
  totalVisits: number
  makerName: string
}) => {
  return (
    <>
      <Subtitle type="secondary">{makerName}</Subtitle>

      <Tooltip placement="top" title="Likes">
        <HeartTwoTone twoToneColor="#eb2f96" style={{ marginRight: 4 }} />
        <Text type="secondary" style={{ marginRight: 8 }}>
          {totalLikes}
        </Text>
      </Tooltip>

      <Tooltip placement="top" title="Comments">
        <MessageTwoTone twoToneColor="rgb(205, 34, 255)" style={{ marginRight: 4 }} />
        <Text type="secondary" style={{ marginRight: 5 }}>
          {totalComments}
        </Text>
      </Tooltip>

      <Tooltip placement="top" title="Visits">
        <EnvironmentOutlined style={{ color: '#F73F3F', marginRight: 3 }} />
        <Text type="secondary" style={{ marginRight: 4 }}>
          {totalVisits}
        </Text>
      </Tooltip>
    </>
  )
}

const sortBy = (list: Sculpture[], criterion: SortCriterion) => {
  const copy = list.slice()
  switch (criterion) {
    case 'Likes':
      return copy.sort((a, b) => +b.totalLikes - +a.totalLikes)
    case 'Comments':
      return copy.sort((a, b) => +b.totalComments - +a.totalComments)
    case 'Visits':
      return copy.sort((a, b) => +b.totalVisits - +a.totalVisits)
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name))
  }
}

const SculptureGrid = () => {
  const [originalList, setOriginalList] = useState<Sculpture[]>([])
  const [filteredList, setFilteredList] = useState<Sculpture[]>([])
  const [currentSort, setCurrentSort] = useState<SortCriterion>('Default')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ErrorState | null>(null)

  useEffect(() => {
    const fetchList = async () => {
      try {
        const data = await get<Sculpture[]>('/sculpture')
        setOriginalList(data)
        setFilteredList(sortBy(data, 'Default'))
      } catch (e) {
        const { message, statusCode = 500 } = normalizeError(e)
        setError({ statusCode, message })
      } finally {
        setLoading(false)
      }
    }
    fetchList()
  }, [])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const key = e.key as SortCriterion
    setCurrentSort(key)
    setFilteredList(sortBy(filteredList, key))
  }

  const menuItems: MenuProps['items'] = [
    { key: 'Default', label: 'Default' },
    { key: 'Likes', label: 'Likes' },
    { key: 'Comments', label: 'Comments' },
    { key: 'Visits', label: 'Visits' },
  ]

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    if (input.length >= 3) {
      const lower = input.toLowerCase()
      const newList = originalList.filter((s) => {
        const makerName = `${s.primaryMaker.firstName} ${s.primaryMaker.lastName}`
        return s.name.toLowerCase().includes(lower) || makerName.toLowerCase().includes(lower)
      })
      setFilteredList(sortBy(newList, currentSort))
    } else if (filteredList.length !== originalList.length) {
      setFilteredList(sortBy(originalList.slice(), currentSort))
    }
  }

  if (loading) return <Loading />
  if (error) return <NextError statusCode={error.statusCode} title={error.message} />

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled
          title="Sculpture Collection"
          extra={
            <Link href="/sculptures/create">
              <a>
                <Button type="primary" icon={<PlusOutlined />}>
                  Add new sculpture
                </Button>
              </a>
            </Link>
          }
        >
          <div style={{ marginLeft: 8, marginRight: 8, marginBottom: 16, display: 'flex' }}>
            <Search
              allowClear
              placeholder="Enter search term"
              onChange={handleChange}
              size="large"
              style={{ marginRight: 8 }}
            />
            <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
              <Button size="large">
                <SortAscendingOutlined /> {currentSort} <DownOutlined />
              </Button>
            </Dropdown>
          </div>

          {!filteredList.length ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Data :(" style={{ marginTop: 60 }} />
          ) : (
            filteredList.map((sculpture) => (
              <ColStyled xs={24} sm={12} md={8} key={sculpture.accessionId}>
                <SculptureCard info={sculpture} />
              </ColStyled>
            ))
          )}
        </CardStyled>
      </ColStyled>
    </Row>
  )
}

export default SculptureGrid
