'use client';

/**
 * Description: Sculpture Edit Page component
 * Author: Hieu Chu
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Row, Modal, Button, message as antdMessage, notification, Result  } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';

import { CardStyled, ColStyled } from '../style';
import SculptureEdit from './SculptureEdit';
import EditImage from './EditImage';

// NOTE: API legacy import conservé tel que dans la base
import api from '../../../api';
import { normalizeError } from '../../../shared/errors';

const defaultPosition: [number, number] = [-34.40581053569814, 150.87842788963476];
const { confirm } = Modal;

const tabList = [
  { key: 'tab1', tab: 'Edit text details' },
  { key: 'tab2', tab: 'Edit images' },
] as const;

type TabKey = (typeof tabList)[number]['key'];

type Maker = {
  firstName?: string;
  lastName?: string;
  wikiUrl?: string;
  birthYear?: number | null;
  deathYear?: number | null;
  nationality?: string | null;
};

type ImageItem = {
  id: string | number;
  url: string;
  created: string;
};

type InitialData = {
  accessionId: string;
  name: string;
  images: ImageItem[];
  latitude?: number | null;
  longitude?: number | null;
  primaryMaker?: Maker;
};

type HttpError = { statusCode: number; message: string };

const SculptureEditForm = () => {
  const router = useRouter();
  const params = useParams<{ id?: string; sculptureId?: string }>();
  const searchParams = useSearchParams();

  // Prefer dynamic segment names, then fallback to query ?id=
  const sculptureId = useMemo(
    () => params?.sculptureId ?? params?.id ?? searchParams.get('id') ?? undefined,
    [params, searchParams]
  );

  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [makerList, setMakerList] = useState<Maker[]>([]);
  const [tabKey, setTabKey] = useState<TabKey>('tab1');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HttpError | null>(null);

  const handleTabChange = (key: TabKey) => setTabKey(key);

  const handleDelete = () => {
    confirm({
      title: 'Do you want to remove this sculpture?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: { style: { background: '#ff4d4f', borderColor: '#ff4d4f' } },
      onOk: async () => {
        try {
          if (!sculptureId) return;
          await api.delete(`/sculpture/${sculptureId}`);
          antdMessage.success('Deleted sculpture successfully!', 2);
          router.push('/sculptures');
        } catch (e: unknown) {
          const { message: errMsg } = normalizeError(e);
          notification.error({
            message: 'Delete failed',
            description: errMsg || 'Unexpected error while deleting the sculpture.',
          });
        }
      },
    });
  };

  useEffect(() => {
    const fetchInitialForm = async () => {
      if (!sculptureId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<InitialData>(`/sculpture/${sculptureId}`);
        const next: InitialData = {
          ...data,
          latitude: data.latitude != null ? Number(data.latitude) : data.latitude ?? null,
          longitude: data.longitude != null ? Number(data.longitude) : data.longitude ?? null,
          images: Array.isArray(data.images) ? data.images : [],
        };
        setInitialData(next);

        const makersRes = await api.get<Maker[]>('/maker/');
        setMakerList(Array.isArray(makersRes.data) ? makersRes.data : []);
      } catch (e: unknown) {
        const { statusCode = 500, message: errMsg = 'Unknown error' } = normalizeError(e);
        setError({ statusCode, message: errMsg });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialForm();
  }, [sculptureId]);

  if (loading) return null;

  if (error) {
    const status = (['404', '403', '500'] as const).includes(String(error.statusCode) as any)
      ? (String(error.statusCode) as '404' | '403' | '500')
      : 'error';
    return (
      <Result
        status={status}
        title={error.message}
        subTitle={`Error ${error.statusCode}`}
        extra={
          <Button type="primary" onClick={() => router.back()}>
            Go Back
          </Button>
        }
      />
    );
  }

  if (!initialData) return null;

  const sortedImages: ImageItem[] = [...(initialData.images ?? [])].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled
          title={`Edit details for ${initialData.name}`}
          tabList={tabList as unknown as { key: string; tab: string }[]}
          activeTabKey={tabKey}
          onTabChange={handleTabChange as (key: string) => void}
          extra={
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          }
        >
          <div style={{ display: tabKey === 'tab1' ? 'block' : 'none' }}>
            <SculptureEdit
              defaultPosition={defaultPosition}
              initialData={{ ...initialData, images: sortedImages }}
              makerList={makerList}
              setMakerList={setMakerList}
            />
          </div>

          <div style={{ display: tabKey === 'tab2' ? 'block' : 'none' }}>
            <EditImage
              accessionId={initialData.accessionId}
              _name={initialData.name} // NOTE: the component expects `_name`
              images={sortedImages.map((img) => ({
                ...img,
                uid: img.id,
                thumbUrl: img.url,
                preview: img.url,
                status: 'done',
              }))}
            />
          </div>
        </CardStyled>
      </ColStyled>
    </Row>
  );
};

export { SculptureEditForm };
