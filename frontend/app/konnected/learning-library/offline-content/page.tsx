// app/konnected/learning-library/offline-content/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Tag,
  Progress,
  Table,
  Switch,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  message as antdMessage,
  Empty,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import {
  DownloadOutlined,
  SyncOutlined,
  DeleteOutlined,
  PlusOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import api from '@/api';

const { Paragraph, Text } = Typography;
const { Option } = Select;
const { Statistic } = StatisticCard;

// ---- Domain types ---------------------------------------------------------

type OfflinePackageStatus = 'scheduled' | 'building' | 'ready' | 'failed';

interface OfflinePackage {
  id: number | string;
  name: string;
  description?: string;
  status: OfflinePackageStatus;
  itemCount: number;
  totalSizeMb: number;
  lastBuiltAt?: string | null;
  targetDeviceType?: 'laptop' | 'tablet' | 'usb' | 'other';
  autoSync?: boolean;
  // Optional: when a build is in progress
  buildProgressPercent?: number;
  lastErrorMessage?: string | null;
}

type ResourceType = 'article' | 'video' | 'lesson' | 'quiz' | 'dataset';

interface OfflineableResource {
  id: number | string;
  title: string;
  type: ResourceType;
  subject?: string;
  level?: string;
  language?: string;
  sizeMb?: number;
  offlineEligible: boolean;
  includedInPackages?: string[]; // package names / IDs for quick display
}

interface CreateOfflinePackagePayload {
  name: string;
  description?: string;
  targetDeviceType?: OfflinePackage['targetDeviceType'];
  maxSizeMb?: number;
  includeTypes?: ResourceType[];
  subjectFilter?: string;
  levelFilter?: string;
  languageFilter?: string;
}

// ---- API helpers ----------------------------------------------------------
// NOTE: Endpoint paths/response wrappers are inferred.
// Align them with schema-endpoints.json when wiring to the real backend.

const OFFLINE_PACKAGE_LIST_ENDPOINT =
  '/konnected/knowledge/offline-packages/';
const OFFLINE_PACKAGE_DETAIL_ENDPOINT = (id: OfflinePackage['id']) =>
  `/konnected/knowledge/offline-packages/${id}/`;
const OFFLINE_PACKAGE_SYNC_ENDPOINT = (id: OfflinePackage['id']) =>
  `/konnected/knowledge/offline-packages/${id}/sync/`;
const OFFLINE_RESOURCES_ENDPOINT =
  '/konnected/knowledge/offline-resources/';

function normalizeList<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];

  if (raw && typeof raw === 'object') {
    const obj = raw as { results?: unknown; items?: unknown };
    if (Array.isArray(obj.results)) return obj.results as T[];
    if (Array.isArray(obj.items)) return obj.items as T[];
  }

  return [];
}

async function fetchOfflinePackages(): Promise<OfflinePackage[]> {
  const res = await api.get(OFFLINE_PACKAGE_LIST_ENDPOINT);
  // res is treated as having a `data` field of unknown shape
  return normalizeList<OfflinePackage>((res as { data: unknown }).data);
}

async function fetchOfflineableResources(): Promise<OfflineableResource[]> {
  const res = await api.get(OFFLINE_RESOURCES_ENDPOINT);
  return normalizeList<OfflineableResource>((res as { data: unknown }).data);
}

async function createOfflinePackage(
  payload: CreateOfflinePackagePayload,
): Promise<void> {
  await api.post(OFFLINE_PACKAGE_LIST_ENDPOINT, payload);
}

async function deleteOfflinePackage(id: OfflinePackage['id']): Promise<void> {
  await api.delete(OFFLINE_PACKAGE_DETAIL_ENDPOINT(id));
}

async function syncOfflinePackage(id: OfflinePackage['id']): Promise<void> {
  await api.post(OFFLINE_PACKAGE_SYNC_ENDPOINT(id));
}

// ---- Component ------------------------------------------------------------

export default function OfflineContentPage(): JSX.Element {
  // Data fetching
  const {
    data: packages,
    loading: loadingPackages,
    refresh: reloadPackages,
  } = useRequest<OfflinePackage[], []>(fetchOfflinePackages);

  const {
    data: resources,
    loading: loadingResources,
  } = useRequest<OfflineableResource[], []>(fetchOfflineableResources);

  // Local UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [syncingId, setSyncingId] = useState<OfflinePackage['id'] | null>(null);
  const [deletingId, setDeletingId] = useState<OfflinePackage['id'] | null>(
    null,
  );
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);

  const [createForm] = Form.useForm<CreateOfflinePackagePayload>();

  const packageList = packages ?? [];
  const resourceList = resources ?? [];

  // ---- Derived stats ------------------------------------------------------

  const totalPackages = packageList.length;
  const readyPackages = packageList.filter((p) => p.status === 'ready').length;
  const buildingPackages = packageList.filter(
    (p) => p.status === 'building' || p.status === 'scheduled',
  ).length;
  const failedPackages = packageList.filter(
    (p) => p.status === 'failed',
  ).length;

  const totalSizeMb = useMemo(
    () =>
      packageList.reduce(
        (acc, pkg) => acc + (Number(pkg.totalSizeMb) || 0),
        0,
      ),
    [packageList],
  );

  const eligibleResourcesCount = resourceList.filter(
    (r) => r.offlineEligible,
  ).length;

  // ---- Handlers -----------------------------------------------------------

  const handleOpenCreateModal = () => {
    createForm.resetFields();
    setIsCreateModalOpen(true);
  };

  const handleCreatePackage = async (values: CreateOfflinePackagePayload) => {
    try {
      setCreating(true);
      await createOfflinePackage(values);
      antdMessage.success('Offline package scheduled successfully.');
      setIsCreateModalOpen(false);
      await reloadPackages();
    } catch (err) {
      antdMessage.error('Failed to create offline package. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleConfirmDelete = async (pkg: OfflinePackage) => {
    Modal.confirm({
      title: 'Remove offline package?',
      content:
        'This will remove the offline package configuration. Already-cached content on devices may remain until cleared manually.',
      okText: 'Remove',
      okButtonProps: { danger: true, loading: deletingId === pkg.id },
      onOk: async () => {
        try {
          setDeletingId(pkg.id);
          await deleteOfflinePackage(pkg.id);
          antdMessage.success('Offline package removed.');
          await reloadPackages();
        } catch (err) {
          antdMessage.error(
            'Failed to remove the offline package. Please try again.',
          );
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleSyncPackage = async (pkg: OfflinePackage) => {
    try {
      setSyncingId(pkg.id);
      await syncOfflinePackage(pkg.id);
      antdMessage.success('Sync started. It will continue in the background.');
      await reloadPackages();
    } catch (err) {
      antdMessage.error('Failed to start sync. Please try again.');
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    if (!packageList.length) {
      antdMessage.info('There are no offline packages to sync yet.');
      return;
    }

    try {
      setSyncingId('__all__');
      await Promise.all(packageList.map((pkg) => syncOfflinePackage(pkg.id)));
      antdMessage.success('Sync started for all packages.');
      await reloadPackages();
    } catch (err) {
      antdMessage.error('Failed to start sync for all packages.');
    } finally {
      setSyncingId(null);
    }
  };

  const hasAnySyncInProgress =
    syncingId !== null ||
    packageList.some((p) => p.status === 'building' || p.status === 'scheduled');

  const handleToggleDeviceAutoSync = (checked: boolean) => {
    // This flag is local to this device for now.
    setAutoSyncEnabled(checked);
    antdMessage.success(
      checked
        ? 'Auto-sync enabled on this device.'
        : 'Auto-sync disabled on this device.',
    );
  };

  // ---- Table columns ------------------------------------------------------

  const resourceColumns: ColumnsType<OfflineableResource> = [
    {
      title: 'Title',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 110,
      render: (value: ResourceType) => (
        <Tag color="blue" key={value}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      width: 110,
    },
    {
      title: 'Language',
      dataIndex: 'language',
      width: 110,
    },
    {
      title: 'Size (MB)',
      dataIndex: 'sizeMb',
      width: 110,
      render: (value?: number) =>
        typeof value === 'number' ? value.toFixed(1) : '—',
    },
    {
      title: 'Offline status',
      dataIndex: 'offlineEligible',
      width: 160,
      render: (_: unknown, row: OfflineableResource) =>
        row.offlineEligible ? (
          <Tag color="green">Eligible</Tag>
        ) : (
          <Tag color="default">Online only</Tag>
        ),
    },
    {
      title: 'Packages',
      dataIndex: 'includedInPackages',
      width: 200,
      ellipsis: true,
      render: (value?: string[]) =>
        value && value.length ? value.join(', ') : '—',
    },
  ];

  // ---- Rendering helpers --------------------------------------------------

  const renderStatusTag = (status: OfflinePackageStatus) => {
    switch (status) {
      case 'ready':
        return <Tag color="green">Ready</Tag>;
      case 'building':
        return <Tag color="processing">Building</Tag>;
      case 'scheduled':
        return <Tag color="gold">Scheduled</Tag>;
      case 'failed':
        return (
          <Tag color="red">
            <WarningOutlined /> Failed
          </Tag>
        );
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const renderDeviceLabel = (pkg: OfflinePackage) => {
    const type = pkg.targetDeviceType ?? 'other';
    const labelMap: Record<NonNullable<OfflinePackage['targetDeviceType']>, string> =
      {
        laptop: 'Laptop or desktop',
        tablet: 'Tablet',
        usb: 'USB drive / external media',
        other: 'Generic device',
      };
    return labelMap[type] ?? 'Device';
  };

  // ---- JSX ----------------------------------------------------------------

  return (
    <>
      <Head>
        <title>KonnectED – Offline Content</title>
      </Head>

      <KonnectedPageShell
        title="Offline Content Packages"
        subtitle={
          <>
            Define and monitor offline bundles for low-connectivity environments.
            Packages are built on the server using the weekly cron schedule
            (currently <code>OFFLINE_PACKAGE_CRON = 0 3 * * SUN</code>).
          </>
        }
        primaryAction={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreateModal}>
            New offline package
          </Button>
        }
        secondaryActions={
          <Space size="middle">
            <Tooltip title="When enabled, this device will automatically pull updates for ready packages.">
              <Space>
                <Text>Auto-sync on this device</Text>
                <Switch checked={autoSyncEnabled} onChange={handleToggleDeviceAutoSync} />
              </Space>
            </Tooltip>
            <Button
              icon={<SyncOutlined />}
              onClick={handleSyncAll}
              disabled={hasAnySyncInProgress || !packageList.length}
              loading={syncingId === '__all__'}
            >
              {hasAnySyncInProgress ? 'Sync in progress…' : 'Sync all'}
            </Button>
          </Space>
        }
      >
        {/* Top statistics panel */}
        <ProCard ghost gutter={16} style={{ marginBottom: 24 }}>
          <StatisticCard
            statistic={{
              title: 'Total packages',
              value: totalPackages,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Ready for download',
              value: readyPackages,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Building / scheduled',
              value: buildingPackages,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Failed',
              value: failedPackages,
              valueStyle: failedPackages ? { color: 'red' } : undefined,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Approx. disk usage (MB)',
              value: totalSizeMb.toFixed(1),
            }}
          />
        </ProCard>

        {/* Layout: left = packages, right = resources */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card
              title="Offline packages"
              extra={
                <Tag icon={<DownloadOutlined />} color="blue">
                  Offline mode
                </Tag>
              }
              loading={loadingPackages}
            >
              {packageList.length === 0 ? (
                <Empty
                  description={
                    <>
                      <div>No offline packages yet.</div>
                      <div>
                        Use “New offline package” to schedule content bundles for
                        schools or communities with limited connectivity.
                      </div>
                    </>
                  }
                />
              ) : (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {packageList.map((pkg) => (
                    <Card
                      key={pkg.id}
                      size="small"
                      bordered
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong>{pkg.name}</Text>
                          {pkg.description && (
                            <Text type="secondary" ellipsis>
                              {pkg.description}
                            </Text>
                          )}
                        </Space>
                      }
                      extra={renderStatusTag(pkg.status)}
                    >
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: '100%' }}
                      >
                        <Space size="middle" wrap>
                          <Text type="secondary">
                            Target device: {renderDeviceLabel(pkg)}
                          </Text>
                          <Text type="secondary">
                            Items: <Text strong>{pkg.itemCount}</Text>
                          </Text>
                          <Text type="secondary">
                            Size: <Text strong>{pkg.totalSizeMb.toFixed(1)} MB</Text>
                          </Text>
                        </Space>

                        {pkg.lastBuiltAt && (
                          <Text type="secondary">
                            Last built: {new Date(pkg.lastBuiltAt).toLocaleString()}
                          </Text>
                        )}

                        {pkg.status === 'building' &&
                          typeof pkg.buildProgressPercent === 'number' && (
                            <Progress
                              percent={pkg.buildProgressPercent}
                              status="active"
                              size="small"
                            />
                          )}

                        {pkg.status === 'failed' && pkg.lastErrorMessage && (
                          <Alert
                            type="error"
                            showIcon
                            message="Last build failed"
                            description={pkg.lastErrorMessage}
                          />
                        )}

                        <Space style={{ marginTop: 8 }}>
                          <Button
                            type="primary"
                            icon={<SyncOutlined />}
                            onClick={() => handleSyncPackage(pkg)}
                            disabled={
                              pkg.status === 'building' ||
                              pkg.status === 'scheduled' ||
                              syncingId === pkg.id
                            }
                            loading={syncingId === pkg.id}
                          >
                            {pkg.status === 'ready' ? 'Sync updates' : 'Build now'}
                          </Button>
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleConfirmDelete(pkg)}
                            disabled={deletingId === pkg.id}
                          >
                            Remove
                          </Button>
                        </Space>
                      </Space>
                    </Card>
                  ))}
                </Space>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card
              title="Offline-eligible resources"
              loading={loadingResources}
              extra={
                <Text type="secondary">
                  Eligible for bundling: {eligibleResourcesCount} resources
                </Text>
              }
            >
              {resourceList.length === 0 ? (
                <Empty description="No resources found yet." />
              ) : (
                <Table<OfflineableResource>
                  rowKey="id"
                  size="small"
                  columns={resourceColumns}
                  dataSource={resourceList}
                  pagination={{ pageSize: 8 }}
                />
              )}
            </Card>
          </Col>
        </Row>

        {/* Creation modal */}
        <Modal
          title="New offline package"
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
          destroyOnClose
          okText="Create package"
          okButtonProps={{ loading: creating }}
          onOk={() => createForm.submit()}
        >
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Select filters and constraints for this offline bundle. The backend
            will resolve concrete resources and schedule builds according to the
            global offline cron.
          </Paragraph>

          <Form<CreateOfflinePackagePayload>
            form={createForm}
            layout="vertical"
            onFinish={handleCreatePackage}
            initialValues={{
              targetDeviceType: 'laptop',
              maxSizeMb: 2048,
              includeTypes: ['article', 'video', 'lesson'],
            }}
          >
            <Form.Item
              label="Package name"
              name="name"
              rules={[{ required: true, message: 'Please enter a package name.' }]}
            >
              <Input placeholder="e.g. Robotics basics – offline pack for School A" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea
                rows={3}
                placeholder="Short description for administrators and field teams."
              />
            </Form.Item>

            <Form.Item label="Target device type" name="targetDeviceType">
              <Select>
                <Option value="laptop">Laptop / desktop (lab PCs)</Option>
                <Option value="tablet">Tablet devices</Option>
                <Option value="usb">USB drive / external media</Option>
                <Option value="other">Other / mixed devices</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <Space>
                  Maximum bundle size (MB)
                  <Tooltip title="Helps avoid exceeding storage on low-spec devices. Backend enforces final limits.">
                    <WarningOutlined />
                  </Tooltip>
                </Space>
              }
              name="maxSizeMb"
              rules={[
                {
                  type: 'number',
                  transform: (v) => (v === '' ? undefined : Number(v)),
                  min: 0,
                  message: 'Please enter a valid size in MB.',
                },
              ]}
            >
              <Input placeholder="e.g. 2048" type="number" min={0} />
            </Form.Item>

            <Form.Item label="Include resource types" name="includeTypes">
              <Select mode="multiple" placeholder="Select one or more types">
                <Option value="article">Articles</Option>
                <Option value="video">Videos</Option>
                <Option value="lesson">Lessons</Option>
                <Option value="quiz">Quizzes</Option>
                <Option value="dataset">Datasets</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Subject filter" name="subjectFilter">
              <Input placeholder="Optional subject filter, e.g. Robotics" />
            </Form.Item>

            <Form.Item label="Level filter" name="levelFilter">
              <Input placeholder="Optional level filter, e.g. Beginner" />
            </Form.Item>

            <Form.Item label="Language filter" name="languageFilter">
              <Input placeholder="Optional language filter, e.g. English" />
            </Form.Item>
          </Form>
        </Modal>
      </KonnectedPageShell>
    </>
  );
}
