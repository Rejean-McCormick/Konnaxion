'use client';
"use client";

// File: /pages/konnected/teams-collaboration/team-builder.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Form,
  Input,
  Button,
  Steps,
  Upload,
  message,
  Avatar,
  Select,
  Space,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Step } = Steps;
const { Option } = Select;

const TeamBuilder: NextPage = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [form] = Form.useForm();

  // Passage à l'étape suivante après validation des champs de l'étape actuelle
  const next = () => {
    form
      .validateFields()
      .then(() => {
        setCurrentStep(currentStep + 1);
      })
      .catch(() => {
        message.error('Veuillez compléter les champs obligatoires.');
      });
  };

  // Retour à l'étape précédente
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Gestion de la soumission du formulaire complet (création de l'équipe)
  const onFinish = (values: any) => {
    const router = useRouter();
    console.log('Team Created:', values);
    message.success('L’équipe a été créée avec succès et les invitations ont été envoyées!');
    // Redirection vers "My Teams"
    router.push('/konnected/teams-collaboration/my-teams');
  };

  // Définition des titres des étapes
  const steps = [
    { title: 'Team Info' },
    { title: 'Invite Members' },
  ];

  return (
    <PageContainer title="Team Builder">
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {currentStep === 0 && (
          <>
            <Form.Item
              label="Team Name"
              name="teamName"
              rules={[{ required: true, message: 'Veuillez saisir le nom de l’équipe.' }]}
            >
              <Input placeholder="Entrez le nom de l’équipe" />
            </Form.Item>
            <Form.Item
              label="Team Purpose/Goal"
              name="teamPurpose"
              rules={[{ required: true, message: 'Veuillez indiquer le but de l’équipe.' }]}
            >
              <Input placeholder="Quel est l’objectif de l’équipe ?" />
            </Form.Item>
            <Form.Item label="Team Description" name="teamDescription">
              <Input.TextArea rows={4} placeholder="Description optionnelle de l’équipe" />
            </Form.Item>
            <Form.Item label="Team Avatar" name="teamAvatar">
              <Upload name="avatar" listType="picture" maxCount={1}>
                <Button icon={<UploadOutlined />}>Télécharger un avatar</Button>
              </Upload>
            </Form.Item>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Form.List name="invitedMembers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space
                      key={field.key}
                      align="baseline"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, 'email']}
                        fieldKey={[field.fieldKey, 'email']}
                        rules={[{ required: true, message: 'Veuillez saisir l’email du membre' }]}
                      >
                        <Input placeholder="Email du membre" />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'role']}
                        fieldKey={[field.fieldKey, 'role']}
                        rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
                      >
                        <Select placeholder="Rôle" style={{ width: 120 }}>
                          <Option value="Member">Member</Option>
                          <Option value="Co-Lead">Co-Lead</Option>
                        </Select>
                      </Form.Item>
                      <Button type="link" onClick={() => remove(field.name)}>
                        Supprimer
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                      Ajouter un membre
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>

            {/* Prévisualisation des membres invités via Avatar.Group */}
            {form.getFieldValue('invitedMembers') &&
              form.getFieldValue('invitedMembers').length > 0 && (
                <Form.Item label="Invited Members Preview">
                  <Avatar.Group>
                    {form.getFieldValue('invitedMembers').map((member: any, index: number) => (
                      <Avatar key={index} style={{ backgroundColor: '#87d068' }}>
                        {member.email.charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </Avatar.Group>
                </Form.Item>
              )}
          </>
        )}

        <Form.Item>
          <Space>
            {currentStep > 0 && <Button onClick={prev}>Précédent</Button>}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Suivant
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit">
                Créer l’équipe
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

TeamBuilder.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default TeamBuilder;
