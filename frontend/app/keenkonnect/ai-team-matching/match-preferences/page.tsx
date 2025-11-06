'use client'

// File: /pages/keenkonnect/ai-team-matching/match-preferences.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import { Form, Select, InputNumber, Radio, Slider, Button, Progress, Typography } from 'antd';
import PageContainer from '@/components/PageContainer'; // Composant global de page

const { Option } = Select;
const { Text } = Typography;

const MatchPreferencesPage: NextPage = () => {
  const [form] = Form.useForm();

  // Valeurs initiales pour le formulaire
  const initialValues = {
    projectDomains: [],
    preferredTeamSize: 4,
    rolesOfInterest: [],
    skillsOffered: [],
    skillsSought: [],
    collaborationStyle: 'balanced',
    innovationExecution: 50, // 0 = Innovation focus, 100 = Execution focus

  // Calcul d'un indicateur de complétude (matching readiness)
  const computeReadiness = (values: any) => {
    // Pour simplifier, 5 champs clés (on considère que chacun a le même poids)
    const totalFields = 5;
    let completed = 0;
    if (values.projectDomains && values.projectDomains.length > 0) completed++;
    if (values.preferredTeamSize) completed++;
    if (values.rolesOfInterest && values.rolesOfInterest.length > 0) completed++;
    if (values.skillsOffered && values.skillsOffered.length > 0) completed++;
    if (values.skillsSought && values.skillsSought.length > 0) completed++;
    return Math.round((completed / totalFields) * 100);

  // State pour suivre la complétude du profil
  const [readiness, setReadiness] = useState<number>(computeReadiness(initialValues));

  // Mise à jour de l'indicateur lors d'un changement dans le formulaire
  const onValuesChange = (_changedValues: any, allValues: any) => {
    setReadiness(computeReadiness(allValues));

  // Gestion de la soumission du formulaire
  const onFinish = (values: any) => {
    console.log('Preferences Saved: ', values);
    // Ajoutez ici une éventuelle intégration avec une API pour sauvegarder les préférences

  return (
    <PageContainer title="Match Preferences">
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
      >
        {/* Sélection des domaines de projet */}
        <Form.Item
          label="Desired Project Domains"
          name="projectDomains"
          rules={[{ required: true, message: 'Veuillez sélectionner au moins un domaine de projet' }]}
        >
          <Select mode="multiple" placeholder="Sélectionnez des domaines de projet">
            <Option value="web">Web Development</Option>
            <Option value="mobile">Mobile Apps</Option>
            <Option value="data">Data Science</Option>
            <Option value="ai">Artificial Intelligence</Option>
            <Option value="devops">DevOps</Option>
          </Select>
        </Form.Item>

        {/* Taille d'équipe préférée */}
        <Form.Item
          label="Preferred Team Size"
          name="preferredTeamSize"
          rules={[{ required: true, message: 'Veuillez spécifier la taille d’équipe souhaitée' }]}
        >
          <InputNumber min={1} max={20} />
        </Form.Item>

        {/* Sélection des rôles d'intérêt */}
        <Form.Item
          label="Roles of Interest"
          name="rolesOfInterest"
          rules={[{ required: true, message: 'Veuillez sélectionner au moins un rôle' }]}
        >
          <Select mode="multiple" placeholder="Sélectionnez les rôles qui vous intéressent">
            <Option value="frontend">Frontend Developer</Option>
            <Option value="backend">Backend Developer</Option>
            <Option value="designer">Designer</Option>
            <Option value="qa">QA Engineer</Option>
            <Option value="pm">Project Manager</Option>
          </Select>
        </Form.Item>

        {/* Sélection des compétences offertes */}
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

        {/* Sélection des compétences recherchées */}
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

        {/* Sélection du style de collaboration */}
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
            <Slider min={0} max={100} tooltipVisible />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text>Innovation Focus</Text>
            <Text>Execution Focus</Text>
          </div>
        </Form.Item>

        {/* Indicateur de matching readiness */}
        <Form.Item label="Matching Readiness">
          <Progress percent={readiness} status={readiness === 100 ? 'success' : 'active'} />
          <Text type="secondary">
            Complétez vos préférences pour améliorer la qualité des suggestions de l’IA.
          </Text>
        </Form.Item>

        {/* Texte informatif */}
        <Form.Item>
          <Text type="secondary">
            Ces préférences permettent à notre système AI de vous proposer les meilleures correspondances d’équipes.
          </Text>
        </Form.Item>

        {/* Bouton de sauvegarde */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Preferences
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );

// Si un layout global est utilisé via getLayout (_app.tsx), vous pouvez l'intégrer ainsi :

  // Exemple d'enveloppement avec MainLayout :
  // return <MainLayout>{page}</MainLayout>;
  return page;

export default MatchPreferencesPage;
