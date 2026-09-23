// FILE: frontend/app/keenkonnect/workspaces/launch-new-workspace/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ProForm,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
} from '@ant-design/pro-components';
import { Alert, Card } from 'antd';
import React, { Suspense } from 'react';

import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

type LaunchWorkspaceFormValues = {
  name: string;
  team: string;
  tools: string[];
  isPublic: boolean;
};

function Content() {
  const { t: i18nT } = useLanguage();
  return (
    <Card>
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.workspaceCreationPreview")}
        description={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.keenkonnectDoesNotExposeAWorkspacePersistence")}
        style={{ marginBottom: 16 }}
      />
      <ProForm<LaunchWorkspaceFormValues>
        layout="vertical"
        initialValues={{ isPublic: true }}
        onFinish={async () => false}
        submitter={{
          searchConfig: { submitText: 'Launch unavailable' },
          submitButtonProps: { disabled: true },
          resetButtonProps: { disabled: true },
        }}
      >
        <ProFormText
          name="name"
          label={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.nomDeLEspaceDeTravail")}
          placeholder={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.exKeenkonnectQuantumStrategyLab")}
        />
        <ProFormSelect
          name="team"
          label={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.equipeResponsable")}
          placeholder={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.selectionnezUneEquipe")}
          options={[
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.teamAlphaStrategicVision"), value: 'Team Alpha' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.teamBetaQuantumStrategists"), value: 'Team Beta' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.teamGammaInnovationPod"), value: 'Team Gamma' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.specialGuestsInvitedFellows"), value: 'Special Guests' },
          ]}
        />
        <ProFormSelect
          name="tools"
          label={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.outilsEnvironnementsInclus")}
          placeholder={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.choisissezUnOuPlusieursEnvironnements")}
          fieldProps={{ mode: 'multiple' }}
          options={[
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.dataScienceNotebook"), value: 'Data Science Notebook' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.vrLab"), value: 'VR Lab' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.programmingWorkspace"), value: 'Programming Workspace' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.designStudio"), value: 'Design Studio' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.text3dModeling"), value: '3D Modeling' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.virtualWhiteboard"), value: 'Virtual Whiteboard' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.brainstormingHub"), value: 'Brainstorming Hub' },
            { label: i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.prototypingArea"), value: 'Prototyping Area' },
          ]}
        />
        <ProFormSwitch
          name="isPublic"
          label={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.espaceVisibleALEnsembleDeKeenkonnect")}
        />
      </ProForm>
    </Card>
  );
}

export default function PageWrapper() {
  const { t: i18nT } = useLanguage();
  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.launchANewWorkspace")}
      description={i18nT("ui.keenkonnect.workspaces.launchNewWorkspace.previewTheIntendedWorkspaceConfigurationModelPersistence")}
    >
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </KeenPageShell>
  );
}
