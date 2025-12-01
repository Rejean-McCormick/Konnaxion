// FILE: frontend/app/kontrol/konsensus/page.tsx
'use client';

import React, { useState } from 'react';
import { message, Space, Typography, Alert, Row, Col, Statistic, Progress, List, Tag } from 'antd';
import { 
  ExperimentOutlined, 
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  ProCard, 
  ProForm, 
  ProFormSwitch, 
  ProFormSlider, 
  ProFormSelect, 
  ProFormDigit 
} from '@ant-design/pro-components';

const { Text, Paragraph } = Typography;

export default function KonsensusSettingsPage() {
  // State for live simulation feedback
  const [simulation, setSimulation] = useState({
    stiffness: 45,
    riskLabel: 'Balanced',
    riskColor: 'green',
    retroFailures: 2,
  });

  // Mock simulation logic: Updates metrics as user drags sliders
  const handleValuesChange = (_: any, values: any) => {
    // Only recalculate if relevant fields change
    if (values.quorum !== undefined || values.pass_threshold !== undefined) {
      const q = values.quorum ?? 15; // Default fallback matches initialValue
      const t = values.pass_threshold ?? 66;

      // Arbitrary formula to calculate "Governance Stiffness"
      // Higher quorum + higher threshold = harder to pass votes
      const score = Math.min(100, Math.round((q * 1.2) + (t * 0.5)));
      
      let label = 'Fluid';
      let color = 'cyan';
      let fails = 0;

      if (score > 40) { label = 'Balanced'; color = 'green'; fails = 2; }
      if (score > 65) { label = 'Rigid'; color = 'orange'; fails = 5; }
      if (score > 85) { label = 'Gridlock Risk'; color = 'red'; fails = 12; }

      setSimulation({
        stiffness: score,
        riskLabel: label,
        riskColor: color,
        retroFailures: fails,
      });
    }
  };

  return (
    <PageContainer 
      title="Konsensus Configuration" 
      subTitle="Manage global consensus algorithms, voting thresholds, and governance parameters."
    >
      <Row gutter={24}>
        {/* LEFT COLUMN: The Configuration Form */}
        <Col xs={24} lg={16}>
          {/* Informational Banner */}
          <Alert 
            message="Critical Configuration" 
            description="Changes made here affect the active voting logic for the entire platform immediately. Proceed with caution."
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <ProForm
            onValuesChange={handleValuesChange}
            onFinish={async (values) => {
              // In a real app, this would be: await api.post('/admin/konsensus/config', values);
              console.log('Submitted Config:', values);
              message.loading('Applying consensus parameters...', 1)
                .then(() => message.success('Configuration updated successfully'));
              return true;
            }}
            submitter={{
              searchConfig: {
                submitText: 'Save Configuration',
              },
              render: (props, doms) => {
                return (
                  <ProCard bordered style={{ marginTop: 16 }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16 }}>
                       {doms}
                     </div>
                  </ProCard>
                );
              },
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              
              {/* Section 1: Voting Thresholds */}
              <ProCard 
                title="Global Thresholds" 
                headerBordered 
                collapsible 
                defaultCollapsed={false}
                extra={<SafetyCertificateOutlined style={{ color: '#52c41a' }} />}
              >
                <ProFormSlider
                  name="quorum"
                  label="Quorum Requirement (%)"
                  width="lg"
                  min={0}
                  max={100}
                  step={1}
                  initialValue={15}
                  marks={{ 0: '0%', 15: '15%', 50: '50%', 100: '100%' }}
                  help="Minimum percentage of eligible voters required for a vote to be valid."
                />
                
                <ProFormSlider
                  name="pass_threshold"
                  label="Pass Threshold (%)"
                  width="lg"
                  min={50}
                  max={100}
                  step={1}
                  initialValue={66}
                  marks={{ 50: 'Majority', 66: 'Super', 100: 'Unanimous' }}
                  help="Percentage of 'For' votes required to pass a proposal."
                />

                <ProFormDigit
                  name="min_duration_days"
                  label="Minimum Voting Duration (Days)"
                  width="sm"
                  min={1}
                  max={30}
                  initialValue={3}
                  tooltip="Proposals cannot close before this duration elapses."
                />
              </ProCard>

              {/* Section 2: Algorithm & Logic */}
              <ProCard 
                title="Consensus Algorithm" 
                headerBordered 
                collapsible
                extra={<ExperimentOutlined style={{ color: '#1890ff' }} />}
              >
                <ProFormSelect
                  name="algorithm"
                  label="Active Calculation Method"
                  width="md"
                  options={[
                    { value: 'quadratic', label: 'Quadratic Voting (Cost = Votes²)' },
                    { value: 'linear', label: 'Linear (1 Person = 1 Vote)' },
                    { value: 'weighted', label: 'Weighted (Reputation Based)' },
                    { value: 'hybrid', label: 'Hybrid (Linear + Reputation Boost)' },
                  ]}
                  initialValue="weighted"
                  tooltip="Quadratic voting helps protect minorities; Weighted empowers experts."
                />

                <ProCard split="vertical" bordered>
                  <ProCard>
                    <ProFormSwitch 
                      name="allow_delegation" 
                      label="Allow Vote Delegation" 
                      initialValue={true}
                      tooltip="Users can delegate their voting power to trusted experts."
                    />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Liquid democracy features will be enabled if checked.
                    </Text>
                  </ProCard>
                  <ProCard>
                    <ProFormSwitch 
                      name="anonymous_voting" 
                      label="Force Anonymous Voting" 
                      initialValue={false} 
                      tooltip="Hides voter identities on the blockchain/public record."
                    />
                     <Text type="secondary" style={{ fontSize: 12 }}>
                      Prevents social pressure but limits accountability.
                    </Text>
                  </ProCard>
                </ProCard>
              </ProCard>

              {/* Section 3: Smart Contract Sync */}
              <ProCard title="Blockchain Synchronization" headerBordered collapsible defaultCollapsed>
                <ProFormSelect
                  name="network"
                  label="Target Network"
                  width="md"
                  options={[
                    { value: 'eth_mainnet', label: 'Ethereum Mainnet' },
                    { value: 'polygon', label: 'Polygon (Matic)' },
                    { value: 'local_ganache', label: 'Local Ganache (Dev)' },
                  ]}
                  initialValue="local_ganache"
                />
                <ProFormSwitch 
                  name="auto_execute" 
                  label="Auto-Execute Passed Proposals" 
                  initialValue={false}
                  tooltip="If enabled, the system will attempt to call the smart contract immediately upon vote closure."
                />
              </ProCard>
            </Space>
          </ProForm>
        </Col>

        {/* RIGHT COLUMN: Live Simulation & Feedback */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Simulation Card */}
            <ProCard 
              title={<Space><ThunderboltOutlined /> Live Impact Analysis</Space>} 
              headerBordered 
              style={{ background: '#fafafa' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                
                <div>
                  <Text type="secondary">Governance Stiffness</Text>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <Statistic value={simulation.stiffness} suffix="/ 100" valueStyle={{ fontSize: 24 }} />
                    <Tag color={simulation.riskColor}>{simulation.riskLabel}</Tag>
                  </div>
                  <Progress 
                    percent={simulation.stiffness} 
                    showInfo={false} 
                    strokeColor={simulation.riskColor === 'red' ? '#ff4d4f' : simulation.riskColor === 'orange' ? '#faad14' : '#52c41a'} 
                  />
                </div>

                <Alert 
                  message="Historical Replay" 
                  description={`Under these rules, ${simulation.retroFailures} passed proposals from last year would have failed.`}
                  type="info"
                  showIcon
                  icon={<HistoryOutlined />}
                />
              </Space>
            </ProCard>

            {/* Quick Tips */}
            <ProCard title="Governance Tips" headerBordered collapsible>
              <List size="small" split={false}>
                <List.Item>
                  <Text type="secondary">
                    <WarningOutlined /> <strong>Quorum {'>'} 30%</strong> often leads to gridlock in decentralized communities.
                  </Text>
                </List.Item>
                <List.Item>
                  <Text type="secondary">
                    <SafetyCertificateOutlined /> <strong>Quadratic Voting</strong> is best used for resource allocation, not binary decisions.
                  </Text>
                </List.Item>
              </List>
            </ProCard>
          </Space>
        </Col>
      </Row>
    </PageContainer>
  );
}