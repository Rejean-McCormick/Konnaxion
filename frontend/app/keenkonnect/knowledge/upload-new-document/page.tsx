// FILE: frontend/app/keenkonnect/knowledge/upload-new-document/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { InboxOutlined } from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
  ProFormUploadDragger,
} from '@ant-design/pro-components';
import { Alert } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React from 'react';

import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

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
const normFile = (event: unknown): UploadFile[] => {
  if (Array.isArray(event)) return event as UploadFile[];
  if (event && typeof event === 'object' && 'fileList' in event) {
    const fileList = (event as { fileList?: unknown }).fileList;
    return Array.isArray(fileList) ? (fileList as UploadFile[]) : [];
  }
  return [];
};

export default function UploadNewDocumentPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const handleFinish = async (): Promise<boolean> => {
    // Declared read-only: no general knowledge-document upload contract exists.
    return false;
  };

  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.uploadNewDocument")}
      description={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.addANewKnowledgeAssetToKeenkonnect")}
      metaTitle={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.keenkonnectKnowledgeUploadDocument")}
    >
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.documentUploadUnavailable")}
        description={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.thisFormIsRetainedAsADeclared")}
        style={{ marginBottom: 16 }}
      />
      <ProCard>
        <ProForm<UploadDocumentFormValues>
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            publishNow: true,
          }}
          submitter={{
            searchConfig: {
              submitText: 'Upload unavailable',
              resetText: 'Reset',
            },
            submitButtonProps: {
              disabled: true,
              type: 'primary',
              title: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.unavailableUntilAKnowledgeDocumentPersistenceContract"),
            },
          }}
        >
          <ProFormText
            name="title"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.documentTitle")}
            placeholder={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.enterDocumentTitle")}
            rules={[
              { required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseEnterADocumentTitle") },
              { max: 200, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.titleIsTooLong") },
            ]}
          />

          <ProFormTextArea
            name="description"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.descriptionAbstract")}
            placeholder={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.shortSummaryOfTheDocumentContents")}
            fieldProps={{ rows: 4 }}
            rules={[
              { required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseProvideADescriptionOrAbstract") },
            ]}
          />

          <ProFormSelect<CategoryOption>
            name="category"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.categoryTopic")}
            placeholder={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.selectACategory")}
            rules={[{ required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseSelectACategoryTopic") }]}
            options={[
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.robotics"), value: 'Robotics' },
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.healthcare"), value: 'Healthcare' },
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.technology"), value: 'Technology' },
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.energy"), value: 'Energy' },
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.education"), value: 'Education' },
            ]}
          />

          <ProFormText
            name="version"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.version")}
            placeholder={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.eG10")}
            rules={[
              { required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseSpecifyTheDocumentVersion") },
            ]}
          />

          <ProFormSelect<LanguageOption>
            name="language"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.language")}
            placeholder={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.selectLanguage")}
            rules={[{ required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseSelectALanguage") }]}
            options={[
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.english"), value: 'English' },
              { label: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.french"), value: 'French' },
            ]}
          />

          <ProFormUploadDragger
            name="documentFile"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.documentFile")}
            max={1}
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              { required: true, message: i18nT("ui.keenkonnect.knowledge.uploadNewDocument.pleaseUploadTheDocumentFile") },
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
                {i18nT("ui.keenkonnect.knowledge.uploadNewDocument.clickOrDragFileToThisArea")}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                {i18nT("ui.keenkonnect.knowledge.uploadNewDocument.supportedFormatsPdfDocDocxPptPptx")}
              </div>
            </div>
          </ProFormUploadDragger>

          <ProFormSwitch
            name="publishNow"
            label={i18nT("ui.keenkonnect.knowledge.uploadNewDocument.publishStatus")}
            fieldProps={{
              checkedChildren: 'Publish Now',
              unCheckedChildren: 'Save as Draft',
            }}
          />
        </ProForm>
      </ProCard>
    </KeenPageShell>
  );
}
