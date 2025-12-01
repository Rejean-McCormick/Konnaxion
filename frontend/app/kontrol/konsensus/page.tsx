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

const { Text } = Typography;

export default function KonsensusSettingsPage() {
  // State for live simulation feedback
  const [simulation, setSimulation] = useState({
    stiffness: 45,
    riskLabel: 'Balanced',
    riskColor: 'green',
    retroFailures: 2,
  });

  // Calculate simulation metrics based on form values
  const runSimulation = (quorum: number, threshold: number) => {
    // Arbitrary formula to calculate "Governance Stiffness"
    // Higher quorum + higher threshold = harder to pass votes
    const score = Math.min(100, Math.round((quorum * 1.2) + (threshold * 0.5)));
    
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
  };

  const handleValuesChange = (_: any, values: any) => {
    // Only recalculate if relevant fields change
    if (values.quorum !== undefined || values.pass_threshold !== undefined) {
      const q = values.quorum ?? 15;
      const t = values.pass_threshold ?? 66;
      runSimulation(q, t);
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
            
            // 1. FETCH INITIAL CONFIGURATION (GET)
            request={async () => {
              try {
                const res = await fetch('/api/admin/konsensus-config/');
                if (!res.ok) return {}; 
                const data = await res.json();
                
                // Get the latest config (first item in list)
                const latest = data.results && data.results.length > 0 ? data.results[0] : null;

                if (latest) {
                  // Run sim based on fetched data
                  runSimulation(latest.quorum_percentage, latest.passing_threshold);

                  // Map Backend Model -> Frontend Form
                  return {
                    quorum: parseFloat(latest.quorum_percentage),
                    pass_threshold: parseFloat(latest.passing_threshold),
                    min_duration_days: latest.default_voting_duration_days,
                    anonymous_voting: latest.allow_anonymous_voting,
                    // Map generic fields from extra_settings JSON
                    algorithm: latest.extra_settings?.algorithm || 'weighted',
                    allow_delegation: latest.extra_settings?.allow_delegation ?? true,
                    network: latest.extra_settings?.network || 'local_ganache',
                    auto_execute: latest.extra_settings?.auto_execute ?? false
                  };
                }
                return { 
                    // Defaults if no DB record exists yet
                    quorum: 15, 
                    pass_threshold: 66,
                    min_duration_days: 3,
                    algorithm: 'weighted'
                };
              } catch (error) {
                console.error("Failed to load config", error);
                message.error("Could not load current configuration");
                return {};
              }
            }}

            // 2. SAVE CONFIGURATION (POST)
            onFinish={async (values) => {
              try {
                message.loading('Applying consensus parameters...', 0.5);
                
                // Construct Payload matching backend Serializer
                const payload = {
                    quorum_percentage: values.quorum,
                    passing_threshold: values.pass_threshold,
                    default_voting_duration_days: values.min_duration_days,
                    allow_anonymous_voting: values.anonymous_voting,
                    auto_close_votes: true, // Defaulting to true for now
                    // Store non-column UI fields in JSON
                    extra_settings: {
                        algorithm: values.algorithm,
                        allow_delegation: values.allow_delegation,
                        network: values.network,
                        auto_execute: values.auto_execute
                    }
                };

                const res = await fetch('/api/admin/konsensus-config/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!res.ok) throw new Error('Failed to save');

                message.success('Configuration updated successfully');
                return true;
              } catch (error) {
                  console.error(error);
                  message.error('Failed to save configuration');
                  return false;
              }
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