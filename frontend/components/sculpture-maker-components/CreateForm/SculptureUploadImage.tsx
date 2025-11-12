// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\CreateForm\SculptureUploadImage.tsx
'use client';

import { Upload, Button, message as antdMessage, Row, Modal } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AxiosProgressEvent } from 'axios';
import { useState } from 'react';
// FIX: style.tsx is one level up from CreateForm
import { CardStyled, ColStyled } from '../style';
import api from '@/api';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { normalizeError } from '@/shared/errors';
import Icon from '@/components/compat/Icon';

const { confirm } = Modal;

type SculptureUploadImageProps = {
  sculpture: { accessionId: string; name: string };
};

type UploadedImage = {
  id: string | number;
  url: string;
};

const defaultFileList: UploadFile[] = [];

export default function SculptureUploadImage({ sculpture }: SculptureUploadImageProps) {
  const router = useRouter();
  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);
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
      // data-first wrapper returns T directly
      const uploaded = await api.post<UploadedImage[]>('/sculpture-images', form, config);
      const first = uploaded?.[0];
      if (!first) throw new Error('Upload response empty');

      const next: UploadFile = {
        uid: String(first.id),
        name: (file as any)?.name ?? String(first.id),
        status: 'done',
        url: first.url,
        thumbUrl: first.url,
      };

      setFileList((prev) => [...prev, next]);
      onSuccess?.(first as any, file as any);
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
              accept="image/*"
              listType="picture-card"
              customRequest={customRequest}
              onRemove={handleRemove}
              fileList={fileList}
              maxCount={20}
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
