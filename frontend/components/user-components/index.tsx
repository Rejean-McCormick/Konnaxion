'use client'

/**
 * Description: User management components
 * Author: Hieu Chu
 */

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import moment from 'moment'

import { Row, Input, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { Comment } from '@ant-design/compatible'

import { ColStyled, CardStyled, StyledTable } from './style'
import api from '@/services/_request'
import Loading from '../Loading'
import NextError from 'next/error'
import { convertNonAccent } from '../shared/utils'

const UserList = () => {
  const router = useRouter()

  const [userList, setUserList] = useState<any[]>([])
  const searchInput = useRef<Input | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ statusCode: number; message: string } | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let users = (await api.get('/user')).data
        users = users
          .filter((x: any) => !x.role)
          .map((x: any) => ({
            ...x,
            key: x.userId,
            totalLikes: +x.totalLikes,
            totalComments: +x.totalComments,
            totalVisits: +x.totalVisits,
          }))

        users.sort(
          (a: any, b: any) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime(),
        )

        setUserList(users)
      } catch (e: any) {
        const statusCode = e?.response?.data?.statusCode ?? 500
        const message = e?.response?.data?.message ?? 'Failed to load users'
        setError({ statusCode, message })
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const getUserSearchProps = () => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }: {
      setSelectedKeys: (keys: React.Key[]) => void
      selectedKeys: React.Key[]
      confirm: () => void
      clearFilters: () => void
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput as any}
          placeholder="Search user"
          value={(selectedKeys[0] as string) ?? ''}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button type="primary" onClick={() => handleSearch(selectedKeys, confirm)} style={{ width: 90, marginRight: 8 }}>
          Search
        </Button>
        <Button onClick={() => handleReset(clearFilters)} style={{ width: 90 }}>
          Reset
        </Button>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1890ff' : '#7E7E7E' }} />
    ),
    onFilter: (value: string, record: any) => {
      const { email, name, nickname, userId } = record
      let author = name
      if (userId.includes('auth0')) author = nickname

      return (
        convertNonAccent(author.toLowerCase()).includes(value.toLowerCase()) ||
        convertNonAccent(email.toLowerCase()).includes(value.toLowerCase())
      )
    },
    // AntD v5: "open" naming
    onFilterDropdownOpenChange: (open: boolean) => {
      if (open) {
        setTimeout(() => searchInput.current?.select?.(), 0)
      }
    },
  })

  const handleSearch = (_selectedKeys: React.Key[], confirm: () => void) => {
    confirm()
  }

  const handleReset = (clearFilters: () => void) => {
    clearFilters()
  }

  const columns: any[] = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: any) => {
        const { email, name, nickname, picture, userId } = record
        let author = name
        if (userId.includes('auth0')) author = nickname

        return (
          <Comment
            author={
              <span style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.65)' }}>
                {author}
              </span>
            }
            avatar={
              <img
                src={picture}
                style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover' }}
                alt={author}
              />
            }
            content={<div style={{ fontSize: 14 }}>{email}</div>}
          />
        )
      },
      width: '30%',
      ...getUserSearchProps(),
    },
    {
      title: 'Connection type',
      key: 'connection',
      render: (_: any, record: any) => {
        let connection = ''
        if (record.userId.includes('google')) connection = 'Google'
        else if (record.userId.includes('facebook')) connection = 'Facebook'
        else connection = 'Email'
        return <span>{connection}</span>
      },
      filters: [
        { text: 'Email', value: 'auth0' },
        { text: 'Google', value: 'google' },
        { text: 'Facebook', value: 'facebook' },
      ],
      onFilter: (value: string, record: any) => record.userId.includes(value),
      width: '15%',
    },
    {
      title: 'Join date',
      key: 'joinDate',
      render: (_: any, record: any) => <span>{moment(record.joinDate).format('D MMMM YYYY')}</span>,
      sorter: (a: any, b: any) => new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      sortDirections: ['ascend', 'descend'],
      width: '15%',
    },
    {
      title: 'Likes',
      dataIndex: 'totalLikes',
      sorter: (a: any, b: any) => a.totalLikes - b.totalLikes,
      sortDirections: ['descend', 'ascend'],
      width: '13.33%',
    },
    {
      title: 'Comments',
      dataIndex: 'totalComments',
      sorter: (a: any, b: any) => a.totalComments - b.totalComments,
      sortDirections: ['descend', 'ascend'],
      width: '13.33%',
    },
    {
      title: 'Visits',
      dataIndex: 'totalVisits',
      sorter: (a: any, b: any) => a.totalVisits - b.totalVisits,
      sortDirections: ['descend', 'ascend'],
      width: '13.33%',
    },
  ]

  if (loading) return <Loading />
  if (error) return <NextError statusCode={error.statusCode} title={error.message} />

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled title="User Management">
          <StyledTable
            dataSource={userList}
            columns={columns}
            pagination={{ pageSize: 25, hideOnSinglePage: true }}
            className="user-table"
            onRow={(record: any) => ({
              onClick: () => router.push(`/users/id/${record.key}`),
            })}
            style={{ maxWidth: 1100 }}
          />
        </CardStyled>
      </ColStyled>
    </Row>
  )
}

export default UserList
