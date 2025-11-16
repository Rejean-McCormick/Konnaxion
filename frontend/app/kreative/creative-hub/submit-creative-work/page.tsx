// C:\MyCode\Konnaxionv14\frontend\app\kreative\creative-hub\submit-creative-work\page.tsx
'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  message as antdMessage,
  Alert,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import KreativePageShell from '@/app/kreative/kreativePageShell';

type CreativeWorkFormValues = {
  title: string;
  description: string;
  category: string;
  credits?: string;
  creativeFile: UploadFile[];
};

// Type minimal utile pour le onChange d'Upload (évite implicit any)
type UploadChangeParamLite = {
  fileList: UploadFile[];
};

export default function SubmitCreativeWorkPage(): JSX.Element {
  const [form] = Form.useForm<CreativeWorkFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();

  const handleUploadChange = (info: UploadChangeParamLite) => {
    setFileList(info.fileList);
  };

  // Normalise l'évènement Upload pour AntD Form
  const normFile = (e: UploadChangeParamLite | UploadFile[]) => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  const onFinish = async (values: CreativeWorkFormValues) => {
    if (!fileList.length) {
      antdMessage.error('Veuillez joindre au moins un fichier.');
      return;
    }
    try {
      // TODO: remplacer par l'appel API réel d’envoi
      // await api.submitCreativeWork(values, fileList)
      antdMessage.success('Création envoyée avec succès !');
      router.push('/kreative/dashboard');
    } catch {
      antdMessage.error("Erreur lors de l'envoi. Réessayez.");
    }
  };

  return (
    <KreativePageShell
      title="Submit Creative Work"
      subtitle="Share your creative work with the community."
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message="Partagez votre travail créatif avec la communauté."
      />

      <Form<CreativeWorkFormValues> layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g., Generative sculpture series" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please add a description' }]}
        >
          <Input.TextArea rows={4} placeholder="What did you make? How? Why?" />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please pick a category' }]}
        >
          <Select placeholder="Choose one">
            <Select.Option value="art">Art</Select.Option>
            <Select.Option value="design">Design</Select.Option>
            <Select.Option value="music">Music</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Upload"
          name="creativeFile"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            {
              validator: (_, value: UploadFile[]) =>
                value && value.length
                  ? Promise.resolve()
                  : Promise.reject(new Error('Please attach at least one file')),
            },
          ]}
        >
          <Upload
            beforeUpload={() => false} // empêche l’upload auto, on laisse le form gérer
            multiple
            onChange={handleUploadChange}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>Select file(s)</Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Credits" name="credits">
          <Input placeholder="Collaborators, references, tools…" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </KreativePageShell>
  );
}
