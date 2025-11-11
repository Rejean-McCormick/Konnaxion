'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Switch,
  Button,
  Modal,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface ImpactReportFormValues {
  title: string;
  category?: string;
  period?: [Dayjs, Dayjs];
  amount?: number;
  description?: string;
  attachments?: UploadFile[];
  isPublic?: boolean;
}

export default function SubmitImpactReports(): JSX.Element {
  const [form] = Form.useForm<ImpactReportFormValues>();
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const onFinish = async (values: ImpactReportFormValues) => {
    try {
      setSubmitting(true);
      message.success('Votre rapport a bien été soumis.');
      setOpen(true);
    } catch (e) {
      console.error(e);
      message.error("Échec de l'envoi du rapport.");
    } finally {
      setSubmitting(false);
    }
  };

  const normFile = (e: any): UploadFile[] => {
    if (Array.isArray(e)) return e as UploadFile[];
    return (e?.fileList ?? []) as UploadFile[];
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Soumettre un rapport d’impact</h1>

      <Form<ImpactReportFormValues> form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Titre"
          name="title"
          rules={[{ required: true, message: 'Veuillez saisir un titre.' }]}
        >
          <Input placeholder="Ex. Réduction des émissions Q3" />
        </Form.Item>

        <Form.Item label="Catégorie" name="category">
          <Select
            placeholder="Sélectionner une catégorie"
            options={[
              { label: 'Énergie', value: 'energy' },
              { label: 'Déchets', value: 'waste' },
              { label: 'Eau', value: 'water' },
              { label: 'Communauté', value: 'community' },
            ]}
            allowClear
          />
        </Form.Item>

        <Form.Item label="Période" name="period">
          <RangePicker />
        </Form.Item>

        <Form.Item label="Quantité / Score" name="amount">
          <InputNumber style={{ width: '100%' }} placeholder="Ex. 42" />
        </Form.Item>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Détails, méthodologie, notes…" />
        </Form.Item>

        <Form.Item
          label="Pièces jointes"
          name="attachments"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra="Les fichiers ne sont pas téléversés automatiquement."
        >
          <Upload beforeUpload={() => false} multiple>
            <Button icon={<UploadOutlined />}>Choisir des fichiers</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Rendre public"
          name="isPublic"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Soumettre
          </Button>
        </Form.Item>
      </Form>

      <Modal
        open={open}
        title="Rapport soumis"
        onOk={() => {
          setOpen(false);
          router.push('/keenkonnect/sustainability-impact/sustainability-dashboard');
        }}
        onCancel={() => setOpen(false)}
        okText="OK"
      >
        <p>Votre rapport d’impact a été soumis avec succès.</p>
      </Modal>
    </div>
  );
}
