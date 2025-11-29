// FILE: frontend/app/keenkonnect/workspaces/launch-new-workspace/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Card, Result, Button, message } from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormSwitch,
} from '@ant-design/pro-components';
import api from '@/api';
import KeenPage from '@/app/keenkonnect/KeenPageShell';

type LaunchWorkspaceFormValues = {
  name: string;
  team: string;
  tools: string[];
  isPublic: boolean;
};

function Content() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [lastValues, setLastValues] = useState<LaunchWorkspaceFormValues | null>(null);

  const handleFinish = async (values: LaunchWorkspaceFormValues) => {
    try {
      await api.post('/workspaces/launch', values);
      setLastValues(values);
      setSubmitted(true);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      message.error("Échec du lancement de l'espace de travail. Veuillez réessayer.");
      return false;
    }
  };

  const handleLaunchAnother = () => {
    setSubmitted(false);
    setLastValues(null);
  };

  const pageTitle = 'Launch a New Workspace';
  const pageDescription =
    "Configurez un nouvel espace de travail collaboratif pour votre équipe : choisissez l’équipe responsable, les outils inclus et la visibilité de l’espace.";

  return (
    <>
      <Head>
        <title>KeenKonnect – Launch New Workspace</title>
      </Head>

      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">{pageTitle}</h1>
        <p className="text-gray-500 mb-6">{pageDescription}</p>

        <Card>
          {submitted && lastValues ? (
            <Result
              status="success"
              title="Espace de travail lancé avec succès"
              subTitle={`L'espace « ${lastValues.name} » est maintenant prêt pour votre équipe.`}
              extra={[
                <Button type="primary" key="again" onClick={handleLaunchAnother}>
                  Lancer un autre espace
                </Button>,
                <Button
                  key="workspaces"
                  onClick={() => router.push('/keenkonnect/workspaces/my-workspaces')}
                >
                  Voir mes espaces de travail
                </Button>,
              ]}
            />
          ) : (
            <ProForm<LaunchWorkspaceFormValues>
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{
                isPublic: true,
              }}
              submitter={{
                searchConfig: {
                  submitText: "Lancer l'espace",
                },
              }}
            >
              {/* Nom de l’espace */}
              <ProFormText
                name="name"
                label="Nom de l’espace de travail"
                placeholder="ex. KeenKonnect Quantum Strategy Lab"
                rules={[
                  { required: true, message: 'Veuillez donner un nom à cet espace.' },
                ]}
              />

              {/* Équipe responsable */}
              <ProFormSelect
                name="team"
                label="Équipe responsable"
                placeholder="Sélectionnez une équipe"
                options={[
                  { label: 'Team Alpha – Strategic Vision', value: 'Team Alpha' },
                  { label: 'Team Beta – Quantum Strategists', value: 'Team Beta' },
                  { label: 'Team Gamma – Innovation Pod', value: 'Team Gamma' },
                  { label: 'Special Guests – Invited Fellows', value: 'Special Guests' },
                ]}
                rules={[
                  {
                    required: true,
                    message: 'Veuillez sélectionner une équipe responsable.',
                  },
                ]}
              />

              {/* Outils & environnements (multi‑select) */}
              <ProFormSelect
                name="tools"
                label="Outils & environnements inclus"
                placeholder="Choisissez un ou plusieurs environnements"
                fieldProps={{
                  mode: 'multiple',
                }}
                options={[
                  { label: 'Data Science Notebook', value: 'Data Science Notebook' },
                  { label: 'VR Lab', value: 'VR Lab' },
                  { label: 'Programming Workspace', value: 'Programming Workspace' },
                  { label: 'Design Studio', value: 'Design Studio' },
                  { label: '3D Modeling', value: '3D Modeling' },
                  { label: 'Virtual Whiteboard', value: 'Virtual Whiteboard' },
                  { label: 'Brainstorming Hub', value: 'Brainstorming Hub' },
                  { label: 'Prototyping Area', value: 'Prototyping Area' },
                ]}
                rules={[
                  {
                    required: true,
                    message: 'Veuillez choisir au moins un outil ou environnement.',
                  },
                ]}
              />

              {/* Visibilité */}
              <ProFormSwitch
                name="isPublic"
                label="Espace visible à l’ensemble de KeenKonnect"
                tooltip="Quand activé, les membres de KeenKonnect pourront découvrir cet espace et demander à le rejoindre."
              />
            </ProForm>
          )}
        </Card>
      </div>
    </>
  );
}

export default function PageWrapper() {
  return <KeenPage title="Page" description="">(
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    )</KeenPage>;
}
