'use client';

import React from 'react';
import {
  Typography,
  Select,
  InputNumber,
  Slider,
  Switch,
  Radio,
  Checkbox,
  Button,
  Form,
  Space,
  Divider,
  Row,
  Col,
  Tabs,
  message,
} from 'antd';
import { PageContainer } from '@ant-design/pro-components';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

type RateRange = [number, number];

interface PreferencesFormValues {
  profileFocus?: 'balanced' | 'explore' | 'deliver';
  collaborationStyle?: 'async' | 'sync' | 'independent';
  remoteOk?: boolean;

  projectSize?: number;
  desiredMonthlyRate?: RateRange;

  minYearsExperience?: number;
  primaryStack?: string[];
  industry?: 'technology' | 'finance' | 'healthcare' | 'education' | 'energy' | 'design';

  aiTools?: string[];
  aiHighUsage?: boolean;

  locationRadiusKm?: number;
  availableNightsWeekends?: boolean;
}

export default function MatchPreferencesPage() {
  const [form] = Form.useForm<PreferencesFormValues>();

  const onFinish = (values: PreferencesFormValues) => {
    // Ici vous pouvez déclencher un appel API ou stocker les préférences
    // console.log('Match preferences:', values);
    message.success('Préférences enregistrées.');
  };

  const onReset = () => {
    form.resetFields();
  };

  return (
    <PageContainer
      header={{
        title: 'Préférences de mise en équipe',
        breadcrumb: { items: [{ title: 'KeenKonnect' }, { title: 'AI Team Matching' }, { title: 'Match Preferences' }] },
      }}
    >
      <Form<PreferencesFormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          profileFocus: 'balanced',
          collaborationStyle: 'async',
          remoteOk: true,
          projectSize: 5,
          desiredMonthlyRate: [3, 7] as RateRange,
          minYearsExperience: 3,
          primaryStack: ['typescript', 'react'],
          industry: 'technology',
          aiTools: ['chatgpt'],
          aiHighUsage: true,
          locationRadiusKm: 25,
          availableNightsWeekends: false,
        }}
      >
        <Tabs defaultActiveKey="workstyle">
          {/* === Onglet : style de travail === */}
          <TabPane tab="Style de travail" key="workstyle">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Orientation de profil"
                  name="profileFocus"
                  tooltip="Équilibre entre exploration et livraison"
                >
                  <Radio.Group>
                    <Radio.Button value="balanced">Équilibré</Radio.Button>
                    <Radio.Button value="explore">Explorer/Tester</Radio.Button>
                    <Radio.Button value="deliver">Livrer/Exécuter</Radio.Button>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Style de collaboration"
                  name="collaborationStyle"
                >
                  <Radio.Group>
                    <Radio value="async">Asynchrone d’abord</Radio>
                    <Radio value="sync">Synchrone</Radio>
                    <Radio value="independent">Autonome</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Télétravail accepté"
                  name="remoteOk"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {/* === Onglet : mission & budget === */}
          <TabPane tab="Taille & budget" key="tenure">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Taille de mission (personnes)"
                  name="projectSize"
                >
                  <InputNumber min={1} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="TJM / Budget mensuel (k€)"
                  name="desiredMonthlyRate"
                >
                  <Slider
                    range
                    min={0}
                    max={10}
                    step={0.5}
                    marks={{ 0: '0', 5: '5', 10: '10' }}
                    // Si vous êtes en antd v5, préférez : tooltip={{ open: true }}
                    tooltipVisible
                  />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {/* === Onglet : expérience === */}
          <TabPane tab="Expérience" key="experience">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Années minimales d’expérience"
                  name="minYearsExperience"
                >
                  <InputNumber min={0} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Stack principale"
                  name="primaryStack"
                >
                  <Select mode="multiple" allowClear placeholder="Choisir une stack…">
                    <Option value="typescript">TypeScript</Option>
                    <Option value="react">React</Option>
                    <Option value="node">Node.js</Option>
                    <Option value="python">Python</Option>
                    <Option value="design">Design</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Secteur" name="industry">
                  <Select placeholder="Secteur d’activité">
                    <Option value="technology">Tech</Option>
                    <Option value="finance">Finance</Option>
                    <Option value="healthcare">Santé</Option>
                    <Option value="education">Éducation</Option>
                    <Option value="energy">Énergie</Option>
                    <Option value="design">Design</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {/* === Onglet : IA === */}
          <TabPane tab="IA" key="ai">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Outils IA" name="aiTools">
                  <Select mode="multiple" allowClear placeholder="Sélectionner des outils…">
                    <Option value="chatgpt">ChatGPT</Option>
                    <Option value="midjourney">Midjourney</Option>
                    <Option value="copilot">Copilot</Option>
                    <Option value="other">Autre</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Usage IA intensif"
                  name="aiHighUsage"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          {/* === Onglet : autres === */}
          <TabPane tab="Autres" key="other">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item label="Rayon géographique (km)" name="locationRadiusKm">
                  <Slider min={0} max={200} step={5} marks={{ 0: '0', 50: '50', 100: '100', 200: '200' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="availableNightsWeekends"
                  valuePropName="checked"
                  label="Disponible soir & week-end"
                >
                  <Checkbox>Oui</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>

        <Divider />

        <Space>
          <Button type="primary" htmlType="submit">Enregistrer</Button>
          <Button htmlType="button" onClick={onReset}>Réinitialiser</Button>
        </Space>
      </Form>

      <Divider />
      <Paragraph type="secondary">
        <Text>
          Ces préférences seront utilisées pour affiner les correspondances d’équipe IA.
        </Text>
      </Paragraph>
    </PageContainer>
  );
}
