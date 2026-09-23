// FILE: frontend/app/ethikos/trust/credentials/page.tsx
// app/ethikos/trust/credentials/page.tsx
'use client';

/**
 * Sources used to build this implementation:
 * - Baseline page from the app dump (existing upload flow, alert, steps content).
 * - Trust services showing `uploadCredential` helper (currently a stub without a real backend).
 */

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClockCircleOutlined,
  EyeInvisibleOutlined,
  FileTextOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProDescriptions,
  type ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  message as antdMessage,
  Button,
  Divider,
  Drawer,
  List,
  Popconfirm,
  Result,
  Space,
  Steps,
  Tag,
  Tooltip,
  Typography,
  Upload,
  type UploadProps,
} from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { type Credential, uploadCredential } from '@/services/trust';

/* ---------------------------------------------
 * Types & local helpers
 * ------------------------------------------- */

type CredentialStatus = 'Verified' | 'Pending' | 'Rejected';

type CredentialRow = Credential & {
  status: CredentialStatus;
  notes?: string;
};

const statusColor: Record<CredentialStatus, string> = {
  Verified: 'green',
  Pending: 'gold',
  Rejected: 'red',
};

function toTitleFromFilename(i18nT: TranslateFunction, name?: string): string {
  if (!name) return i18nT("ui.ethikos.trust.credentials.untitledCredential");
  return name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[_\-]+/g, ' ').trim();
}

/* ---------------------------------------------
 * Data fetching (no backend yet → returns mock)
 * When backend is ready, replace the body with a GET
 * using the shared axios helper, e.g.:
 *   const { items } = await get<{items: CredentialRow[]}>('trust/credentials')
 * ------------------------------------------- */
async function fetchUserCredentials(): Promise<CredentialRow[]> {
  // Mocked examples to drive the UI until the real endpoint exists.
  return [
    {
      id: 'cred-001',
      title: 'MSc Climate Policy',
      issuer: 'London School of Economics',
      issuedAt: '2022-09-01T00:00:00.000Z',
      url: 'https://example.org/lse-msc.pdf',
      status: 'Verified',
      notes: 'Verified by steward #42',
    },
    {
      id: 'cred-002',
      title: 'Professional Engineer (P.Eng.)',
      issuer: 'PEO',
      issuedAt: '2021-03-15T00:00:00.000Z',
      status: 'Pending',
      notes: 'Queued for human review',
    },
    {
      id: 'cred-003',
      title: 'Research Fellow – Energy Policy',
      issuer: 'Policy Institute',
      issuedAt: '2020-01-10T00:00:00.000Z',
      status: 'Rejected',
      notes: 'Insufficient documentation',
    },
  ];
}

/* ---------------------------------------------
 * Component
 * ------------------------------------------- */

const { Text, Paragraph } = Typography;

export default function Credentials() {
  const { t: i18nT } = useLanguage();
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastFileName, setLastFileName] = useState<string | undefined>();
  const [detail, setDetail] = useState<CredentialRow | null>(null);

  // Existing stepper UX: 0=Upload, 1=Review, 2=Outcome
  const currentStep = done ? 2 : uploading ? 1 : 0;

  // List of existing credentials (mocked for now; see fetcher above).
  const { data, loading, refresh, mutate } = useRequest<CredentialRow[], []>(
    fetchUserCredentials,
  );

  const rows = data ?? [];

  // Quick counters
  const counters = useMemo(() => {
    const verified = rows.filter((r) => r.status === 'Verified').length;
    const pending = rows.filter((r) => r.status === 'Pending').length;
    const rejected = rows.filter((r) => r.status === 'Rejected').length;
    return { verified, pending, rejected, total: rows.length };
  }, [rows]);

  const summaryTags = (
    <Space wrap>
      <Tag key="total">{i18nT("ui.ethikos.trust.credentials.total")} {counters.total}</Tag>
      <Tag color="green" key="v">
        {i18nT("ui.ethikos.trust.credentials.verified")} {counters.verified}
      </Tag>
      <Tag color="gold" key="p">
        {i18nT("ui.ethikos.trust.credentials.pending")} {counters.pending}
      </Tag>
      <Tag color="red" key="r">
        {i18nT("ui.ethikos.trust.credentials.rejected")} {counters.rejected}
      </Tag>
    </Space>
  );

  // Upload handler, wired to services/trust::uploadCredential
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.pdf,.jpg,.jpeg,.png',
    beforeUpload: (file) => {
      const isAllowedType =
        file.type === 'application/pdf' ||
        file.type === 'image/jpeg' ||
        file.type === 'image/png';

      if (!isAllowedType) {
        antdMessage.error(i18nT("ui.ethikos.trust.credentials.onlyPdfJpgOrPngFilesAre"));
        return Upload.LIST_IGNORE;
      }

      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        antdMessage.error(i18nT("ui.ethikos.trust.credentials.fileMustBeSmallerThan5Mb"));
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    // Match Ant Design's expected `(options) => void` signature
    customRequest: (options) => {
      const { file, onSuccess, onError } = options;
      const uploadFile = file as File;

      setUploading(true);
      setLastFileName(uploadFile.name);

      uploadCredential(uploadFile)
        .then(() => {
          onSuccess?.('ok');

          // Optimistic insert into the table list as "Pending"
          const optimistic: CredentialRow = {
            id: `tmp-${Date.now()}`,
            title: toTitleFromFilename(i18nT, uploadFile.name),
            issuer: '—',
            issuedAt: new Date().toISOString(),
            status: 'Pending',
            notes: 'Awaiting manual verification',
          };
          mutate([optimistic, ...rows]);
          setDone(true);
          antdMessage.success(
            i18nT("ui.ethikos.trust.credentials.credentialUploadedItWillBeReviewedShortly"),
          );
        })
        .catch((error: unknown) => {
          const uploadError =
            error instanceof Error ? error : new Error('Credential upload failed');
          onError?.(uploadError);
          antdMessage.error(i18nT("ui.ethikos.trust.credentials.uploadFailedPleaseTryAgain"));
        })
        .finally(() => {
          setUploading(false);
        });
    },
  };

  // Table columns
  const columns: ProColumns<CredentialRow>[] = [
    {
      title: i18nT("ui.ethikos.trust.credentials.title"),
      dataIndex: 'title',
      ellipsis: true,
      render: (_, row: CredentialRow) => (
        <Space size={6}>
          <FileTextOutlined />
          {row.url ? (
            <a href={row.url} target="_blank" rel="noreferrer">
              {row.title}
            </a>
          ) : (
            <span>{row.title}</span>
          )}
        </Space>
      ),
    },
    { title: i18nT("ui.ethikos.trust.credentials.issuer"), dataIndex: 'issuer', width: 220, ellipsis: true },
    {
      title: i18nT("ui.ethikos.trust.credentials.issued"),
      dataIndex: 'issuedAt',
      width: 140,
      valueType: 'date',
      renderText: (v) => dayjs(v).format('YYYY-MM-DD'),
    },
    {
      title: i18nT("ui.ethikos.trust.credentials.status"),
      dataIndex: 'status',
      width: 120,
      valueEnum: {
        Verified: { text: i18nT("ui.ethikos.trust.credentials.verified_aed3b8"), status: 'Success' },
        Pending: { text: i18nT("ui.ethikos.trust.credentials.pending_96f608"), status: 'Processing' },
        Rejected: { text: i18nT("ui.ethikos.trust.credentials.rejected_27eeb7"), status: 'Error' },
      },
      render: (_, row: CredentialRow) => (
        <Tag color={statusColor[row.status]}>{row.status}</Tag>
      ),
    },
    {
      title: i18nT("ui.ethikos.trust.credentials.actions"),
      width: 260,
      valueType: 'option',
      render: (_, row: CredentialRow) => {
        const canDownload = !!row.url;
        return [
          <Button size="small" key="view" onClick={() => setDetail(row)}>
            {i18nT("ui.ethikos.trust.credentials.view")}
          </Button>,
          <Button
            size="small"
            key="download"
            disabled={!canDownload}
            href={row.url}
            target="_blank"
            rel="noreferrer"
          >
            {i18nT("ui.ethikos.trust.credentials.download")}
          </Button>,
          row.status !== 'Rejected' ? (
            <Popconfirm
              key="remove"
              title={i18nT("ui.ethikos.trust.credentials.requestRemoval")}
              description={i18nT("ui.ethikos.trust.credentials.aStewardWillReviewAndRemoveThis")}
              onConfirm={() => {
                antdMessage.success(i18nT("ui.ethikos.trust.credentials.removalRequestSubmitted"));
              }}
            >
              <Button size="small" danger>
                {i18nT("ui.ethikos.trust.credentials.requestRemoval_c0b533")}
              </Button>
            </Popconfirm>
          ) : (
            <Tooltip
              key="resubmit"
              title={i18nT("ui.ethikos.trust.credentials.attachAdditionalDocumentsAndReSubmit")}
            >
              <Button
                size="small"
                type="dashed"
                onClick={() => {
                  antdMessage.info(
                    i18nT("ui.ethikos.trust.credentials.reSubmitByUploadingAnUpdatedDocument"),
                  );
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {i18nT("ui.ethikos.trust.credentials.reSubmit")}
              </Button>
            </Tooltip>
          ),
        ];
      },
    },
  ];

  const pageBody = (
    <PageContainer ghost>
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message={
          <Space>
            <SafetyCertificateOutlined />
            <span>{i18nT("ui.ethikos.trust.credentials.optionalButPowerfulTrustSignal")}</span>
            <Tag color="blue">{i18nT("ui.ethikos.trust.credentials.beta")}</Tag>
          </Space>
        }
        description={
          <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
            {i18nT("ui.ethikos.trust.credentials.uploadRealWorldCredentialsCertificationsProfessionalMemberships")}
          </Paragraph>
        }
      />

      <ProCard gutter={16} wrap>
        <ProCard
          colSpan={{ xs: 24, lg: 14 }}
          title={i18nT("ui.ethikos.trust.credentials.uploadANewCredential")}
          bordered
          extra={<Tag color="default">{i18nT("ui.ethikos.trust.credentials.privateReviewOnly")}</Tag>}
        >
          {done ? (
            <Result
              status="success"
              title={i18nT("ui.ethikos.trust.credentials.credentialReceived")}
              subTitle={
                <>
                  {lastFileName && (
                    <div>
                      <Text strong>{lastFileName}</Text>
                      <br />
                    </div>
                  )}
                  <Text>
                    {i18nT("ui.ethikos.trust.credentials.yourDocumentIsNowQueuedForHuman")}
                  </Text>
                </>
              }
              extra={
                <Space wrap>
                  <Button type="primary" onClick={() => setDone(false)}>
                    {i18nT("ui.ethikos.trust.credentials.uploadAnother")}
                  </Button>
                  <Link href="/ethikos/trust/profile">
                    <Button>{i18nT("ui.ethikos.trust.credentials.viewMyTrustProfile")}</Button>
                  </Link>
                  <Link href="/ethikos/trust/badges">
                    <Button type="text">{i18nT("ui.ethikos.trust.credentials.seeMyBadges")}</Button>
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
                  {i18nT("ui.ethikos.trust.credentials.clickOrDragACredentialFileTo")}
                </p>
                <p className="ant-upload-hint">
                  {i18nT("ui.ethikos.trust.credentials.supportedFormatsPdfJpgPngMax5")}
                </p>
              </Upload.Dragger>

              <Divider />

              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Text type="secondary">
                  {i18nT("ui.ethikos.trust.credentials.tipUploadFocusedEvidenceRatherThanFull")}
                </Text>
                <Text type="secondary">
                  {i18nT("ui.ethikos.trust.credentials.youCanAlwaysComplementTheseDocumentsWith")}
                </Text>
              </Space>
            </>
          )}
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, lg: 10 }}
          title={i18nT("ui.ethikos.trust.credentials.howCredentialsFitIntoEthikosTrust")}
          bordered
        >
          <Steps
            direction="vertical"
            size="small"
            current={currentStep}
            items={[
              {
                title: i18nT("ui.ethikos.trust.credentials.upload"),
                description:
                  i18nT("ui.ethikos.trust.credentials.youSubmitACredentialAssociatedWithYour"),
              },
              {
                title: i18nT("ui.ethikos.trust.credentials.review"),
                description:
                  i18nT("ui.ethikos.trust.credentials.stewardsOrAdministratorsVerifyAuthenticityAndRelevance"),
                icon: <ClockCircleOutlined />,
              },
              {
                title: i18nT("ui.ethikos.trust.credentials.outcome"),
                description:
                  i18nT("ui.ethikos.trust.credentials.ifAcceptedANoteIsAddedTo"),
              },
            ]}
          />

          <Divider />

          <List
            size="small"
            header={i18nT("ui.ethikos.trust.credentials.examplesOfAcceptedCredentials")}
            dataSource={[
              'Professional licensure (e.g. bar membership, medical board certification).',
              'Academic degrees in fields relevant to debates you join.',
              'Official appointments or advisory roles in public institutions.',
              'Peer-reviewed publications or major reports where you are a named author.',
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
                <span>{i18nT("ui.ethikos.trust.credentials.privacyAndScope")}</span>
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

        <ProCard colSpan={24} title={i18nT("ui.ethikos.trust.credentials.myCredentials")} ghost>
          <ProTable<CredentialRow>
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{ pageSize: 5, showSizeChanger: true }}
            search={false}
            toolBarRender={() => [
              <Tooltip key="refresh" title={i18nT("ui.ethikos.trust.credentials.refresh")}>
                <Button onClick={() => refresh()}>{i18nT("ui.ethikos.trust.credentials.refresh")}</Button>
              </Tooltip>,
            ]}
          />
        </ProCard>
      </ProCard>

      <Drawer
        open={!!detail}
        width={520}
        title={i18nT("ui.ethikos.trust.credentials.credentialDetails")}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <ProDescriptions<CredentialRow>
            column={1}
            dataSource={detail}
            columns={
              [
                { title: i18nT("ui.ethikos.trust.credentials.title"), dataIndex: 'title' },
                { title: i18nT("ui.ethikos.trust.credentials.issuer"), dataIndex: 'issuer' },
                {
                  title: i18nT("ui.ethikos.trust.credentials.issued"),
                  dataIndex: 'issuedAt',
                  render: (_: ReactNode, row: CredentialRow) =>
                    dayjs(row.issuedAt).format('YYYY-MM-DD'),
                },
                {
                  title: i18nT("ui.ethikos.trust.credentials.status"),
                  dataIndex: 'status',
                  render: (_: ReactNode, row: CredentialRow) => (
                    <Tag color={statusColor[row.status]}>{row.status}</Tag>
                  ),
                },
                detail.url
                  ? {
                      title: i18nT("ui.ethikos.trust.credentials.document"),
                      dataIndex: 'url',
                      render: (_: ReactNode, row: CredentialRow) => (
                        <a href={row.url} target="_blank" rel="noreferrer">
                          {i18nT("ui.ethikos.trust.credentials.openDocument")}
                        </a>
                      ),
                    }
                  : undefined,
                detail.notes
                  ? {
                      title: i18nT("ui.ethikos.trust.credentials.notes"),
                      dataIndex: 'notes',
                    }
                  : undefined,
              ].filter(Boolean) as ProDescriptionsItemProps<CredentialRow>[]
            }
          />
        )}
      </Drawer>
    </PageContainer>
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.trust.credentials.credentials")}
      sectionLabel={i18nT("ui.ethikos.trust.credentials.trust")}
      subtitle={i18nT("ui.ethikos.trust.credentials.uploadAndManageRealWorldCredentialsThat")}
      secondaryActions={summaryTags}
    >
      {pageBody}
    </EthikosPageShell>
  );
}