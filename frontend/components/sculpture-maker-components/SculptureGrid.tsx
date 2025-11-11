'use client'

/**
 * Description: Sculpture list component
 * Author: Hieu Chu
 */

import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Row,
  Card,
  Typography,
  Tooltip,
  Input,
  Empty,
  Button,
  Dropdown,
} from 'antd'
import type { MenuProps } from 'antd'
import {
  PlusOutlined,
  SortAscendingOutlined,
  DownOutlined,
  HeartTwoTone,
  MessageTwoTone,
  EnvironmentOutlined,
} from '@ant-design/icons'
const { Text } = Typography
const { Meta } = Card
const { Search } = Input
import Link from 'next/link'
import {
  ColStyled,
  CardStyled,
  ShadowCard,
  Subtitle,
  EmptyImage,
} from './style'
import Loading from '../Loading'
import Error from 'next/error'
import api from '@/services/_request'
import { normalizeError } from '../../shared/errors'

// --- Types locaux ---
type SortCriterion = 'Default' | 'Likes' | 'Comments' | 'Visits'

interface Maker {
  firstName: string
  lastName: string
}
interface ImageItem {
  url: string
  created: string | number | Date
}
interface Sculpture {
  accessionId: string
  name: string
  totalVisits: number
  totalLikes: number
  totalComments: number
  primaryMaker: Maker
  images: ImageItem[]
}
interface ErrorState {
  statusCode: number
  message: string
}

// --- Composants ---
const SculptureCard = ({ info }: { info: Sculpture }) => {
  const { accessionId, name, totalVisits, totalLikes, totalComments, primaryMaker, images } = info
  const makerName = `${primaryMaker.firstName} ${primaryMaker.lastName}`
  const sortedImages = [...images].sort(
    (a: ImageItem, b: ImageItem) =>
      new Date(a.created).getTime() - new Date(b.created).getTime(),
  )

  return (
    <Link href={`/sculptures/id/${accessionId}`}>
      <a style={{ display: 'inline-block', width: '100%' }}>
        <ShadowCard
          cover={
            sortedImages.length ? (
              <div style={{ height: 450 }}>
                <img
                  src={sortedImages[0].url}
                  style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                />
              </div>
            ) : (
              <EmptyImage
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No Images"
              />
            )
          }
          bordered
        >
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
        <MessageTwoTone
          twoToneColor="rgb(205, 34, 255)"
          style={{ marginRight: 4 }}
        />
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

// Tri local
const sortBy = (list: Sculpture[], criterion: SortCriterion): Sculpture[] => {
  switch (criterion) {
    case 'Likes':
      return list.slice().sort((a, b) => b.totalLikes - a.totalLikes)
    case 'Comments':
      return list.slice().sort((a, b) => b.totalComments - a.totalComments)
    case 'Visits':
      return list.slice().sort((a, b) => b.totalVisits - a.totalVisits)
    case 'Default':
    default:
      return list.slice().sort((a, b) => a.name.localeCompare(b.name))
  }
}

const SculptureGrid = () => {
  const [originalList, setOriginalList] = useState<Sculpture[]>([])
  const [filteredList, setFilteredList] = useState<Sculpture[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<ErrorState | null>(null)
  const [currentSort, setSort] = useState<SortCriterion>('Default')

  useEffect(() => {
    const fetchSculpture = async () => {
      try {
        const { data } = await api.get<Sculpture[]>('/sculpture')
        const sorted = data.slice().sort((a, b) => a.name.localeCompare(b.name))
        setOriginalList(sorted)
        setFilteredList(sorted)
      } catch (e: unknown) {
        const n = normalizeError(e)
        setError({ statusCode: n.statusCode, message: n.message })
      }
      setLoading(false)
    }

    fetchSculpture()
  }, [])

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const k = e.key as SortCriterion
    setSort(k)
    setFilteredList((prev) => sortBy(prev, k))
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
      const newList = originalList.filter((sculpture) => {
        const makerName =
          sculpture.primaryMaker.firstName +
          ' ' +
          sculpture.primaryMaker.lastName
        return (
          sculpture.name.toLowerCase().includes(lower) ||
          makerName.toLowerCase().includes(lower)
        )
      })
      setFilteredList(sortBy(newList, currentSort))
    } else if (filteredList.length !== originalList.length) {
      setFilteredList(sortBy(originalList.slice(), currentSort))
    }
  }

  if (loading) return <Loading />
  if (error) return <Error statusCode={error.statusCode} title={error.message} />

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
          <div
            style={{
              marginLeft: 8,
              marginRight: 8,
              marginBottom: 16,
              display: 'flex',
            }}
          >
            <Search
              allowClear
              placeholder="Enter search term"
              onChange={handleChange}
              size="large"
              style={{ marginRight: 8 }}
            />

            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={['click']}
            >
              <Button size="large">
                <SortAscendingOutlined /> {currentSort} <DownOutlined />
              </Button>
            </Dropdown>
          </div>

          <>
            {!filteredList.length ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No Data :("
                style={{ marginTop: 60 }}
              />
            ) : (
              filteredList.map((sculpture) => (
                <ColStyled
                  xs={24}
                  sm={12}
                  md={8}
                  key={sculpture.accessionId}
                >
                  <SculptureCard info={sculpture} />
                </ColStyled>
              ))
            )}
          </>
        </CardStyled>
      </ColStyled>
    </Row>
  )
}

export default SculptureGrid
