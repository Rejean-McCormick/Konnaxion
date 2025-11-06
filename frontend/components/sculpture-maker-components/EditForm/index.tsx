'use client';

/**
 * Description: Sculpture Edit Page component
 * Author: Hieu Chu
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import Error from 'next/error';
import { Row, Modal, Button, message, notification } from 'antd';
import { ExclamationCircleOutlined, DeleteOutlined } from '@ant-design/icons';

import { CardStyled, ColStyled } from '../style';
import SculptureEdit from './SculptureEdit';
import EditImage from './EditImage';

// NOTE: API legacy import conservé tel que dans la base
import api from '../../../api';
import { normalizeError } from "../../../shared/errors";

const defaultPosition = [-34.40581053569814, 150.87842788963476];
const { confirm } = Modal;

const tabList = [
  { key: 'tab1', tab: 'Edit text details' },
  { key: 'tab2', tab: 'Edit images' },
];

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
  const params = useParams() as { id?: string };
  const sculptureId = params?.id;

  const [initialData, setInitialData] = useState<InitialData | null>(null);
  const [makerList, setMakerList] = useState<any[]>([]);
  const [tabKey, setTabKey] = useState<'tab1' | 'tab2'>('tab1');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<HttpError | null>(null);

  const handleTabChange = (key: 'tab1' | 'tab2') => setTabKey(key);

  const handleDelete = () => {
    confirm({
      title: 'Do you want to remove this sculpture?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: {
        style: { background: '#ff4d4f', borderColor: '#ff4d4f' },
      },
      onOk: async () => {
        try {
          if (!sculptureId) return;
          await api.delete(`/sculpture/${sculptureId}`);
          message.success('Deleted sculpture successfully!', 2);
          router.push('/sculptures');
        } catch (e: any) {
          const { message, statusCode } = normalizeError(e);
          notification.error({
            message: 'Error',
            description:
              "There has been internal server error or the maker you're trying to delete is currently associated with a sculpture.",
          });
        }
      },
    });
  };

  useEffect(() => {
    const fetchInitialForm = async () => {
      if (!sculptureId) return;
      try {
        const data: InitialData = (await api.get(`/sculpture/${sculptureId}`)).data;

        if (data.latitude != null) data.latitude = Number(data.latitude);
        if (data.longitude != null) data.longitude = Number(data.longitude);

        setInitialData({ ...data });

        const makerData = (await api.get('/maker/')).data;
        setMakerList(makerData);
      } catch (e: any) {
        const { message, statusCode } = normalizeError(e);
        const { statusCode, message: msg } = e?.response?.data ?? { statusCode: 500, message: 'Unknown error' };
        setError({ statusCode, message: msg });
      } finally {
        setLoading(false);
      }
    };
    fetchInitialForm();
  }, [sculptureId]);

  if (loading) return null;
  if (error) return <Error statusCode={error.statusCode} title={error.message} />;
  if (!initialData) return null;

  // Tri des images en toute sécurité
  const sortedImages = [...(initialData.images ?? [])].sort(
    (a, b) => new Date(a.created).getTime() - new Date(b.created).getTime()
  );

  return (
    <>
      <Head>
        <title>Edit {initialData.name} - UOW Sculptures</title>
      </Head>
      <Row gutter={16}>
        <ColStyled xs={24}>
          <CardStyled
            title={`Edit details for ${initialData.name}`}
            tabList={tabList}
            activeTabKey={tabKey}
            onTabChange={handleTabChange}
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
                _name={initialData.name} // NOTE: le composant attend `_name` (pas `name`)
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
    </>
  );
};

export { SculptureEditForm };
