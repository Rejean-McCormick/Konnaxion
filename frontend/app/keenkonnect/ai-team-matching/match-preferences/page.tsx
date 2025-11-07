'use client';

import React, { useState } from 'react';
import type { NextPage } from 'next';
import {
  Form,
  Select,
  InputNumber,
  Radio,
  Slider,
  Button,
  Progress,
  Typography,
} from 'antd';
import PageContainer from '@/components/PageContainer';

const { Option } = Select;
const { Text } = Typography;

const MatchPreferencesPage: NextPage = () => {
  const [form] = Form.useForm();

  // Valeurs initiales pour le formulaire
  const initialValues = {
    projectDomains: [] as string[],
    preferredTeamSize: 4,
    rolesOfInterest: [] as string[],
    skillsOffered: [] as string[],
    skillsSought: [] as string[],
    collaborationStyle: 'balanced',
    // 0 = Innovation focus, 100 = Execution focus
    innovationExecution: 50,
  };

  // Calcul d'un indicateur de complétude (matching readiness)
  const computeReadiness = (values: any) => {
    // 5 champs clés, poids équivalent
    const totalFields = 5;
    let completed = 0;
    if (values.projectDomains && values.projectDomains.length > 0) completed++;
    if (values.preferredTeamSize) completed++;
    if (values.rolesOfInterest && values.rolesOfInterest.length > 0) completed++;
    if (values.skillsOffered && values.skillsOffered.length > 0) completed++;
    if (values.skillsSought && values.skillsSought.length > 0) completed++;
    return Math.round((completed / totalFields) * 100);
  };

  // State pour suivre la complétude du profil
  const [readiness, setReadiness] = useState<number>(
    computeReadiness(initialValues)
  );

  // Mise à jour de l'indicateur lors d'un changement dans le formulaire
  const onValuesChange = (_changed: any, allValues: any) => {
    setReadiness(computeReadiness(allValues));
  };

  // Gestion de la soumission du formulaire
  const onFinish = (values: any) => {
    // Intégration API possible ici
    // console.log('Preferences Saved: ', values);
  };

  return (
    <PageContainer title="Match Preferences">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
      >
        {/* Domaines de projet souhaités */}
        <Form.Item
          label="Desired Project Domains"
          name="projectDomains"
          rules={[{ required: true, message: 'Please select at least one domain.' }]}
        >
          <Select
            mode="multiple"
            placeholder="Select domains you want to work on"
            allowClear
          >
            <Option value="ai-ml">AI / Machine Learning</Option>
            <Option value="sustainability">Sustainability</Option>
            <Option value="edtech">EdTech</Option>
            <Option value="fintech">FinTech</Option>
            <Option value="healthtech">HealthTech</Option>
            <Option value="open-source">Open Source</Option>
          </Select>
        </Form.Item>

        {/* Taille d'équipe souhaitée */}
        <Form.Item
          label="Preferred Team Size"
          name="preferredTeamSize"
          rules={[{ required: true, message: 'Please set your preferred team size.' }]}
        >
          <InputNumber min={2} max={10} />
        </Form.Item>

        {/* Rôles d'intérêt */}
        <Form.Item
          label="Roles of Interest"
          name="rolesOfInterest"
          rules={[{ required: true, message: 'Please select at least one role.' }]}
        >
          <Select mode="multiple" placeholder="Select roles you want to take">
            <Option value="frontend">Frontend Developer</Option>
            <Option value="backend">Backend Developer</Option>
            <Option value="data">Data Scientist</Option>
            <Option value="designer">Designer (UI/UX)</Option>
            <Option value="pm">Product Manager</Option>
            <Option value="devops">DevOps</Option>
          </Select>
        </Form.Item>

        {/* Compétences offertes */}
        <Form.Item
          label="Skills You Offer"
          name="skillsOffered"
          rules={[{ required: true, message: 'Veuillez sélectionner vos compétences' }]}
        >
          <Select mode="multiple" placeholder="Sélectionnez vos compétences">
            <Option value="react">React</Option>
            <Option value="node">Node.js</Option>
            <Option value="python">Python</Option>
            <Option value="design">UI/UX Design</Option>
            <Option value="ml">Machine Learning</Option>
          </Select>
        </Form.Item>

        {/* Compétences recherchées */}
        <Form.Item
          label="Skills You Seek in a Team"
          name="skillsSought"
          rules={[{ required: true, message: 'Veuillez sélectionner les compétences recherchées' }]}
        >
          <Select mode="multiple" placeholder="Sélectionnez les compétences attendues">
            <Option value="react">React</Option>
            <Option value="node">Node.js</Option>
            <Option value="python">Python</Option>
            <Option value="design">UI/UX Design</Option>
            <Option value="ml">Machine Learning</Option>
          </Select>
        </Form.Item>

        {/* Style de collaboration */}
        <Form.Item label="Collaboration Style" name="collaborationStyle">
          <Radio.Group>
            <Radio value="flexible">Flexible</Radio>
            <Radio value="structured">Structuré</Radio>
            <Radio value="balanced">Équilibré</Radio>
          </Radio.Group>
        </Form.Item>

        {/* Slider Innovation vs Execution */}
        <Form.Item label="Innovation Focus vs Execution Focus">
          <Form.Item name="innovationExecution" noStyle>
            {/* Si vous êtes en antd v5+, vous pouvez basculer sur: tooltip={{ open: true }} */}
            <Slider min={0} max={100} tooltipVisible />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Innovation Focus</Text>
            <Text>Execution Focus</Text>
          </div>
        </Form.Item>

        {/* Indicateur de matching readiness */}
        <Form.Item label="Matching Readiness">
          <Progress
            percent={readiness}
            status={readiness === 100 ? 'success' : 'active'}
          />
          <Text type="secondary">
            Complétez vos préférences pour améliorer la qualité des suggestions de l’IA.
          </Text>
        </Form.Item>

        {/* Info */}
        <Form.Item>
          <Text type="secondary">
            Ces préférences permettent à notre système AI de vous proposer les meilleures
            correspondances d’équipes.
          </Text>
        </Form.Item>

        {/* Soumission */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Preferences
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

// Option d’intégration layout (conservée comme dans vos sources)
MatchPreferencesPage.getLayout = (page: React.ReactNode) => page;

export default MatchPreferencesPage;
