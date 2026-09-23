// FILE: frontend/app/konnected/certifications/exam-preparation/page.tsx
﻿// app/konnected/certifications/exam-preparation/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslateFunction } from '@/i18n/runtime';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleTwoTone,
  ClockCircleOutlined,
  FileSearchOutlined,
  FlagOutlined,
  PlayCircleOutlined,
  WarningTwoTone,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Col,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Statistic,
  Steps,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import type { TabsProps } from 'antd';
import dayjs from 'dayjs';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import { get } from '@/services/_request';

const { Text } = Typography;
const { Step } = Steps;

const CERT_PASS_PERCENT = 80; // from CertifiKation spec
const QUIZ_RETRY_COOLDOWN_MIN = 30; // from CertifiKation spec

/**
 * Endpoint helper for the preparation plan of a given CertificationPath.
 * This is designed to be consistent with the other CertifiKation endpoints
 * used by exam registration and exam dashboard.
 *
 * IMPORTANT:
 * - we use a *relative* URL WITHOUT a leading "/" so that axios baseURL
 *   (NEXT_PUBLIC_API_BASE or "/api") is correctly applied.
 * - On the wire this becomes: /api/konnected/certifications/paths/:pathId/preparation-plan/
 */
const EXAM_PREPARATION_ENDPOINT = (pathId: string | number) =>
  `konnected/certifications/paths/${pathId}/preparation-plan/`;

type PrepModuleType = 'content' | 'practice_quiz' | 'project' | 'checkpoint';

type PrepModuleStatus = 'not_started' | 'in_progress' | 'completed';

interface PrepModule {
  id: string;
  title: string;
  type: PrepModuleType;
  status: PrepModuleStatus;
  progressPercent: number;
  estimatedMinutes?: number | null;
  lastTouchedAt?: string | null;
  isCriticalWeakness?: boolean;
}

interface FocusArea {
  id: string;
  label: string;
  description?: string | null;
  recommendedResourcesCount?: number | null;
}

interface ExamPreparationPathInfo {
  id: number | string;
  name: string;
  description?: string | null;
}

interface ExamPreparationExamInfo {
  targetDate?: string | null;
  recommendedStudyHours?: number | null;
  lastScorePercent?: number | null;
  lastResult?: 'pass' | 'fail' | null;
  lastAttemptAt?: string | null;
  attemptsUsed?: number | null;
  attemptsAllowed?: number | null;
  isCooldownActive?: boolean;
  cooldownEndsAt?: string | null;
  passPercent?: number | null;
  retryCooldownMinutes?: number | null;
}

interface ExamPreparationResponse {
  path?: ExamPreparationPathInfo | null;
  exam?: ExamPreparationExamInfo | null;
  overallProgressPercent?: number | null;
  modules?: PrepModule[] | null;
  focusAreas?: FocusArea[] | null;
}

function computeOverallProgress(modules: PrepModule[] | undefined | null): number {
  if (!modules || modules.length === 0) {
    return 0;
  }
  const sum = modules.reduce((acc, m) => acc + (m.progressPercent ?? 0), 0);
  return Math.round(sum / modules.length);
}

function computeStepIndex(progress: number): number {
  if (progress >= 90) return 3;
  if (progress >= 60) return 2;
  if (progress >= 30) return 1;
  return 0;
}

function getReadinessBadge(
  i18nT: TranslateFunction,
  progress: number,
  lastScore: number | null | undefined,
  passPercent: number,
): { status: 'ready' | 'almost' | 'not_ready'; label: string; color: 'green' | 'gold' | 'red' } {
  if (lastScore != null && lastScore >= passPercent) {
    return { status: 'ready', label: i18nT('ui.konnected.certifications.examPreparation.readyBasedOnLastScore'), color: 'green' };
  }
  if (progress >= passPercent - 10) {
    return { status: 'almost', label: i18nT('ui.konnected.certifications.examPreparation.almostReady'), color: 'gold' };
  }
  return { status: 'not_ready', label: i18nT('ui.konnected.certifications.examPreparation.notReadyYet'), color: 'red' };
}

async function fetchExamPreparation(pathId: string): Promise<ExamPreparationResponse> {
  return get<ExamPreparationResponse>(EXAM_PREPARATION_ENDPOINT(pathId));
}

export default function ExamPreparationPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const pathId = searchParams.get('pathId');
  const pathNameFromUrl = searchParams.get('pathName') || undefined;

  const { data, isLoading, error } = useQuery<ExamPreparationResponse>({
    queryKey: ['certs', 'exam-preparation', pathId],
    queryFn: () => fetchExamPreparation(pathId as string),
    enabled: !!pathId,
  });

  const modules: PrepModule[] = data?.modules ?? [];
  const focusAreas: FocusArea[] = data?.focusAreas ?? [];

  const overallProgress = useMemo(() => {
    return data?.overallProgressPercent != null
      ? Math.round(data.overallProgressPercent)
      : computeOverallProgress(modules);
  }, [data?.overallProgressPercent, modules]);

  const passPercent = data?.exam?.passPercent ?? CERT_PASS_PERCENT;
  const retryCooldownMinutes =
    data?.exam?.retryCooldownMinutes ?? QUIZ_RETRY_COOLDOWN_MIN;

  const lastScore = data?.exam?.lastScorePercent ?? null;
  const targetDate = data?.exam?.targetDate ?? null;
  const isCooldownActive = data?.exam?.isCooldownActive ?? false;
  const cooldownEndsAt = data?.exam?.cooldownEndsAt ?? null;

  const readiness = getReadinessBadge(i18nT, overallProgress, lastScore, passPercent);
  const currentStepIndex = computeStepIndex(overallProgress);

  const recommendedStudyHours = data?.exam?.recommendedStudyHours ?? null;

  const effectivePathName =
    data?.path?.name ?? pathNameFromUrl ?? 'Exam Preparation';

  const handleGoToExamRegistration = () => {
    router.push('/konnected/certifications/exam-registration');
  };

  const handleGoToExamDashboard = () => {
    router.push('/konnected/certifications/exam-dashboard-results');
  };

  const handleStartPracticeExam = () => {
    // Future: plug into automated_evaluation "practice mode" endpoint / route
    router.push('/konnected/certifications/exam-dashboard-results');
  };

  const subtitle = (
    <>
      {i18nT("ui.konnected.certifications.examPreparation.getAnAtAGlanceViewOf")} {passPercent}{i18nT("ui.konnected.certifications.examPreparation.passThresholdAndNextSteps")}
    </>
  );

  const renderModulesList = () => {
    if (!isLoading && modules.length === 0) {
      return (
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.konnected.certifications.examPreparation.noStudyModulesAreDefinedYet")}
          description={i18nT("ui.konnected.certifications.examPreparation.onceYourCertificationpathIsConfiguredWithLearning")}
        />
      );
    }

    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={modules}
        renderItem={(module) => (
          <List.Item
            actions={[
              <Button
                type="link"
                key="view"
                icon={<ArrowRightOutlined />}
                // Future: route to the actual learning unit detail, once available
                onClick={() => {
                   
                  console.log('Open module', module.id);
                }}
              >
                {i18nT("ui.konnected.certifications.examPreparation.viewModule")}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space size="small">
                  <span>{module.title}</span>
                  {module.status === 'completed' && (
                    <CheckCircleTwoTone twoToneColor="#52c41a" />
                  )}
                  {module.isCriticalWeakness && (
                    <Tag color="volcano" icon={<WarningTwoTone twoToneColor="#fa541c" />}>
                      {i18nT("ui.konnected.certifications.examPreparation.focusArea")}
                    </Tag>
                  )}
                </Space>
              }
              description={
                <Space direction="vertical" size={2}>
                  <Space size="small" wrap>
                    <Tag>
                      {module.type === 'content'
                        ? i18nT("ui.konnected.certifications.examPreparation.content")
                        : module.type === 'practice_quiz'
                        ? i18nT("ui.konnected.certifications.examPreparation.practiceQuiz")
                        : module.type === 'project'
                        ? i18nT("ui.konnected.certifications.examPreparation.project")
                        : i18nT("ui.konnected.certifications.examPreparation.checkpoint")}
                    </Tag>
                    <Text type="secondary">
                      {module.status === 'completed'
                        ? i18nT("ui.konnected.certifications.examPreparation.completed")
                        : module.status === 'in_progress'
                        ? i18nT("ui.konnected.certifications.examPreparation.inProgress", { progressPercent: module.progressPercent })
                        : i18nT("ui.konnected.certifications.examPreparation.notStartedYet")}
                    </Text>
                    {module.estimatedMinutes != null && (
                      <Text type="secondary">
                        • ~{module.estimatedMinutes} {i18nT("ui.konnected.certifications.examPreparation.min")}
                      </Text>
                    )}
                  </Space>
                  <Progress
                    percent={Math.round(module.progressPercent)}
                    size="small"
                    status={module.status === 'completed' ? 'success' : 'active'}
                  />
                  {module.lastTouchedAt && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {i18nT("ui.konnected.certifications.examPreparation.lastWorkedOn")}{' '}
                      {dayjs(module.lastTouchedAt).format('MMM D, YYYY HH:mm')}
                    </Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const renderFocusAreas = () => {
    if (!isLoading && focusAreas.length === 0) {
      return (
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.konnected.certifications.examPreparation.noSpecificFocusAreasIdentifiedYet")}
          description={i18nT("ui.konnected.certifications.examPreparation.onceYouCompleteSomeEvaluationsTheSystem")}
        />
      );
    }

    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 3 }} />;
    }

    return (
      <List
        dataSource={focusAreas}
        renderItem={(area) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Space>
                  <FlagOutlined />
                  <span>{area.label}</span>
                </Space>
              }
              description={
                <>
                  {area.description && (
                    <Text type="secondary" style={{ display: 'block' }}>
                      {area.description}
                    </Text>
                  )}
                  {area.recommendedResourcesCount != null && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {area.recommendedResourcesCount} {i18nT("ui.konnected.certifications.examPreparation.recommendedResources")}
                      {area.recommendedResourcesCount === 1 ? '' : 's'} {i18nT("ui.konnected.certifications.examPreparation.inKnowledge")}
                    </Text>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  const mainTabsItems: TabsProps['items'] = [
    {
      key: 'plan',
      label: i18nT("ui.konnected.certifications.examPreparation.studyPlanProgress"),
      children: (
        <Card variant="borderless">
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>{i18nT("ui.konnected.certifications.examPreparation.yourOverallPreparationProgress")}</Text>
              <Progress
                percent={overallProgress}
                status={overallProgress >= passPercent ? 'success' : 'active'}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.konnected.certifications.examPreparation.basedOnAllStudyModulesInThis")}
              </Text>
            </div>

            <div>
              <Text strong>{i18nT("ui.konnected.certifications.examPreparation.recommendedSequence")}</Text>
              <Steps
                direction="vertical"
                size="small"
                current={currentStepIndex}
                style={{ marginTop: 8 }}
              >
                <Step
                  title={i18nT("ui.konnected.certifications.examPreparation.studyCoreContent")}
                  description={i18nT("ui.konnected.certifications.examPreparation.workThroughRequiredModulesAndLessons")}
                />
                <Step
                  title={i18nT("ui.konnected.certifications.examPreparation.completePracticeActivities")}
                  description={i18nT("ui.konnected.certifications.examPreparation.interactiveExercisesQuizzesAndProjects")}
                />
                <Step
                  title={i18nT("ui.konnected.certifications.examPreparation.attemptAPracticeEvaluation")}
                  description={i18nT("ui.konnected.certifications.examPreparation.useAutomatedEvaluationInPracticeModeTo", { passPercent: passPercent })}
                />
                <Step
                  title={i18nT("ui.konnected.certifications.examPreparation.reviewFeedbackFocusAreas")}
                  description={i18nT("ui.konnected.certifications.examPreparation.revisitWeakDomainsBeforeBookingTheOfficial")}
                />
              </Steps>
            </div>

            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartPracticeExam}
              disabled={isCooldownActive}
            >
              {i18nT("ui.konnected.certifications.examPreparation.startPracticeExam")}
            </Button>

            {isCooldownActive && cooldownEndsAt && (
              <Alert
                type="warning"
                showIcon
                message={i18nT("ui.konnected.certifications.examPreparation.practiceExamOnCooldown")}
                description={
                  <>
                    {i18nT("ui.konnected.certifications.examPreparation.youRecentlyAttemptedAPracticeEvaluationYou")}{' '}
                    {dayjs(cooldownEndsAt).format('MMM D, YYYY HH:mm')} {i18nT("ui.konnected.certifications.examPreparation.cooldown")}{' '}
                    {retryCooldownMinutes} {i18nT("ui.konnected.certifications.examPreparation.minutes")}
                  </>
                }
              />
            )}
          </Space>
        </Card>
      ),
    },
    {
      key: 'focus',
      label: i18nT("ui.konnected.certifications.examPreparation.focusAreas"),
      children: <Card variant="borderless">{renderFocusAreas()}</Card>,
    },
  ];

  const noPathSelected = !pathId && !data;

  return (
    <KonnectedPageShell
      title={effectivePathName}
      subtitle={subtitle}
      primaryAction={
        <Button
          type="primary"
          icon={<CalendarOutlined />}
          onClick={handleGoToExamRegistration}
        >
          {i18nT("ui.konnected.certifications.examPreparation.examRegistration")}
        </Button>
      }
      secondaryActions={
        <Button
          icon={<FileSearchOutlined />}
          onClick={handleGoToExamDashboard}
        >
          {i18nT("ui.konnected.certifications.examPreparation.examDashboard")}
        </Button>
      }
    >
      {noPathSelected && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.certifications.examPreparation.noCertificationPathSelected")}
          description={i18nT("ui.konnected.certifications.examPreparation.openThisPageFromASpecificCertification")}
        />
      )}

      {error && !noPathSelected && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.certifications.examPreparation.unableToLoadYourExamPreparationData")}
          description={i18nT("ui.konnected.certifications.examPreparation.pleaseTryAgainInAMomentIf")}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Left: modules + plan */}
        <Col xs={24} lg={16}>
          <Card
            title={
              data?.path?.name
                ? i18nT("ui.konnected.certifications.examPreparation.studyModulesFor", { name: data.path.name })
                : i18nT("ui.konnected.certifications.examPreparation.studyModules")
            }
            extra={
              <Tag color={readiness.color} icon={<FlagOutlined />}>
                {readiness.label}
              </Tag>
            }
            style={{ marginBottom: 24 }}
          >
            {renderModulesList()}
          </Card>

          <Tabs
            defaultActiveKey="plan"
            items={mainTabsItems}
            destroyInactiveTabPane={false}
          />
        </Col>

        {/* Right: metrics + focus summary */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              {isLoading && pathId ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <>
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Statistic
                        title={i18nT("ui.konnected.certifications.examPreparation.overallProgress")}
                        value={overallProgress}
                        suffix="%"
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={i18nT("ui.konnected.certifications.examPreparation.passThreshold")}
                        value={passPercent}
                        suffix="%"
                      />
                    </Col>
                  </Row>

                  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Statistic
                        title={i18nT("ui.konnected.certifications.examPreparation.recommendedStudyTime")}
                        value={
                          recommendedStudyHours != null
                            ? recommendedStudyHours
                            : '—'
                        }
                        suffix={recommendedStudyHours != null ? 'hrs' : undefined}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={i18nT("ui.konnected.certifications.examPreparation.retryCooldown")}
                        value={retryCooldownMinutes}
                        suffix="min"
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                  </Row>

                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {i18nT("ui.konnected.certifications.examPreparation.passFailUsesAFrozenThreshold")}{passPercent}{i18nT("ui.konnected.certifications.examPreparation.andFailedAttemptsAreThrottledByA")}{' '}
                      {retryCooldownMinutes}{i18nT("ui.konnected.certifications.examPreparation.minuteCooldown")}
                    </Text>
                  </div>
                </>
              )}
            </Card>

            <Card title={i18nT("ui.konnected.certifications.examPreparation.upcomingExam")}>
              {isLoading && pathId ? (
                <Skeleton active paragraph={{ rows: 2 }} />
              ) : targetDate ? (
                <>
                  <Space direction="vertical" size="small">
                    <Space>
                      <CalendarOutlined />
                      <Text strong>
                        {dayjs(targetDate).format('MMMM D, YYYY')}
                      </Text>
                    </Space>
                    <Text type="secondary">
                      {i18nT("ui.konnected.certifications.examPreparation.makeSureYourPreparationProgressAndPractice")} {passPercent}{i18nT("ui.konnected.certifications.examPreparation.beforeThisDate")}
                    </Text>
                  </Space>
                  <Button
                    type="link"
                    icon={<CalendarOutlined />}
                    style={{ marginTop: 12, paddingLeft: 0 }}
                    onClick={handleGoToExamRegistration}
                  >
                    {i18nT("ui.konnected.certifications.examPreparation.adjustExamSession")}
                  </Button>
                </>
              ) : (
                <>
                  <Alert
                    type="info"
                    showIcon
                    message={i18nT("ui.konnected.certifications.examPreparation.noExamDateScheduled")}
                    description={i18nT("ui.konnected.certifications.examPreparation.bookASessionToLockInYour")}
                  />
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    style={{ marginTop: 12 }}
                    onClick={handleGoToExamRegistration}
                  >
                    {i18nT("ui.konnected.certifications.examPreparation.scheduleExam")}
                  </Button>
                </>
              )}
            </Card>

            <Card title={i18nT("ui.konnected.certifications.examPreparation.focusSummary")}>
              {isLoading && pathId ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : (
                <>
                  {focusAreas.length > 0 ? (
                    <>
                      <Text>
                        {i18nT("ui.konnected.certifications.examPreparation.youHave")} {focusAreas.length} {i18nT("ui.konnected.certifications.examPreparation.identifiedFocus")}{' '}
                        {focusAreas.length === 1 ? i18nT("ui.konnected.certifications.examPreparation.area") : i18nT("ui.konnected.certifications.examPreparation.areas")} {i18nT("ui.konnected.certifications.examPreparation.basedOnYourEvaluations")}
                      </Text>
                      <div style={{ marginTop: 12 }}>{renderFocusAreas()}</div>
                      <Button
                        type="link"
                        style={{ marginTop: 8, paddingLeft: 0 }}
                        onClick={handleGoToExamDashboard}
                      >
                        {i18nT("ui.konnected.certifications.examPreparation.viewDetailedBreakdownInExamDashboard")}
                      </Button>
                    </>
                  ) : (
                    <Text type="secondary">
                      {i18nT("ui.konnected.certifications.examPreparation.onceYouCompleteYourFirstPracticeOr")}
                    </Text>
                  )}
                </>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </KonnectedPageShell>
  );
}
