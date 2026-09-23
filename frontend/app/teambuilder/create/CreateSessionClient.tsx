// frontend/app/teambuilder/create/CreateSessionClient.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Input,
  Space,
  Spin,
  Steps,
  Typography,
} from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';


import { AlgorithmConfig } from '@/components/teambuilder/AlgorithmConfig';
import { CandidateSelector } from '@/components/teambuilder/CandidateSelector';
import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import api from '@/services/_request'; // shared axios wrapper
import { teambuilderService } from '@/services/teambuilder';
import {
  IAlgorithmConfig,
  ICreateSessionRequest,
  ITeambuilderUser,
} from '@/services/teambuilder/types';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

export default function CreateSessionClient(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const problemId = searchParams.get('problemId');

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [availableCandidates, setAvailableCandidates] = useState<ITeambuilderUser[]>([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>([]);

  const [algorithmConfig, setAlgorithmConfig] = useState<IAlgorithmConfig>({
    target_team_size: 4,
    strategy: 'balanced_expertise',
    diversity_weight: 0.5,
  });

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // shared axios wrapper returns data directly
        const users = await api.get<ITeambuilderUser[]>('users/');
        setAvailableCandidates(users);
      } catch (err) {
         
        console.error('Failed to fetch users', err);
        setError(i18nT("ui.teambuilder.create.createsessionclient.couldNotLoadCandidateList"));
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [i18nT]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setError(i18nT("ui.teambuilder.create.createsessionclient.sessionNameIsRequired"));
      return;
    }
    if (selectedCandidateIds.length < 2) {
      setError(i18nT("ui.teambuilder.create.createsessionclient.pleaseSelectAtLeast2Candidates"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: ICreateSessionRequest = {
        name: sessionName,
        description: sessionDescription,
        candidate_ids: selectedCandidateIds,
        algorithm_config: algorithmConfig,
        ...(problemId ? { problem_id: problemId } : {}),
      };

      const session = await teambuilderService.createSession(payload);

      router.push(`/teambuilder/${session.id}`);
    } catch (err) {
       
      console.error(err);
      setError(i18nT("ui.teambuilder.create.createsessionclient.failedToCreateSessionPleaseTryAgain"));
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3);
    } else {
      router.push('/teambuilder');
    }
  };

  const handleNext = () => {
    setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3);
  };

  // ---------------------------------------------------------------------------
  // Render Steps
  // ---------------------------------------------------------------------------

  const renderStep1 = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Space align="baseline">
          <Text strong>{i18nT("ui.teambuilder.create.createsessionclient.sessionName")}</Text>
          <Text type="danger">*</Text>
        </Space>
        <Input
          style={{ marginTop: 8 }}
          placeholder={i18nT("ui.teambuilder.create.createsessionclient.eGQ3HackathonTeams")}
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          maxLength={200}
        />
      </div>

      <div>
        <Text strong>{i18nT("ui.teambuilder.create.createsessionclient.description")}</Text>
        <TextArea
          style={{ marginTop: 8 }}
          rows={3}
          placeholder={i18nT("ui.teambuilder.create.createsessionclient.optionalContextAboutThisTeamFormation")}
          value={sessionDescription}
          onChange={(e) => setSessionDescription(e.target.value)}
        />
      </div>
    </Space>
  );

  const renderStep2 = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Paragraph type="secondary">
        {i18nT("ui.teambuilder.create.createsessionclient.selectThePoolOfUsersYouWant")}
      </Paragraph>

      {usersLoading ? (
        <div
          style={{
            padding: '40px 0',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Spin size="large" />
        </div>
      ) : (
        <CandidateSelector
          candidates={availableCandidates}
          selectedIds={selectedCandidateIds}
          onChange={setSelectedCandidateIds}
        />
      )}

      <Text type="secondary" style={{ textAlign: 'right', display: 'block' }}>
        {selectedCandidateIds.length} {i18nT("ui.teambuilder.create.createsessionclient.candidatesSelected")}
      </Text>
    </Space>
  );

  const renderStep3 = () => (
    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
      <Paragraph type="secondary">
        {i18nT("ui.teambuilder.create.createsessionclient.configureHowTheEngineShouldDistributeThe")}
      </Paragraph>

      <AlgorithmConfig config={algorithmConfig} onChange={setAlgorithmConfig} />

      <Alert
        type="info"
        showIcon
        style={{ marginTop: 8 }}
        message={
          <span>
            <strong>{i18nT("ui.teambuilder.create.createsessionclient.summary")}</strong> {i18nT("ui.teambuilder.create.createsessionclient.creatingTeamsOfApproximately")}{' '}
            <strong>{algorithmConfig.target_team_size}</strong> {i18nT("ui.teambuilder.create.createsessionclient.peopleUsingThe")}{' '}
            <strong>
              {algorithmConfig.strategy === 'random'
                ? i18nT("ui.teambuilder.create.createsessionclient.random")
                : i18nT("ui.teambuilder.create.createsessionclient.balancedExpertise")}
            </strong>{' '}
            {i18nT("ui.teambuilder.create.createsessionclient.strategy")}
          </span>
        }
      />
    </Space>
  );

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.create.createsessionclient.createTeamSession")}
      subtitle={i18nT("ui.teambuilder.create.createsessionclient.setUpANewTeamBuildingSession")}
      sectionLabel={i18nT("ui.teambuilder.create.createsessionclient.sessions")}
      maxWidth={960}
      secondaryActions={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push('/teambuilder')}
        >
          {i18nT("ui.teambuilder.create.createsessionclient.backToSessions")}
        </Button>
      }
    >
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Steps
            current={step - 1}
            items={[
              {
                title: i18nT("ui.teambuilder.create.createsessionclient.basics"),
                icon: <FileTextOutlined />,
              },
              {
                title: i18nT("ui.teambuilder.create.createsessionclient.candidates"),
                icon: <TeamOutlined />,
              },
              {
                title: i18nT("ui.teambuilder.create.createsessionclient.logic"),
                icon: <BranchesOutlined />,
              },
            ]}
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.teambuilder.create.createsessionclient.thereWasAProblem")}
              description={error}
            />
          )}

          {renderCurrentStep()}

          <Space
            style={{
              width: '100%',
              justifyContent: 'space-between',
              marginTop: 8,
            }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
            >
              {step > 1 ? i18nT("ui.teambuilder.create.createsessionclient.back") : i18nT("ui.teambuilder.create.createsessionclient.cancel")}
            </Button>

            {step < 3 ? (
              <Button
                type="primary"
                onClick={handleNext}
                disabled={step === 1 && !sessionName.trim()}
              >
                {i18nT("ui.teambuilder.create.createsessionclient.next")} {step === 1 ? i18nT("ui.teambuilder.create.createsessionclient.selectCandidates") : i18nT("ui.teambuilder.create.createsessionclient.configureAlgorithm")}
              </Button>
            ) : (
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleCreateSession}
                loading={loading}
              >
                {i18nT("ui.teambuilder.create.createsessionclient.createViewSession")}
              </Button>
            )}
          </Space>
        </Space>
      </Card>
    </TeamBuilderPageShell>
  );
}
