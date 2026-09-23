// FILE: frontend/modules/ethikos/trust/credentials/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { InboxOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Button, Result, Upload, type UploadProps } from 'antd';
import { useState } from 'react';

import usePageTitle from '@/hooks/usePageTitle';
import { uploadCredential } from '@/services/trust';

export default function Credentials() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.trust.credentials.trustCredentials"));

  const [done, setDone] = useState(false);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        await uploadCredential(file as File);
        onSuccess?.('ok');
        setDone(true);
      } catch {
        onError?.(new Error('Credential upload failed'));
      }
    },
  };

  return (
    <PageContainer ghost>
      {done ? (
        <Result
          status="success"
          title={i18nT("ui.ethikos.trust.credentials.documentUploaded")}
          subTitle={i18nT("ui.ethikos.trust.credentials.pendingVerification")}
          extra={<Button type="primary" onClick={() => setDone(false)}>{i18nT("ui.ethikos.trust.credentials.uploadAnother")}</Button>}
        />
      ) : (
        <Upload.Dragger {...props} accept=".pdf,.jpg,.png">
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">{i18nT("ui.ethikos.trust.credentials.clickOrDragFileToThisArea")}</p>
          <p className="ant-upload-hint">{i18nT("ui.ethikos.trust.credentials.supportedPdfJpgPngMax5Mb")}</p>
        </Upload.Dragger>
      )}
    </PageContainer>
  );
}
