'use client';

import React from 'react';
import { Form, Checkbox, Select, Button, Alert, Divider } from 'antd';
import PageContainer from '@/components/PageContainer';

// --- Données (échantillon minimal) -----------------------------------------
// TODO: Remplacer par la liste complète (le fichier concat avait des "..." tronquant la liste)
const expertiseOptions: string[] = [
  'Frontend Development',
  'UI/UX Design',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'QA',
  'Project Management',
];

const currentExpertiseInitial: string[] = ['Frontend Development', 'UI/UX Design'];

// Champs que l’utilisateur peut ajouter (échantillon)
const selectableFields: string[] = ['React', 'TypeScript', 'Figma', 'GraphQL', 'Node.js'];

// Niveaux de visibilité
const visibilityLevels = [
  { label: 'Public', value: 'public' as const },
  { label: 'Team only', value: 'team-only' as const },
  { label: 'Private', value: 'private' as const },
];

// Types du formulaire
type FormValues = {
  currentExpertise: string[];
  newExpertise?: string[];        // si vous avez un groupe/Select pour "nouvelles expertises"
  newFields?: string[];           // champs complémentaires (Select multiple)
  visibility: 'public' | 'team-only' | 'private';
};

export default function Page(): JSX.Element {
  const [form] = Form.useForm<FormValues>();

  const onFinish = (values: FormValues) => {
    // TODO: branchement API / action serveur si nécessaire
    console.log('Manage Expertise Areas - submit:', values);
  };

  return (
    <PageContainer title="Manage Expertise Areas">
      <Divider orientation="left">Your current expertise</Divider>

      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          currentExpertise: currentExpertiseInitial,
          visibility: 'team-only',
          newFields: [],
        }}
        onFinish={onFinish}
      >
        {/* Expertise actuelles */}
        <Form.Item
          name="currentExpertise"
          label="Current expertise"
          rules={[{ required: true, message: 'Please select at least one expertise.' }]}
        >
          <Checkbox.Group options={expertiseOptions} />
        </Form.Item>

        {/* Nouvelles expertises (si applicable) */}
        {/* 
        <Form.Item name="newExpertise" label="Add new expertise (optional)">
          <Checkbox.Group options={expertiseOptions} />
        </Form.Item>
        */}

        {/* Champs complémentaires à ajouter */}
        <Form.Item name="newFields" label="Select new fields (optional)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select fields…"
            options={selectableFields.map(f => ({ label: f, value: f }))}
          />
        </Form.Item>

        {/* Visibilité du profil / des expertises */}
        <Form.Item
          name="visibility"
          label="Visibility"
          rules={[{ required: true, message: 'Please choose a visibility level.' }]}
        >
          <Select
            placeholder="Choose visibility…"
            options={visibilityLevels}
          />
        </Form.Item>

        {/* Info */}
        <Alert
          message="Note: Adding an expertise may require validation through contributions."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
