'use client';

/**
 * Description: Upload image component when creating new sculpture
 * Author: Hieu Chu
 */

import { Upload, Button, message as antdMessage, Row, Modal } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AxiosProgressEvent } from 'axios';
import { useState } from 'react';
import { CardStyled, ColStyled } from '../style';
import api from '../../../api';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { normalizeError } from '../../../shared/errors';
import Icon from '@/components/compat/Icon';

const { confirm } = Modal;

type SculptureUploadImageProps = {
  sculpture: { accessionId: string; name: string };
};

const defaultFileList: UploadFile[] = [];

export default function SculptureUploadImage({ sculpture }: SculptureUploadImageProps) {
  const router = useRouter();
  const [fileList, setFileList] = useState<UploadFile[]>([...defaultFileList]);
  const { accessionId, name } = sculpture;

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
          try {
            await api.delete(`/sculpture-images/${file.uid}`);
            setFileList((prev) => prev.filter((x) => x.uid !== file.uid));
            antdMessage.success('Deleted image successfully!', 2);
            resolve(true);
          } catch (e) {
            const { message } = normalizeError(e);
            antdMessage.error(message || 'Failed to delete image');
            resolve(false);
          }
        },
        onCancel: () => resolve(false),
      });
    });

  const customRequest: UploadProps['customRequest'] = async (options) => {
    const { file, onProgress, onError, onSuccess } = options;

    const config = {
      headers: { 'content-type': 'multipart/form-data' },
      onUploadProgress: (ev: AxiosProgressEvent) => {
        const total = ev.total ?? 0;
        const percent = total ? Math.round((ev.loaded / total) * 100) : 0;
        onProgress?.({ percent });
      },
    };

    const form = new FormData();
    form.append('images', file as any);
    form.set('accessionId', accessionId);

    const hide = antdMessage.loading('Uploading image...', 0);
    try {
      const result = await api.post('/sculpture-images', form, config);
      const { id, url } = result.data[0];

      const uploaded: UploadFile = {
        uid: String(id),
        name: (file as any)?.name ?? String(id),
        status: 'done',
        url,
        thumbUrl: url,
      };

      setFileList((prev) => [...prev, uploaded]);
      onSuccess?.(result.data[0], file as any);
      antdMessage.success('Uploaded image successfully!', 2);
    } catch (e) {
      const { message } = normalizeError(e);
      antdMessage.error(message || 'Upload failed');
      onError?.(new Error(message || 'Upload failed') as any);
    } finally {
      hide();
    }
  };

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <>
      <Head>
        <title>Upload images - UOW Sculptures</title>
      </Head>
      <Row gutter={16}>
        <ColStyled xs={24}>
          <CardStyled title={`Upload sculpture image for ${name}`}>
            <Upload
              defaultFileList={[...defaultFileList]}
              accept="image/*"
              listType="picture-card"
              customRequest={customRequest}
              onRemove={handleRemove}
              fileList={fileList}
            >
              {uploadButton}
            </Upload>

            <Button type="primary" onClick={() => router.push(`/sculptures/id/${accessionId}`)}>
              Finish
            </Button>
          </CardStyled>
        </ColStyled>
      </Row>
    </>
  );
}
