'use client'

// File: /pages/konnected/community-discussions/start-new-discussion.tsx
import React from 'react';
import { NextPage } from 'next';
import { Form, Input, Select, Switch, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Option } = Select;

const StartNewDiscussion: NextPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Simulation de la soumission : en production, un appel API sera nécessaire pour créer le thread.
  const onFinish = (values: any) => {
    console.log('New Discussion Data:', values);
    message.success('Votre discussion a été créée avec succès !');
    // Simuler la redirection vers la page de détail du thread créé, par exemple avec l'ID généré.
    router.push(`/konnected/community-discussions/thread/123`);

  return (
    <PageContainer title="Start New Discussion">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          isQuestion: false,
        }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Veuillez saisir le titre de la discussion.' }]}
        >
          <Input placeholder="Entrez le titre de votre discussion" />
        </Form.Item>
        
        <Form.Item
          label="Content"
          name="content"
          rules={[{ required: true, message: 'Veuillez saisir le contenu de la discussion.' }]}
        >
          <Input.TextArea rows={6} placeholder="Rédigez le contenu de votre discussion ici..." />
          {/* Vous pouvez intégrer ici un éditeur riche (ex: React Quill) pour un contenu formaté */}
        </Form.Item>
        
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Veuillez sélectionner une catégorie.' }]}
        >
          <Select placeholder="Choisissez une catégorie">
            <Option value="Math">Math</Option>
            <Option value="Science">Science</Option>
            <Option value="General">General</Option>
            {/* Ajoutez d'autres catégories selon vos besoins */}
          </Select>
        </Form.Item>
        
        <Form.Item label="Is this a question?" name="isQuestion" valuePropName="checked">
          <Switch />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Post Discussion
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default StartNewDiscussion;
