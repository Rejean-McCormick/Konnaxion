'use client'

/**
 * Description: Primary maker list component
 * Author: Hieu Chu
 */

import { useState, useEffect } from 'react'
import { Row, Divider, Modal, message, notification, Button } from 'antd'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { ColStyled, CardStyled, StyledTable } from './style'
import MakerEdit from './EditForm/MakerEdit'
import api from '@/services/_request'
import Loading from '../Loading'
import Error from 'next/error'
import MakerCreate from './CreateForm/MakerCreate'

const { confirm } = Modal

const MakerList = () => {
  useEffect(() => {
    const fetchMakerList = async () => {
      try {
        const data = (await api.get('/maker/')).data

        let formattedData = data.map((maker: any) => {
          let formattedMaker = { ...maker }
          formattedMaker.key = maker.id
          return formattedMaker
        })

        formattedData.sort((a: any, b: any) => a.firstName.localeCompare(b.firstName))

        console.log(formattedData)
        setMakerList(formattedData)
      } catch (e: any) {
        const { statusCode, message } = e.response.data
        setError({
          statusCode,
          message
        })
      }
      setLoading(false)
    }
    fetchMakerList()
  }, [])

  const [makerList, setMakerList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  const [showModal, setShowModal] = useState(false)
  const [showModalCreate, setShowModalCreate] = useState(false)

  const [currentMakerId, setCurrentMakerId] = useState('')
  const openModal = (makerId: string) => {
    setCurrentMakerId(makerId)
    setShowModal(true)
  }

  const openModalCreate = () => {
    setShowModalCreate(true)
  }

  const handleCancel = () => setShowModal(false)
  const handleCancelCreate = () => setShowModalCreate(false)

  const getCurrentMaker = () =>
    makerList.find(x => x.id === currentMakerId) || {}

  const editMaker = (maker: any) => {
    setMakerList(list =>
      list.map(x => {
        if (x.id === maker.id) {
          return { ...maker, key: maker.id }
        }
        return x
      })
    )
  }

  const deleteMaker = (makerId: string) => {
    setMakerList(list => list.filter(x => x.id !== makerId))
  }

  const addMaker = (maker: any) => {
    maker.key = maker.id
    setMakerList(list => [...list, maker])
  }

  const handleDelete = (makerId: string) => {
    confirm({
      title: 'Do you want to remove this maker?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: {
        style: {
          background: '#ff4d4f',
          borderColor: '#ff4d4f'
        }
      },
      onOk: async () => {
        try {
          await api.delete(`/maker/${makerId}`)
          deleteMaker(makerId)
          message.success('Deleted maker successfully!', 2)
        } catch (error) {
          notification.error({
            message: 'Error',
            description:
              "There has been internal server error or the maker you're trying to delete is currently associated with a sculpture."
          })
        }
      }
    })
  }

  const columns = [
    {
      title: 'Maker name',
      key: 'makerName',
      width: '22%',
      render: (_: any, record: any) => {
        const { firstName, lastName, wikiUrl } = record
        const makerName = firstName + ' ' + lastName
        if (!wikiUrl) {
          return <span>{makerName}</span>
        }
        return <a href={wikiUrl}>{makerName}</a>
      }
    },

    {
      title: 'Nationality',
      dataIndex: 'nationality',
      width: '22%'
    },
    {
      title: 'Born - Passed away',
      key: 'year',
      width: '28%',
      render: (_: any, record: any) => {
        let { birthYear, deathYear } = record
        if (!birthYear) birthYear = 'N/A'
        if (!deathYear) deathYear = 'N/A'
        return <span>{birthYear + ' - ' + deathYear}</span>
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (record: any) => (
        <span>
          <a onClick={() => openModal(record.key)}>Edit</a>
          <Divider type="vertical" />
          <a onClick={() => handleDelete(record.key)}>Delete</a>
        </span>
      )
    }
  ]

  if (loading) return <Loading />
  if (error)
    return <Error statusCode={error.statusCode} title={error.message} />

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
            dataSource={makerList}
            columns={columns}
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

      <MakerCreate
        visible={showModalCreate}
        handleCancel={handleCancelCreate}
        addMaker={addMaker}
      />
    </Row>
  )
}

export default MakerList
