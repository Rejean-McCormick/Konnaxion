'use client'

import React, { useEffect, useState } from 'react'
import { Row, Divider, Modal, message as antdMessage, notification, Button, Spin } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ColStyled, CardStyled, StyledTable } from './style'
import MakerEdit from './EditForm/MakerEdit'
import MakerCreate from './CreateForm/MakerCreate'
import NextError from 'next/error'
import { get, del } from '@/services/_request'
import { normalizeError } from '@/shared/errors'

const { confirm } = Modal

/** Type unifié avec MakerEdit (notamment wikiUrl: string | null) */
export type Maker = {
  id: string | number
  firstName?: string
  lastName?: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
  wikiUrl?: string | null
  key?: React.Key
}

type HttpError = { statusCode: number; message: string }

const Loading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
    <Spin size="large" />
  </div>
)

const EMPTY_MAKER: Maker = {
  id: '',
  firstName: '',
  lastName: '',
  nationality: null,
  birthYear: null,
  deathYear: null,
  wikiUrl: null,
}

const MakerList: React.FC = () => {
  const [makerList, setMakerList] = useState<Maker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<HttpError | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [showModalCreate, setShowModalCreate] = useState(false)
  const [currentMakerId, setCurrentMakerId] = useState<string | number>('')

  useEffect(() => {
    const fetchMakerList = async () => {
      try {
        // helper data-first → retourne directement la payload
        const data = await get<Maker[]>('/maker/')
        const formatted = (data ?? [])
          .map((maker) => ({
            ...maker,
            // normalisation douce
            firstName: maker.firstName ?? '',
            lastName: maker.lastName ?? '',
            nationality: maker.nationality ?? null,
            wikiUrl: maker.wikiUrl ?? null,
            key: maker.id,
          }))
          .sort(
            (a, b) =>
              (a.firstName ?? '').localeCompare(b.firstName ?? '') ||
              (a.lastName ?? '').localeCompare(b.lastName ?? ''),
          )
        setMakerList(formatted)
      } catch (e) {
        const { message, statusCode = 500 } = normalizeError(e)
        setError({ statusCode, message })
      } finally {
        setLoading(false)
      }
    }
    fetchMakerList()
  }, [])

  const openModal = (makerId: string | number) => {
    setCurrentMakerId(makerId)
    setShowModal(true)
  }
  const openModalCreate = () => setShowModalCreate(true)
  const handleCancel = () => setShowModal(false)
  const handleCancelCreate = () => setShowModalCreate(false)

  /** Toujours retourner un Maker conforme */
  const getCurrentMaker = (): Maker => makerList.find((x) => x.id === currentMakerId) ?? EMPTY_MAKER

  /** Signature compatible avec MakerEdit: (m: Maker) => void */
  const editMaker = (maker: Maker) => {
    setMakerList((list) => list.map((x) => (x.id === maker.id ? { ...maker, key: maker.id } : x)))
  }

  const deleteMakerLocal = (makerId: string | number) => {
    setMakerList((list) => list.filter((x) => x.id !== makerId))
  }

  const addMaker = (maker: Maker) => {
    setMakerList((list) => [{ ...maker, key: maker.id }, ...list])
  }

  const handleDelete = (makerId: string | number) => {
    confirm({
      title: 'Do you want to remove this maker?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: { style: { background: '#ff4d4f', borderColor: '#ff4d4f' } },
      async onOk() {
        try {
          await del<void>(`/maker/${makerId}`)
          deleteMakerLocal(makerId)
          antdMessage.success('Deleted maker successfully!', 2)
        } catch (err) {
          const { message } = normalizeError(err)
          notification.error({
            message: 'Error',
            description:
              message ||
              "There has been an internal server error or the maker you're trying to delete is currently associated with a sculpture.",
          })
        }
      },
    })
  }

  const columns: ColumnsType<Maker> = [
    {
      title: 'Maker name',
      key: 'makerName',
      width: '22%',
      render: (_, record) => {
        const makerName = `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim()
        return record.wikiUrl ? <a href={record.wikiUrl}>{makerName || '—'}</a> : <span>{makerName || '—'}</span>
      },
    },
    {
      title: 'Nationality',
      dataIndex: 'nationality',
      width: '22%',
      render: (v: Maker['nationality']) => v ?? '—',
    },
    {
      title: 'Born - Passed away',
      key: 'year',
      width: '28%',
      render: (_, record) => {
        const birth = record.birthYear ?? 'N/A'
        const death = record.deathYear ?? 'N/A'
        return <span>{`${birth} - ${death}`}</span>
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button type="link" onClick={() => openModal(record.id)}>
            Edit
          </Button>
          <Divider type="vertical" />
          <Button type="link" danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </span>
      ),
    },
  ]

  if (loading) return <Loading />
  if (error) return <NextError statusCode={error.statusCode} title={error.message} />

  // StyledTable via styled-components perd les génériques → cast columns/dataSource
  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled
          title="Maker List"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={openModalCreate}>
              Add new maker
            </Button>
          }
        >
          <StyledTable
            rowKey="id"
            dataSource={makerList as any}
            columns={columns as any}
            pagination={{ pageSize: 25, hideOnSinglePage: true }}
            style={{ maxWidth: 750 }}
          />
        </CardStyled>
      </ColStyled>

      <MakerEdit
        visible={showModal}
        handleCancel={handleCancel}
        getCurrentMaker={getCurrentMaker}
        editMaker={editMaker}
      />
      <MakerCreate visible={showModalCreate} handleCancel={handleCancelCreate} addMaker={addMaker} />
    </Row>
  )
}

export default MakerList
