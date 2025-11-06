'use client'

// File: /pages/kreative/creative-hub/submit-creative-work.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Alert,
  message,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { TextArea } = Input;
const { Option } = Select;

const SubmitCreativeWork: NextPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  // Local state to manage file uploads if needed.
  const [fileList, setFileList] = useState<any[]>([]);

  // Handler for file changes in the Upload component.
  const handleUploadChange = (info: any) => {
    // Optionally, manage file upload status and fileList locally.
    let newFileList = [...info.fileList];
    // You might add further validations on file type/size here.
    setFileList(newFileList);

  const onFinish = (values: any) => {
    // Combine form values with file upload information.
    const creativeWorkData = {
      ...values,
      // Here we simply include file info; in practice, the file(s) might need uploading to a server.
      file: fileList,
    console.log('Submitted Creative Work:', creativeWorkData);
    message.success('Votre œuvre créative a été soumise avec succès et est en attente d\'approbation!');
    // After submission, optionally redirect to the newly created work’s detail page or the gallery.
    router.push('/kreative/creative-hub/inspiration-gallery');

  return (
    <PageContainer title="Submit Creative Work">
      {/* Guidelines Alert */}
      <Alert
        message="Please Note"
        description="File size limit is 5MB. Accepted formats are JPG, PNG for images, MP4 for videos, and MP3 for audio."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          category: 'Illustration',
        }}
      >
        {/* Title Field */}
        <Form.Item
          label="Title of the Work"
          name="title"
          rules={[{ required: true, message: 'Veuillez saisir le titre de votre œuvre.' }]}
        >
          <Input placeholder="Entrez le titre de votre œuvre créative" />
        </Form.Item>

        {/* Description Field */}
        <Form.Item
          label="Description or Story Behind the Work"
          name="description"
          rules={[{ required: true, message: 'Veuillez fournir une description ou une histoire.' }]}
        >
          <TextArea rows={5} placeholder="Décrivez votre œuvre et partagez son histoire..." />
        </Form.Item>

        {/* Category / Medium Field */}
        <Form.Item
          label="Category / Medium"
          name="category"
          rules={[{ required: true, message: 'Veuillez sélectionner une catégorie.' }]}
        >
          <Select placeholder="Sélectionnez le type de contenu">
            <Option value="Illustration">Illustration</Option>
            <Option value="Photography">Photography</Option>
            <Option value="Music">Music</Option>
            <Option value="Video">Video</Option>
            <Option value="Digital Art">Digital Art</Option>
            {/* Add more options as needed */}
          </Select>
        </Form.Item>

        {/* File Upload Field */}
        <Form.Item
          label="Upload Creative File"
          name="creativeFile"
          rules={[
            {
              required: true,
              message: 'Veuillez télécharger un fichier pour votre œuvre.',
            },
          ]}
        >
          <Upload
            beforeUpload={() => false} // Prevent automatic upload so that the file is handled on form submission.
            fileList={fileList}
            onChange={handleUploadChange}
            accept="image/*,video/*,audio/*"
          >
            <Button icon={<UploadOutlined />}>Click to Upload</Button>
          </Upload>
        </Form.Item>

        {/* Optional Credits/Tools Used Field */}
        <Form.Item label="Credits / Tools Used (Optional)" name="credits">
          <Input placeholder="Exemple: Adobe Photoshop, Procreate, etc." />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Work
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default SubmitCreativeWork;
