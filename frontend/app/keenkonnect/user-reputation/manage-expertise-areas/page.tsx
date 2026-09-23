// FILE: frontend/app/keenkonnect/user-reputation/manage-expertise-areas/page.tsx
﻿'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { ProForm, ProFormSelect } from '@ant-design/pro-components';
import { Alert, Divider, Form, List, Rate, Space, Tag, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

const { Text, Paragraph } = Typography;
const { CheckableTag } = Tag;

type Visibility = 'public' | 'team-only' | 'private';

type FormValues = {
  currentExpertise: string[];
  newFields?: string[];
  visibility: Visibility;
};

interface ExpertiseItem {
  key: string;
  label: string;
  description: string;
  defaultLevel: number; // 1–5, for Rate
}

// Catalogue d’expertises disponibles dans KeenKonnect
const EXPERTISE_CATALOG: ExpertiseItem[] = [
  {
    key: 'frontend',
    label: 'Frontend Development',
    description:
      'React, TypeScript, modern component patterns and design systems.',
    defaultLevel: 4.5,
  },
  {
    key: 'backend',
    label: 'Backend Development',
    description:
      'APIs, microservices, Node.js / Python, data modelling & reliability.',
    defaultLevel: 4,
  },
  {
    key: 'uiux',
    label: 'UI/UX Design',
    description:
      'User journeys, wireframes, interactive prototypes, design systems.',
    defaultLevel: 4.5,
  },
  {
    key: 'data-science',
    label: 'Data Science',
    description:
      'Exploratory analysis, ML models, dashboards, decision support.',
    defaultLevel: 3.5,
  },
  {
    key: 'devops',
    label: 'DevOps',
    description:
      'CI/CD, observability, infrastructure-as-code, cloud environments.',
    defaultLevel: 3.5,
  },
  {
    key: 'mobile',
    label: 'Mobile Development',
    description:
      'Native & cross-platform apps, performance and offline patterns.',
    defaultLevel: 3,
  },
  {
    key: 'qa',
    label: 'QA',
    description: 'Testing strategy, automation, regression & release quality.',
    defaultLevel: 3.5,
  },
  {
    key: 'pm',
    label: 'Project Management',
    description:
      'Roadmapping, stakeholder alignment, agile delivery and rituals.',
    defaultLevel: 4,
  },
];

const CURRENT_EXPERTISE_INITIAL: string[] = [
  'Frontend Development',
  'UI/UX Design',
];

const SELECTABLE_FIELDS: string[] = [
  'React',
  'Next.js',
  'TypeScript',
  'Figma',
  'GraphQL',
  'Node.js',
  'Cypress',
  'Jest',
];

const VISIBILITY_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.public"), value: 'public' as const },
  { label: i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.teamOnly"), value: 'team-only' as const },
  { label: i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.private"), value: 'private' as const },
]);

export default function ManageExpertiseAreasPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<FormValues>();

  // Gestion interne de la sélection via Tag.CheckableTag
  const [selectedTags, setSelectedTags] = useState<string[]>(
    CURRENT_EXPERTISE_INITIAL,
  );

  // Liste pour l’aperçu (List + Rate) basée sur les tags sélectionnés
  const previewExpertise = useMemo(
    () => EXPERTISE_CATALOG.filter((item) => selectedTags.includes(item.label)),
    [selectedTags],
  );

  const handleTagChange = (label: string, checked: boolean) => {
    const nextSelected = checked
      ? Array.from(new Set([...selectedTags, label]))
      : selectedTags.filter((tag) => tag !== label);

    setSelectedTags(nextSelected);
    form.setFieldsValue({ currentExpertise: nextSelected });
  };

  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.manageExpertiseAreas")}
      description={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.declareAndFineTuneTheExpertiseAreas")}
      metaTitle={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.keenkonnectManageExpertiseAreas")}
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.declareAndFineTuneTheExpertiseAreas")}
      </Paragraph>

      <Divider orientation="left">{i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.yourExpertiseProfile")}</Divider>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.expertiseEditingIsADeclaredReadOnly")}
        description={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.expertiseSourceStateBelongsToEkohThis")}
      />

      {/* Formulaire principal avec ProForm + ProFormSelect */}
      <ProForm<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          currentExpertise: CURRENT_EXPERTISE_INITIAL,
          visibility: 'team-only',
          newFields: [],
        }}
        submitter={{
          searchConfig: {
            submitText: 'Save unavailable',
          },
          submitButtonProps: { disabled: true },
          resetButtonProps: { disabled: true },
          render: (_, dom) => <div style={{ marginTop: 16 }}>{dom}</div>,
        }}
      >
        {/* Sélection des expertises actuelles via Tag.CheckableTag */}
        <Form.Item
          name="currentExpertise"
          label={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.currentExpertiseAreas")}
          rules={[
            {
              required: true,
              message: i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.pleaseSelectAtLeastOneExpertiseArea"),
            },
          ]}
        >
          <div style={{ marginBottom: 8 }}>
            {EXPERTISE_CATALOG.map((item) => (
              <CheckableTag
                key={item.key}
                checked={selectedTags.includes(item.label)}
                onChange={(checked) => handleTagChange(item.label, checked)}
                style={{ marginBottom: 8 }}
              >
                {item.label}
              </CheckableTag>
            ))}
          </div>
        </Form.Item>

        {/* ProFormSelect pour affiner / ajouter des champs précis */}
        <ProFormSelect
          name="newFields"
          label={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.addOrRefineFieldsOptional")}
          mode="multiple"
          placeholder={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.selectSpecificTechnologiesToolsOrDomains")}
          allowClear
          options={SELECTABLE_FIELDS.map((field) => ({
            label: field,
            value: field,
          }))}
        />

        {/* ProFormSelect pour la visibilité du profil d’expertise */}
        <ProFormSelect
          name="visibility"
          label={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.visibilityOfYourExpertise")}
          placeholder={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.chooseWhoCanViewYourExpertiseProfile")}
          options={VISIBILITY_OPTIONS(i18nT)}
          rules={[
            {
              required: true,
              message: i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.pleaseChooseAVisibilityLevel"),
            },
          ]}
        />

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message={i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.noteNewExpertiseOrFieldsMayNeed")}
        />
      </ProForm>

      <Divider orientation="left">{i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.previewHowOthersSeeYourExpertise")}</Divider>

      {/* Aperçu des domaines sélectionnés via List + Rate */}
      <List
        bordered
        itemLayout="vertical"
        dataSource={previewExpertise}
        locale={{
          emptyText:
            i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.selectAtLeastOneExpertiseAreaAbove"),
        }}
        renderItem={(item) => (
          <List.Item key={item.key}>
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{item.label}</Text>
                  <Tag color="blue">{i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.coreExpertise")}</Tag>
                </Space>
              }
              description={item.description}
            />
            <div>
              <Text type="secondary" style={{ marginRight: 8 }}>
                {i18nT("ui.keenkonnect.userReputation.manageExpertiseAreas.typicalExpertiseLevel")}
              </Text>
              {/* Rate utilisé ici en lecture seule pour l’aperçu */}
              <Rate allowHalf disabled defaultValue={item.defaultLevel} />
            </div>
          </List.Item>
        )}
      />
    </KeenPageShell>
  );
}
