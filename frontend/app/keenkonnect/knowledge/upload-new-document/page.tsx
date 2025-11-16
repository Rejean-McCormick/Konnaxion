'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { message as antdMessage } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormSwitch,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { InboxOutlined } from '@ant-design/icons';
import api from '@/api';
import usePageTitle from '@/hooks/usePageTitle';

type CategoryOption = 'Robotics' | 'Healthcare' | 'Technology' | 'Energy' | 'Education';
type LanguageOption = 'English' | 'French';

interface UploadDocumentFormValues {
  title: string;
  description: string;
  category: CategoryOption;
  version: string;
  language: LanguageOption;
  publishNow: boolean;
  documentFile?: UploadFile[]; // optional in typing, required via rules
}

// Normalise Upload event -> UploadFile[]
const normFile = (e: any): UploadFile[] => {
  if (Array.isArray(e)) {
    return e as UploadFile[];
  }
  return (e?.fileList ?? []) as UploadFile[];
};

export default function UploadNewDocumentPage(): JSX.Element {
  usePageTitle('KeenKonnect · Knowledge · Upload document');
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: UploadDocumentFormValues) => {
    const fileList = values.documentFile ?? [];
    const file = fileList[0]?.originFileObj;

    if (!file) {
      antdMessage.error('Please upload a document file before submitting.');
      return false;
    }

    const formData = new FormData();
    // Métadonnées principales
    formData.append('title', values.title);
    formData.append('description', values.description);
    formData.append('category', values.category);
    formData.append('version', values.version);
    formData.append('language', values.language);
    formData.append('publishNow', values.publishNow ? 'true' : 'false');
    // Fichier lui‑même
    formData.append('file', file as File);

    try {
      setSubmitting(true);

      await api.post('/knowledge/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      antdMessage.success('Document uploaded successfully');
      router.push('/keenkonnect/knowledge/document-management');
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Document upload error:', error);
      antdMessage.error('Failed to upload document. Please try again.');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      ghost
      header={{
        title: 'Upload New Document',
        subTitle: 'Add a new knowledge asset to KeenKonnect',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <ProCard>
          <ProForm<UploadDocumentFormValues>
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
              publishNow: true,
            }}
            submitter={{
              searchConfig: {
                submitText: 'Upload Document',
                resetText: 'Reset',
              },
              submitButtonProps: {
                loading: submitting,
                type: 'primary',
              },
            }}
          >
            <ProFormText
              name="title"
              label="Document Title"
              placeholder="Enter document title"
              rules={[
                { required: true, message: 'Please enter a document title' },
                { max: 200, message: 'Title is too long' },
              ]}
            />

            <ProFormTextArea
              name="description"
              label="Description / Abstract"
              placeholder="Short summary of the document contents"
              fieldProps={{ rows: 4 }}
              rules={[
                { required: true, message: 'Please provide a description or abstract' },
              ]}
            />

            <ProFormSelect<CategoryOption>
              name="category"
              label="Category / Topic"
              placeholder="Select a category"
              rules={[{ required: true, message: 'Please select a category/topic' }]}
              options={[
                { label: 'Robotics', value: 'Robotics' },
                { label: 'Healthcare', value: 'Healthcare' },
                { label: 'Technology', value: 'Technology' },
                { label: 'Energy', value: 'Energy' },
                { label: 'Education', value: 'Education' },
              ]}
            />

            <ProFormText
              name="version"
              label="Version"
              placeholder="e.g. 1.0"
              rules={[
                { required: true, message: 'Please specify the document version' },
              ]}
            />

            <ProFormSelect<LanguageOption>
              name="language"
              label="Language"
              placeholder="Select language"
              rules={[{ required: true, message: 'Please select a language' }]}
              options={[
                { label: 'English', value: 'English' },
                { label: 'French', value: 'French' },
              ]}
            />

            <ProFormUploadDragger
              name="documentFile"
              label="Document File"
              max={1}
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[
                { required: true, message: 'Please upload the document file' },
              ]}
              fieldProps={{
                multiple: false,
                beforeUpload: () => false, // pas d'upload auto, on gère tout dans onFinish
                accept: '.pdf,.doc,.docx,.ppt,.pptx,.txt',
              }}
            >
              <div style={{ padding: '24px 0' }}>
                <InboxOutlined style={{ fontSize: 32 }} />
                <div style={{ marginTop: 8 }}>
                  Click or drag file to this area to upload
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                  Supported formats: PDF, DOC/DOCX, PPT/PPTX, TXT (single file).
                </div>
              </div>
            </ProFormUploadDragger>

            <ProFormSwitch
              name="publishNow"
              label="Publish Status"
              fieldProps={{
                checkedChildren: 'Publish Now',
                unCheckedChildren: 'Save as Draft',
              }}
            />
          </ProForm>
        </ProCard>
      </div>
    </PageContainer>
  );
}
