'use client'

/**
 * Description: Sculpture list component
 * Author: Hieu Chu
 */

import { useState, useEffect } from 'react'
import {
  Row,
  Card,
  Typography,
  Tooltip,
  Input,
  Empty,
  Button,
  Dropdown
} from 'antd'
import type { MenuProps } from 'antd'
import {
  PlusOutlined,
  SortAscendingOutlined,
  DownOutlined,
  HeartTwoTone,
  MessageTwoTone,
  EnvironmentOutlined
} from '@ant-design/icons'
const { Text } = Typography
const { Meta } = Card
const { Search } = Input
import Link from 'next/link'
import { ColStyled, CardStyled, ShadowCard, Subtitle, EmptyImage } from './style'
import Loading from '../Loading'
import Error from 'next/error'
import api from '@/services/_request'
import { normalizeError } from "../../shared/errors";

const SculptureCard = ({
  info: {
    accessionId,
    name,
    totalVisits,
    totalLikes,
    totalComments,
    primaryMaker,
    images
  }
}) => {
  const makerName = primaryMaker.firstName + ' ' + primaryMaker.lastName
  images.sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  )
  return (
    <Link href={`/sculptures/id/${accessionId}`}>
      <a style={{ display: 'inline-block', width: '100%' }}>
        <ShadowCard
          cover={
            images.length ? (
              <div style={{ height: 450 }}>
                <img
                  src={images[0].url}
                  style={{
                    height: '100%',
                    width: '100%',
                    objectFit: 'cover'
                  }}
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
  makerName
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

// custom sort function
const sortBy = (list, criterion) => {
  switch (criterion) {
    case 'Likes':
      return list.slice().sort((a, b) => +b.totalLikes - +a.totalLikes)
    case 'Comments':
      return list.slice().sort((a, b) => +b.totalComments - +a.totalComments)
    case 'Visits':
      return list.slice().sort((a, b) => +b.totalVisits - +a.totalVisits)
    case 'Default':
      return list.slice().sort((a, b) => a.name.localeCompare(b.name))
  }
}

const SculptureGrid = () => {
  const [originalList, setOriginalList] = useState([])
  const [filteredList, setFilteredList] = useState(originalList.slice())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [currentSort, setSort] = useState('Default')

  useEffect(() => {
    const fetchSculpture = async () => {
      try {
        const { data } = await api.get('/sculpture')
        data.sort((a, b) => a.name.localeCompare(b.name))
        setOriginalList(data)
        setFilteredList(data)
      } catch (e: unknown) {
        const { message, statusCode } = normalizeError(e);
        const { statusCode, message } = e.response.data
        setError({ statusCode, message })
      }
      setLoading(false)
    }

    fetchSculpture()
  }, [])

  const handleMenuClick: MenuProps['onClick'] = e => {
    setSort(e.key)
    setFilteredList(filtered => sortBy(filtered, e.key))
  }

  const menuItems: MenuProps['items'] = [
    { key: 'Default', label: 'Default' },
    { key: 'Likes', label: 'Likes' },
    { key: 'Comments', label: 'Comments' },
    { key: 'Visits', label: 'Visits' }
  ]

  const handleChange = e => {
    const input = e.target.value
    if (input.length >= 3) {
      const newList = originalList.filter(sculpture => {
        const makerName =
          sculpture.primaryMaker.firstName +
          ' ' +
          sculpture.primaryMaker.lastName

        return (
          sculpture.name.toLowerCase().includes(input.toLowerCase()) ||
          makerName.toLowerCase().includes(input.toLowerCase())
        )
      })
      setFilteredList(sortBy(newList, currentSort))
    } else {
      if (filteredList.length !== originalList.length) {
        setFilteredList(sortBy(originalList.slice(), currentSort))
      }
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
              display: 'flex'
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
              filteredList.map(sculpture => {
                return (
                  <ColStyled xs={24} sm={12} md={8} key={sculpture.accessionId}>
                    <SculptureCard info={sculpture} />
                  </ColStyled>
                )
              })
            )}
          </>
        </CardStyled>
      </ColStyled>
    </Row>
  )
}

export default SculptureGrid
