'use client';

/**
 * Description: Image edit component for sculpture
 * Author: Hieu Chu
 */

import { Upload, Button, message as antdMessage, Row, Modal } from 'antd';
import type { UploadFile } from 'antd';
import { useState } from 'react';
import { ColStyled } from '../style';
import api from '../../../api';
import { useRouter } from 'next/navigation';
import { normalizeError } from '../../../shared/errors';
import Icon from '@/components/compat/Icon';
import type { UploadRequestOption as RcUploadRequestOption } from 'rc-upload/lib/interface';
import type { AxiosProgressEvent } from 'axios';

const { confirm } = Modal;

type EditImageProps = {
  accessionId: string;
  _name: string;
  // Les images reçues sont déjà façonnées côté parent pour l'Upload (uid/url/preview/status)
  images: UploadFile[];
};

const EditImage = ({ accessionId, _name, images }: EditImageProps) => {
  const router = useRouter();

  const [fileList, setFileList] = useState<UploadFile[]>([...(images as UploadFile[])]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRemove = (file: UploadFile): Promise<boolean> => {
    return new Promise((resolve) => {
      confirm({
        title: 'Do you want to remove this image?',
        icon: <Icon type="exclamation-circle" style={{ color: '#ff4d4f' }} />,
        style: { top: 110 },
        maskClosable: true,
        okText: 'Confirm',
        okButtonProps: {
          style: {
            background: '#ff4d4f',
            borderColor: '#ff4d4f',
          },
        },
        onOk: async () => {
          setIsSubmitting(true);
          try {
            await api.delete(`/sculpture-images/${(file as any).uid}`);
            resolve(true);
            setFileList((curr) => curr.filter((x: any) => x.uid !== (file as any).uid));
            antdMessage.success('Deleted image successfully!', 2);
          } catch (error: unknown) {
            const { message } = normalizeError(error);
            antdMessage.error(message);
            resolve(false);
          }
          setIsSubmitting(false);
        },
        onCancel: () => {
          resolve(false);
        },
      });
    });
  };

  const customRequest = async (e: RcUploadRequestOption) => {
    const config = {
      headers: {
        'content-type':
          'multipart/form-data; boundary=----WebKitFormBoundaryqTqJIxvkWFYqvP5s',
      },
      onUploadProgress: function (progressEvent: AxiosProgressEvent) {
        const loaded = progressEvent.loaded ?? 0;
        const total = progressEvent.total ?? 1;
        const percentCompleted = Math.round((loaded * 100) / total);
        // rc-upload attend un objet { percent }
        e.onProgress?.({ percent: percentCompleted } as any, e.file as any);
      },
    };

    const data = new FormData();
    data.append('images', e.file as Blob);
    data.set('accessionId', accessionId);

    const hide = antdMessage.loading('Uploading image...', 0);
    setIsSubmitting(true);

    try {
      const _result = await api.post('/sculpture-images', data, config);
      const file: any = { ...(e.file as any) };
      const { id, url } = _result.data[0];
      file.uid = id;
      file.url = url;
      file.thumbUrl = url;
      file.preview = url;

      setFileList((curr) => [...curr, file]);

      e.onSuccess?.(_result.data[0], e.file as any);
      hide();
      antdMessage.success('Uploaded image successfully!', 2);
    } catch (error: unknown) {
      const { message } = normalizeError(error);
      antdMessage.error(message);
      e.onError?.(message as any);
    }

    setIsSubmitting(false);
  };

  const uploadButton = (
    <div>
      <Icon type="plus" />
      <div className="ant-upload-text">Upload</div>
    </div>
  );

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <Upload
          accept="image/*"
          listType="picture-card"
          customRequest={customRequest}
          onRemove={handleRemove}
          fileList={fileList as any}
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
  );
};

export default EditImage;
