'use client'

// pages/konnected/learning-paths/create-learning-path/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Form, Input, Select, Button, Modal, List, Card, Space, Divider, message, Result } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { TextArea } = Input;

interface StepItem {
  id: string;
  resourceName: string;
  resourceType: string;
  note: string;
}

// Exemples de ressources disponibles (dummy)
const availableResources = [
  { id: 'r1', name: 'Introduction to HTML', type: 'Lesson' },
  { id: 'r2', name: 'CSS Fundamentals', type: 'Lesson' },
  { id: 'r3', name: 'JavaScript Basics', type: 'Lesson' },
  { id: 'r4', name: 'Responsive Design Techniques', type: 'Article' },
  { id: 'r5', name: 'React Overview', type: 'Video' },
];

const CreateLearningPath: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  
  // État pour les informations de base
  const [basicInfo, setBasicInfo] = useState({
    pathTitle: '',
    description: '',
    targetAudience: '',
  });

  // Liste des étapes du parcours
  const [steps, setSteps] = useState<StepItem[]>([]);

  // État pour la modal d'ajout/édition de step
  const [stepModalVisible, setStepModalVisible] = useState(false);
  // Permet de savoir si l'on édite un step existant (index) ou si on ajoute un nouveau step (null)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [stepForm] = Form.useForm();

  // État final de soumission du parcours
  const [submitted, setSubmitted] = useState(false);

  // Ouvrir la modal pour ajouter un nouveau step
  const openAddStepModal = () => {
    setEditingStepIndex(null);
    stepForm.resetFields();
    setStepModalVisible(true);
  };

  // Ouvrir la modal pour éditer un step existant
  const openEditStepModal = (index: number) => {
    setEditingStepIndex(index);
    const step = steps[index];
    stepForm.setFieldsValue({
      resourceId: step.id,
      note: step.note,
    });
    setStepModalVisible(true);
  };

  // Gestion de la soumission du step (ajout ou édition)
  const handleStepModalOk = async () => {
    try {
      const values = await stepForm.validateFields();
      // Trouver la ressource sélectionnée pour récupérer le nom et type
      const resource = availableResources.find(r => r.id === values.resourceId);
      if (!resource) {
        message.error('Selected resource not found.');
        return;
      }
      const newStep: StepItem = {
        id: resource.id,
        resourceName: resource.name,
        resourceType: resource.type,
        note: values.note || '',
      };
      if (editingStepIndex !== null) {
        // Edition d'une étape existante
        const updatedSteps = [...steps];
        updatedSteps[editingStepIndex] = newStep;
        setSteps(updatedSteps);
      } else {
        // Ajout d'une nouvelle étape
        setSteps(prev => [...prev, newStep]);
      }
      setStepModalVisible(false);
    } catch (error) {
      message.error('Please complete the step form.');
    }
  };

  const handleStepModalCancel = () => {
    setStepModalVisible(false);
  };

  // Fonctions pour réordonner les steps
  const moveStepUp = (index: number) => {
    if (index === 0) return;
    const updatedSteps = [...steps];
    [updatedSteps[index - 1], updatedSteps[index]] = [updatedSteps[index], updatedSteps[index - 1]];
    setSteps(updatedSteps);
  };

  const moveStepDown = (index: number) => {
    if (index === steps.length - 1) return;
    const updatedSteps = [...steps];
    [updatedSteps[index + 1], updatedSteps[index]] = [updatedSteps[index], updatedSteps[index + 1]];
    setSteps(updatedSteps);
  };

  // Supprimer une étape
  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  // Soumission finale du parcours
  const onSubmitPath = async () => {
    try {
      const basicValues = await form.validateFields();
      setBasicInfo(basicValues);
      // Ici, simuler un appel API pour sauvegarder le parcours
      console.log('Learning Path Submitted:', {
        basicInfo: basicValues,
        steps,
      });
      setSubmitted(true);
    } catch (error) {
      message.error('Please complete the basic information form.');
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-5">
        <Result
          status="success"
          title="Learning Path Created Successfully!"
          subTitle="Your new learning path has been published."
          extra={[
            <Button key="view" type="primary" onClick={() => router.push('/konnected/learning-paths/my-learning-path')}>
              View Learning Path
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Learning Path</title>
        <meta name="description" content="Create a new learning path by ordering and linking educational resources." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Create Learning Path</h1>
        {/* Formulaire pour les informations de base */}
        <Card className="mb-6">
          <Form form={form} layout="vertical">
            <Form.Item
              name="pathTitle"
              label="Path Title"
              rules={[{ required: true, message: 'Please enter the learning path title.' }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true, message: 'Please enter a description.' }]}
            >
              <TextArea rows={4} placeholder="Enter description" />
            </Form.Item>
            <Form.Item
              name="targetAudience"
              label="Target Audience"
              rules={[{ required: true, message: 'Please specify the target audience.' }]}
            >
              <Input placeholder="e.g., Beginners, Advanced learners" />
            </Form.Item>
          </Form>
        </Card>

        {/* Editeur de steps */}
        <Card className="mb-6" title="Learning Path Steps">
          <Button type="dashed" icon={<PlusOutlined />} onClick={openAddStepModal} style={{ marginBottom: 16 }}>
            Add Step
          </Button>
          {steps.length === 0 ? (
            <p>No steps added yet. Click "Add Step" to start building your learning path.</p>
          ) : (
            <List
              dataSource={steps}
              renderItem={(step, index) => (
                <List.Item
                  actions={[
                    <Button icon={<ArrowUpOutlined />} onClick={() => moveStepUp(index)} disabled={index === 0} />,
                    <Button icon={<ArrowDownOutlined />} onClick={() => moveStepDown(index)} disabled={index === steps.length - 1} />,
                    <Button icon={<EditOutlined />} onClick={() => openEditStepModal(index)} />,
                    <Button icon={<DeleteOutlined />} danger onClick={() => removeStep(index)} />,
                  ]}
                >
                  <List.Item.Meta
                    title={`${index + 1}. ${step.resourceName} (${step.resourceType})`}
                    description={step.note || 'No additional notes.'}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>

        <Divider />

        {/* Bouton de soumission du parcours */}
        <Button type="primary" onClick={onSubmitPath}>
          Save & Publish Path
        </Button>
      </div>

      {/* Modal pour Ajouter/Éditer une étape */}
      <Modal
        title={editingStepIndex !== null ? "Edit Step" : "Add New Step"}
        visible={stepModalVisible}
        onOk={handleStepModalOk}
        onCancel={handleStepModalCancel}
      >
        <Form form={stepForm} layout="vertical">
          <Form.Item
            name="resourceId"
            label="Select Resource"
            rules={[{ required: true, message: 'Please select a resource.' }]}
          >
            <Select placeholder="Select a resource">
              {availableResources.map(resource => (
                <Option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="note" label="Add a Note (optional)">
            <Input placeholder="Enter any instructions or additional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

CreateLearningPath.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default CreateLearningPath;
