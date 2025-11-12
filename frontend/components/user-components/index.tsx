// C:\MyCode\Konnaxionv14\frontend\components\user-components\index.tsx
'use client'

/**
 * Description: User management components
 * Author: Hieu Chu
 */

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'

import { Row, Input, Button, Spin } from 'antd'
import type { InputRef } from 'antd/es/input'
import { SearchOutlined } from '@ant-design/icons'
import { Comment } from '@ant-design/compatible'

import { ColStyled, CardStyled, StyledTable } from './style'
import { get as apiGet } from '@/services/_request'
import NextError from 'next/error'
import { convertNonAccent } from '@/components/shared/utils'
import { normalizeError } from '@/shared/errors'

type RawUser = {
  userId: string
  email: string
  name: string
  nickname?: string
  picture: string
  joinDate: string | Date
  totalLikes?: number | string
  totalComments?: number | string
  totalVisits?: number | string
  role?: string | null
}

type UserRow = {
  key: string
  userId: string
  email: string
  name: string
  nickname?: string
  picture: string
  joinDate: string
  totalLikes: number
  totalComments: number
  totalVisits: number
}

/** Remplacement de l'ancien import './Loading' introuvable */
const Loading: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
    <Spin size="large" />
  </div>
)

const UserList: React.FC = () => {
  const router = useRouter()

  const [userList, setUserList] = useState<UserRow[]>([])
  const searchInput = useRef<InputRef>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ statusCode: number; message: string } | null>(null)

  useEffect(() => {
    let mounted = true
    const fetchUsers = async () => {
      try {
        // le helper retourne la payload directement
        const users = await apiGet<RawUser[]>('/user')

        const rows: UserRow[] = (users ?? [])
          .filter((x) => !x.role)
          .map((x) => ({
            key: x.userId,
            userId: x.userId,
            email: x.email,
            name: x.name,
            nickname: x.nickname,
            picture: x.picture,
            joinDate: new Date(x.joinDate as any).toISOString(),
            totalLikes: Number(x.totalLikes ?? 0),
            totalComments: Number(x.totalComments ?? 0),
            totalVisits: Number(x.totalVisits ?? 0),
          }))
          .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())

        if (mounted) setUserList(rows)
      } catch (e: any) {
        const err = (normalizeError?.(e) ?? {}) as { statusCode?: number; message?: string }
        const statusCode = Number(err.statusCode ?? e?.response?.data?.statusCode ?? 500)
        const message = String(err.message ?? 'Failed to load users')
        if (mounted) setError({ statusCode, message })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      mounted = false
    }
  }, [])

  const handleSearch = (_selectedKeys: React.Key[], confirm: () => void) => confirm()
  const handleReset = (clearFilters: () => void) => clearFilters()

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
          ref={searchInput}
          placeholder="Search user"
          value={(selectedKeys[0] as string) ?? ''}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm)}
          style={{ width: 90, marginRight: 8 }}
        >
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
    onFilter: (value: string | number | boolean, record: UserRow) => {
      const { email, name, nickname, userId } = record
      const author = userId.includes('auth0') ? (nickname ?? name) : name
      const v = String(value ?? '').toLowerCase()
      return (
        convertNonAccent(author.toLowerCase()).includes(v) ||
        convertNonAccent(email.toLowerCase()).includes(v)
      )
    },
    onFilterDropdownOpenChange: (open: boolean) => {
      if (open) setTimeout(() => searchInput.current?.select?.(), 0)
    },
  })

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: any, record: UserRow) => {
        const { email, name, nickname, picture, userId } = record
        const author = userId.includes('auth0') ? (nickname ?? name) : name
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
      render: (_: any, record: UserRow) => {
        const id = record.userId
        const connection = id.includes('google')
          ? 'Google'
          : id.includes('facebook')
          ? 'Facebook'
          : 'Email'
        return <span>{connection}</span>
      },
      filters: [
        { text: 'Email', value: 'auth0' },
        { text: 'Google', value: 'google' },
        { text: 'Facebook', value: 'facebook' },
      ],
      onFilter: (value: string | number | boolean, record: UserRow) =>
        record.userId.includes(String(value)),
      width: '15%',
    },
    {
      title: 'Join date',
      key: 'joinDate',
      render: (_: any, record: UserRow) => (
        <span>{dayjs(record.joinDate).format('D MMMM YYYY')}</span>
      ),
      sorter: (a: UserRow, b: UserRow) =>
        new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      sortDirections: ['ascend', 'descend'] as const,
      width: '15%',
    },
    {
      title: 'Likes',
      dataIndex: 'totalLikes',
      sorter: (a: UserRow, b: UserRow) => a.totalLikes - b.totalLikes,
      sortDirections: ['descend', 'ascend'] as const,
      width: '13.33%',
    },
    {
      title: 'Comments',
      dataIndex: 'totalComments',
      sorter: (a: UserRow, b: UserRow) => a.totalComments - b.totalComments,
      sortDirections: ['descend', 'ascend'] as const,
      width: '13.33%',
    },
    {
      title: 'Visits',
      dataIndex: 'totalVisits',
      sorter: (a: UserRow, b: UserRow) => a.totalVisits - b.totalVisits,
      sortDirections: ['descend', 'ascend'] as const,
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
            columns={columns as any}
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
