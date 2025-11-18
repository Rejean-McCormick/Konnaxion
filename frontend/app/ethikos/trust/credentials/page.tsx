// app/ethikos/trust/credentials/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Divider,
  List,
  Result,
  Space,
  Steps,
  Tag,
  Typography,
  Upload,
  message as antdMessage,
} from 'antd';
import {
  InboxOutlined,
  SafetyCertificateOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import usePageTitle from '@/hooks/usePageTitle';
import { uploadCredential } from '@/services/trust';

const { Text, Paragraph } = Typography;

export default function Credentials() {
  usePageTitle('Trust · Credentials');

  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | undefined>();

  const currentStep = done ? 2 : uploading ? 1 : 0;

  const uploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.pdf,.jpg,.jpeg,.png',
    beforeUpload: (file: any) => {
      const isAllowedType =
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png';

      if (!isAllowedType) {
        antdMessage.error('Only PDF, JPG or PNG files are allowed.');
        return Upload.LIST_IGNORE;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        antdMessage.error('File must be smaller than 5 MB.');
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    customRequest: async ({ file, onSuccess, onError }: any) => {
      try {
        setUploading(true);
        setLastFileName((file as File).name);
        await uploadCredential(file as File);
        onSuccess?.('ok');
        setDone(true);
        antdMessage.success('Credential uploaded. It will be reviewed shortly.');
      } catch (error) {
        onError?.(error);
        antdMessage.error('Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
  };

  return (
    <PageContainer ghost>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message={
          <Space>
            <SafetyCertificateOutlined />
            <span>Optional but powerful trust signal</span>
            <Tag color="blue">Beta</Tag>
          </Space>
        }
        description={
          <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
            Upload real‑world credentials (certifications, professional memberships, academic
            records) that help stewards understand why your voice carries expertise in certain
            debates. These documents are reviewed manually and do not replace community‑based
            reputation.
          </Paragraph>
        }
      />

      <ProCard gutter={16} wrap>
        <ProCard
          colSpan={{ xs: 24, lg: 14 }}
          title="Upload a new credential"
          bordered
          extra={<Tag color="default">Private review only</Tag>}
        >
          {done ? (
            <Result
              status="success"
              title="Credential received"
              subTitle={
                <>
                  {lastFileName && (
                    <div>
                      <Text strong>{lastFileName}</Text>
                      <br />
                    </div>
                  )}
                  <Text>
                    Your document is now queued for human review. If accepted, it will appear as a
                    verified note in your Ethikos trust profile.
                  </Text>
                </>
              }
              extra={
                <Space wrap>
                  <Button type="primary" onClick={() => setDone(false)}>
                    Upload another
                  </Button>
                  <Link href="/ethikos/trust/profile">
                    <Button>View my trust profile</Button>
                  </Link>
                  <Link href="/ethikos/trust/badges">
                    <Button type="text">See my badges</Button>
                  </Link>
                </Space>
              }
            />
          ) : (
            <>
              <Upload.Dragger {...uploadProps} disabled={uploading}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag a credential file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Supported formats: PDF, JPG, PNG · Max 5 MB · One document at a time.
                </p>
              </Upload.Dragger>

              <Divider />

              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text type="secondary">
                  Tip: upload focused evidence rather than full CVs. For example, a single
                  certification for climate policy is more helpful than a long résumé.
                </Text>
                <Text type="secondary">
                  You can always complement these documents with activity‑based reputation earned
                  through debates, voting and impact work.
                </Text>
              </Space>
            </>
          )}
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, lg: 10 }}
          title="How credentials fit into Ethikos trust"
          bordered
        >
          <Steps
            direction="vertical"
            size="small"
            current={currentStep}
            items={[
              {
                title: 'Upload',
                description: 'You submit a credential associated with your real‑world expertise.',
              },
              {
                title: 'Review',
                description:
                  'Stewards or administrators verify authenticity and relevance for debate topics.',
                icon: <ClockCircleOutlined />,
              },
              {
                title: 'Outcome',
                description:
                  'If accepted, a note is added to your profile and may influence role assignments.',
              },
            ]}
          />

          <Divider />

          <List
            size="small"
            header="Examples of accepted credentials"
            dataSource={[
              'Professional licensure (e.g. bar membership, medical board certification).',
              'Academic degrees in fields relevant to debates you join.',
              'Official appointments or advisory roles in public institutions.',
              'Peer‑reviewed publications or major reports where you are a named author.',
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text>{item}</Text>
              </List.Item>
            )}
          />

          <Divider />

          <List
            size="small"
            header={
              <Space>
                <EyeInvisibleOutlined />
                <span>Privacy and scope</span>
              </Space>
            }
            dataSource={[
              'Uploaded documents are only visible to designated reviewers, not to the general public.',
              'Metadata (type of credential, issuing body, year) may be surfaced in your profile once verified.',
              'You can request removal of a credential at any time once backend support exists.',
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text type="secondary">{item}</Text>
              </List.Item>
            )}
          />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
