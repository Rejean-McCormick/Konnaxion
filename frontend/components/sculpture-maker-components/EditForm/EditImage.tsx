// Path: components/sculpture-maker-components/EditForm/EditImage.tsx
'use client'

/**
 * Description: Image edit component for sculpture
 * Author: Hieu Chu
 */

import { Upload, Button, message as antdMessage, Row, Modal } from 'antd'
import type { UploadProps, UploadFile } from 'antd'
import { useState } from 'react'
import { ColStyled } from '../style' // FIX: le style est au niveau parent
import api from '@/api'
import { useRouter } from 'next/navigation'
import { normalizeError } from '@/shared/errors'
import Icon from '@/components/compat/Icon'
import type { AxiosProgressEvent } from 'axios'

const { confirm } = Modal

type UploadedImage = { id: string | number; url: string }

type EditImageProps = {
  accessionId: string
  _name: string
  /** Images déjà normalisées par le parent au format UploadFile AntD. */
  images: UploadFile[]
}

/** Typage robuste du paramètre customRequest sans dépendre de rc-upload. */
type CustomRequestOptions = Parameters<NonNullable<UploadProps['customRequest']>>[0]

const EditImage = ({ accessionId, _name, images }: EditImageProps) => {
  const router = useRouter()

  const [fileList, setFileList] = useState<UploadFile[]>([...images])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRemove: UploadProps['onRemove'] = (file) =>
    new Promise<boolean>((resolve) => {
      confirm({
        title: 'Do you want to remove this image?',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff4d4f' }} />,
        style: { top: 110 },
        maskClosable: true,
        okText: 'Confirm',
        okButtonProps: { style: { background: '#ff4d4f', borderColor: '#ff4d4f' } },
        onOk: async () => {
          setIsSubmitting(true)
          try {
            await api.delete(`/sculpture-images/${file.uid}`)
            resolve(true)
            setFileList((curr) => curr.filter((x) => x.uid !== file.uid))
            antdMessage.success('Deleted image successfully!', 2)
          } catch (error: unknown) {
            const { message } = normalizeError(error)
            antdMessage.error(message || 'Failed to delete image')
            resolve(false)
          } finally {
            setIsSubmitting(false)
          }
        },
        onCancel: () => resolve(false),
      })
    })

  // AntD v5: customRequest(options) => void, faire l'async à l'intérieur.
  const customRequest: UploadProps['customRequest'] = (options) => {
    const e = options as CustomRequestOptions

    const config = {
      headers: { 'content-type': 'multipart/form-data' },
      onUploadProgress(progressEvent: AxiosProgressEvent) {
        const loaded = progressEvent.loaded ?? 0
        const total = progressEvent.total ?? 1
        const percent = total ? Math.round((loaded * 100) / total) : 0
        // AntD attend { percent } et accepte le fichier en 2e arg
        e.onProgress?.({ percent }, e.file as any)
      },
    }

    const data = new FormData()
    data.append('images', e.file as any)
    data.set('accessionId', accessionId)

    const hide = antdMessage.loading('Uploading image...', 0)
    setIsSubmitting(true)

    ;(async () => {
      try {
        // Wrapper axios "data-first" : retourne T directement
        const uploaded = await api.post<UploadedImage[]>('/sculpture-images', data, config)
        const first = uploaded?.[0]
        if (!first) throw new Error('Upload response empty')

        const next: UploadFile = {
          uid: String(first.id),
          name: (e.file as any)?.name ?? String(first.id),
          status: 'done',
          url: first.url,
          thumbUrl: first.url,
        }

        setFileList((prev) => [...prev, next])
        e.onSuccess?.(first as any, e.file as any)
        antdMessage.success('Uploaded image successfully!', 2)
      } catch (error: unknown) {
        const { message } = normalizeError(error)
        antdMessage.error(message || 'Upload failed')
        e.onError?.(new Error(message || 'Upload failed') as any)
      } finally {
        hide()
        setIsSubmitting(false)
      }
    })()
  }

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Upload</div>
    </div>
  )

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <Upload
          accept="image/*"
          listType="picture-card"
          customRequest={customRequest}
          onRemove={handleRemove}
          fileList={fileList}
        >
          {uploadButton}
        </Upload>

        <Button
          type="primary"
          loading={isSubmitting}
          onClick={() => router.push(`/sculptures/id/${accessionId}`)}
        >
          Finish
        </Button>
      </ColStyled>
    </Row>
  )
}

export default EditImage
