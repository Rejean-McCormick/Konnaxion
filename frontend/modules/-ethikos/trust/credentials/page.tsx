'use client'

import { PageContainer } from '@ant-design/pro-components';
import { Upload, Button, Result } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useState } from 'react';
import usePageTitle from '@/hooks/usePageTitle';
import { uploadCredential } from '@/services/trust';

export default function Credentials() {
  usePageTitle('Trust · Credentials');

  const [done, setDone] = useState(false);

  const props = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        await uploadCredential(file as File);
        onSuccess('ok');
        setDone(true);
      } catch {
        onError();
      }
    },
  };

  return (
    <PageContainer ghost>
      {done ? (
        <Result
          status="success"
          title="Document uploaded!"
          subTitle="Your credential is pending verification."
          extra={<Button type="primary" onClick={() => setDone(false)}>Upload another</Button>}
        />
      ) : (
        <Upload.Dragger {...props} accept=".pdf,.jpg,.png">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Supported: PDF / JPG / PNG &nbsp;·&nbsp; Max 5 MB</p>
        </Upload.Dragger>
      )}
    </PageContainer>
  );
}
