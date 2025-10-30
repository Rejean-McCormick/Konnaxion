import React from 'react';
import { NextPage } from 'next';
import { Form, Checkbox, Select, Button, Alert, Divider } from 'antd';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Option } = Select;

const ManageExpertiseAreas: NextPage = () => {
  const [form] = Form.useForm();

  // Données initiales : expertises déjà sélectionnées par l'utilisateur
  const currentExpertiseInitial: string[] = ['Frontend Development', 'UI/UX Design'];

  // Liste complète des domaines d'expertise disponibles
  const expertiseOptions: string[] = [
    'Frontend Development',
    'Backend Development',
    'UI/UX Design',
    'Data Science',
    'DevOps',
    'Mobile Development',
    'QA',
    'Project Management',
  ];

  // Gestion de la soumission : intégration d'une API ou logique de mise à jour
  const onFinish = (values: any) => {
    console.log('Updated Expertise Areas:', values);
    // Traitement complémentaire
  };

  return (
    <PageContainer title="Manage Expertise Areas">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          currentExpertise: currentExpertiseInitial,
          newExpertise: [],
        }}
        onFinish={onFinish}
      >
        {/* Liste des expertises actuelles */}
        <Form.Item label="Current Expertise Areas" name="currentExpertise">
          <Checkbox.Group>
            {expertiseOptions.map((option) => (
              <Checkbox key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </Checkbox.Group>
        </Form.Item>

        <Divider />

        {/* Sélecteur pour ajouter de nouvelles expertises */}
        <Form.Item
          label="Add New Expertise Area"
          name="newExpertise"
          tooltip="Adding an expertise area will require validation through contributions."
        >
          <Select mode="multiple" placeholder="Select new expertise areas to add" allowClear>
            {expertiseOptions
              .filter((opt) => !currentExpertiseInitial.includes(opt))
              .map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
          </Select>
        </Form.Item>

        {/* Message informatif */}
        <Alert
          message="Note: Adding an expertise will require validation through contributions."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Bouton pour sauvegarder */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

// Correction : envelopper la page dans MainLayout
ManageExpertiseAreas.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ManageExpertiseAreas;
