// FILE: frontend/app/konnected/certifications/certification-programs/page.tsx
﻿// app/konnected/certifications/certification-programs/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Pagination,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Tooltip,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import usePageTitle from '@/hooks/usePageTitle';
import { get } from '@/services/_request';
import { normalizeError } from '@/shared/errors';

const CERT_PASS_PERCENT = 80;

type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

type ProgramStatus = 'not_started' | 'in_progress' | 'completed';

interface ProgramSkill {
  id: string;
  name: string;
  category?: string;
}

interface ProgramUserProgress {
  status: ProgramStatus;
  completionPercent: number;
  lastActivityAt?: string;
  nextRecommendedStep?: string;
}

interface CertificationProgram {
  id: string;
  code: string;
  title: string;
  description: string;
  difficulty: ProgramDifficulty;
  estimatedHours?: number;
  category?: string;
  tags?: string[];
  skills?: ProgramSkill[];
  requiresProctoring?: boolean;
  attemptsAllowed?: number;
  passPercent?: number;
  isFeatured?: boolean;
  kpi_enrolledCount?: number;
  kpi_completionRate?: number;
  userProgress?: ProgramUserProgress;
}

interface ProgramsResponse {
  items: CertificationProgram[];
}

/**
 * Minimal payload shape coming from the CertifiKation paths endpoint.
 * This mirrors what exam-registration already expects from:
 *   GET /api/konnected/certifications/paths/
 */
interface CertificationPathPayload {
  id: number;
  name: string;
  description?: string;
  level?: string;
  tags?: string[];
  already_passed?: boolean;
  cooldown_remaining_minutes?: number | null;
}

/**
 * Maps backend "level" to the UI difficulty scale.
 */
function mapLevelToDifficulty(level?: string | null): ProgramDifficulty {
  const normalized = (level ?? '').toLowerCase();

  if (!normalized) return 'intermediate';
  if (normalized.includes('beginner') || normalized.includes('intro')) return 'beginner';
  if (normalized.includes('expert')) return 'expert';
  if (normalized.includes('advanced')) return 'advanced';
  return 'intermediate';
}

/**
 * Maps a CertificationPath payload into the richer CertificationProgram
 * shape used by this page. Fields with no direct backend equivalent are
 * left undefined.
 */
function mapPathToProgram(path: CertificationPathPayload): CertificationProgram {
  const difficulty = mapLevelToDifficulty(path.level);
  const alreadyPassed = Boolean(path.already_passed);
  const completionPercent = alreadyPassed ? 100 : 0;

  const userProgress: ProgramUserProgress = {
    status: alreadyPassed ? 'completed' : 'not_started',
    completionPercent,
  };

  return {
    id: String(path.id),
    code: `PATH-${path.id}`,
    title: path.name,
    description: path.description ?? '',
    difficulty,
    category: undefined,
    tags: path.tags ?? [],
    skills: [],
    requiresProctoring: false,
    attemptsAllowed: undefined,
    passPercent: CERT_PASS_PERCENT,
    isFeatured: false,
    kpi_enrolledCount: undefined,
    kpi_completionRate: undefined,
    userProgress,
  };
}

/**
 * API client for the CertifiKation catalog.
 *
 * Uses the canonical KonnectED CertifiKation endpoint:
 *   GET /api/konnected/certifications/paths/
 *
 * This keeps the Programs page aligned with the same source used by
 * exam-registration, without relying on mock data.
 */
async function fetchCertificationPrograms(): Promise<ProgramsResponse> {
  const paths = await get<CertificationPathPayload[]>('konnected/certifications/paths/');

  return {
    items: paths.map(mapPathToProgram),
  };
}

export default function CertificationProgramsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.konnected.certifications.certificationPrograms.konnectedCertificationPrograms"));
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<ProgramDifficulty | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProgramStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedProgram, setSelectedProgram] = useState<CertificationProgram | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, loading, error, refresh } = useRequest<ProgramsResponse, []>(
    fetchCertificationPrograms,
  );

  const programs = data?.items ?? [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    programs.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [programs]);

  const filteredPrograms = useMemo(() => {
    const query = search.trim().toLowerCase();

    return programs.filter((program) => {
      const matchesSearch =
        !query ||
        program.title.toLowerCase().includes(query) ||
        program.description.toLowerCase().includes(query) ||
        (program.code && program.code.toLowerCase().includes(query)) ||
        (program.tags ?? []).some((t) => t.toLowerCase().includes(query));

      const matchesDifficulty =
        difficultyFilter === 'all' || program.difficulty === difficultyFilter;

      const matchesCategory =
        categoryFilter === 'all' || program.category === categoryFilter;

      const status = program.userProgress?.status ?? 'not_started';
      const matchesStatus = statusFilter === 'all' || status === statusFilter;

      return matchesSearch && matchesDifficulty && matchesCategory && matchesStatus;
    });
  }, [programs, search, difficultyFilter, categoryFilter, statusFilter]);

  const total = filteredPrograms.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + pageSize);

  const stats = useMemo(() => {
    if (!programs.length) {
      return {
        totalPrograms: 0,
        activePrograms: 0,
        completedPrograms: 0,
        averageCompletion: 0,
      };
    }

    let active = 0;
    let completed = 0;
    let sumCompletion = 0;
    let counted = 0;

    programs.forEach((p) => {
      const progress = p.userProgress;
      if (!progress) return;

      if (progress.status === 'in_progress') active += 1;
      if (progress.status === 'completed') completed += 1;
      if (typeof progress.completionPercent === 'number') {
        sumCompletion += progress.completionPercent;
        counted += 1;
      }
    });

    return {
      totalPrograms: programs.length,
      activePrograms: active,
      completedPrograms: completed,
      averageCompletion: counted ? Math.round(sumCompletion / counted) : 0,
    };
  }, [programs]);

  const handleOpenDetails = (program: CertificationProgram) => {
    setSelectedProgram(program);
    setDrawerOpen(true);
  };

  const handleStartOrContinue = (program: CertificationProgram) => {
    const status = program.userProgress?.status ?? 'not_started';

    if (status === 'not_started') {
      router.push(`/konnected/certifications/exam-registration?pathId=${program.id}`);
      return;
    }

    if (status === 'in_progress') {
      router.push(`/konnected/certifications/exam-preparation?pathId=${program.id}`);
      return;
    }

    if (status === 'completed') {
      router.push(`/konnected/certifications/exam-dashboard-results?pathId=${program.id}`);
    }
  };

  const renderStatusTag = (program: CertificationProgram) => {
    const progress = program.userProgress;

    if (!progress || progress.status === 'not_started') {
      return <Tag>{i18nT("ui.konnected.certifications.certificationPrograms.notStarted")}</Tag>;
    }

    if (progress.status === 'in_progress') {
      return <Tag color="blue">{i18nT("ui.konnected.certifications.certificationPrograms.inProgress")}</Tag>;
    }

    if (progress.status === 'completed') {
      return <Tag color="green">{i18nT("ui.konnected.certifications.certificationPrograms.completed")}</Tag>;
    }

    return null;
  };

  const renderDifficultyTag = (difficulty: ProgramDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return <Tag color="green">{i18nT("ui.konnected.certifications.certificationPrograms.beginner")}</Tag>;
      case 'intermediate':
        return <Tag color="blue">{i18nT("ui.konnected.certifications.certificationPrograms.intermediate")}</Tag>;
      case 'advanced':
        return <Tag color="orange">{i18nT("ui.konnected.certifications.certificationPrograms.advanced")}</Tag>;
      case 'expert':
        return <Tag color="red">{i18nT("ui.konnected.certifications.certificationPrograms.expert")}</Tag>;
      default:
        return null;
    }
  };

  const errorState = error ? normalizeError(error) : null;
  const errorMessage = errorState?.message ?? null;

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.certifications.certificationPrograms.certificationPrograms")}
      subtitle={i18nT("ui.konnected.certifications.certificationPrograms.browseCertificationPathsTrackYourProgressAnd")}
      primaryAction={
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={() => {
            const target =
              programs.find((p) => p.userProgress?.status === 'in_progress') ??
              programs.find((p) => p.isFeatured) ??
              programs[0];

            if (target) {
              handleStartOrContinue(target);
            }
          }}
          disabled={!programs.length}
        >
          {i18nT("ui.konnected.certifications.certificationPrograms.goToMyNextCertification")}
        </Button>
      }
    >
      <PageContainer ghost loading={loading}>
        <Row gutter={[16, 16]}>
          {/* Stats */}
          <Col xs={24} md={10} lg={8}>
            <ProCard
              ghost
              title={i18nT("ui.konnected.certifications.certificationPrograms.myCertifikationOverview")}
              extra={
                <Tooltip title={i18nT("ui.konnected.certifications.certificationPrograms.globalPassThresholdIsForMostExams", { CERT_PASS_PERCENT: CERT_PASS_PERCENT })}>
                  <InfoCircleOutlined />
                </Tooltip>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title={i18nT("ui.konnected.certifications.certificationPrograms.totalPrograms")} value={stats.totalPrograms} />
                </Col>
                <Col span={12}>
                  <Statistic title={i18nT("ui.konnected.certifications.certificationPrograms.active")} value={stats.activePrograms} />
                </Col>
                <Col span={12}>
                  <Statistic title={i18nT("ui.konnected.certifications.certificationPrograms.completed")} value={stats.completedPrograms} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title={i18nT("ui.konnected.certifications.certificationPrograms.avgCompletion")}
                    value={stats.averageCompletion}
                    suffix="%"
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    marginBottom: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{i18nT("ui.konnected.certifications.certificationPrograms.overallProgressTowardCertifications")}</span>
                  <span>{stats.averageCompletion}%</span>
                </div>
                <Progress percent={stats.averageCompletion} size="small" />
              </div>
            </ProCard>
          </Col>

          {/* Filters */}
          <Col xs={24} md={14} lg={16}>
            <ProCard ghost title={i18nT("ui.konnected.certifications.certificationPrograms.filterPrograms")}>
              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder={i18nT("ui.konnected.certifications.certificationPrograms.searchByNameCodeTagOrDescription")}
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>{i18nT("ui.konnected.certifications.certificationPrograms.difficulty")}</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={difficultyFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.all")}
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'beginner' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('beginner');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.beginner")}
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'intermediate' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('intermediate');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.intermediate")}
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'advanced' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('advanced');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.advanced")}
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'expert' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('expert');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.expert")}
                      </Button>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>{i18nT("ui.konnected.certifications.certificationPrograms.status")}</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={statusFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.all")}
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'not_started' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('not_started');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.notStarted")}
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'in_progress' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('in_progress');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.inProgress")}
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'completed' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('completed');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.completed")}
                      </Button>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>{i18nT("ui.konnected.certifications.certificationPrograms.category")}</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={categoryFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setCategoryFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        {i18nT("ui.konnected.certifications.certificationPrograms.all")}
                      </Button>
                      {categories.map((cat) => (
                        <Button
                          key={cat}
                          size="small"
                          type={categoryFilter === cat ? 'primary' : 'default'}
                          onClick={() => {
                            setCategoryFilter(cat);
                            setCurrentPage(1);
                          }}
                        >
                          {cat}
                        </Button>
                      ))}
                    </Space>
                  </Space>
                </Col>
              </Row>
            </ProCard>
          </Col>
        </Row>

        {/* Error state */}
        {errorMessage && (
          <Alert
            type="error"
            showIcon
            style={{ marginTop: 16 }}
            message={i18nT("ui.konnected.certifications.certificationPrograms.unableToLoadCertificationPrograms")}
            description={
              <Space align="start">
                <span>{errorMessage}</span>
                <Button size="small" onClick={() => refresh()}>
                  {i18nT("ui.konnected.certifications.certificationPrograms.retry")}
                </Button>
              </Space>
            }
          />
        )}

        {/* Catalog */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {paginatedPrograms.length === 0 && !loading ? (
            <Col span={24}>
              <Card>
                <Empty
                  description={
                    search ||
                    difficultyFilter !== 'all' ||
                    statusFilter !== 'all' ||
                    categoryFilter !== 'all'
                      ? i18nT("ui.konnected.certifications.certificationPrograms.noCertificationProgramsMatchYourFilters")
                      : i18nT("ui.konnected.certifications.certificationPrograms.noCertificationProgramsAreAvailableYet")
                  }
                >
                  {(search ||
                    difficultyFilter !== 'all' ||
                    statusFilter !== 'all' ||
                    categoryFilter !== 'all') && (
                    <Button
                      onClick={() => {
                        setSearch('');
                        setDifficultyFilter('all');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                        setCurrentPage(1);
                      }}
                    >
                      {i18nT("ui.konnected.certifications.certificationPrograms.clearFilters")}
                    </Button>
                  )}
                </Empty>
              </Card>
            </Col>
          ) : (
            paginatedPrograms.map((program) => {
              const progress = program.userProgress;
              const percent = progress?.completionPercent ?? 0;
              const passPercent = program.passPercent ?? CERT_PASS_PERCENT;

              return (
                <Col key={program.id} xs={24} md={12} lg={8}>
                  <Badge.Ribbon
                    text={program.isFeatured ? i18nT("ui.konnected.certifications.certificationPrograms.featured") : undefined}
                    color={program.isFeatured ? 'gold' : undefined}
                  >
                    <Card
                      hoverable
                      title={
                        <Space>
                          <SafetyCertificateOutlined />
                          <span>{program.title}</span>
                        </Space>
                      }
                      extra={renderStatusTag(program)}
                      onClick={() => handleOpenDetails(program)}
                    >
                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            <Space size={8} wrap>
                              {program.code && <Tag bordered={false}>{program.code}</Tag>}
                              {renderDifficultyTag(program.difficulty)}
                              {program.category && (
                                <Tag color="default">{program.category}</Tag>
                              )}
                              {program.requiresProctoring && (
                                <Tag color="purple">{i18nT("ui.konnected.certifications.certificationPrograms.proctored")}</Tag>
                              )}
                            </Space>
                          </div>
                          <div style={{ minHeight: 48 }}>{program.description}</div>
                        </div>

                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: '100%' }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{i18nT("ui.konnected.certifications.certificationPrograms.myProgress")}</span>
                            <span>{percent}%</span>
                          </div>
                          <Progress
                            percent={percent}
                            size="small"
                            status={percent >= passPercent ? 'success' : 'active'}
                          />
                        </Space>

                        {!!program.tags?.length && (
                          <Space wrap size={4}>
                            {program.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </Space>
                        )}

                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Button
                            type="primary"
                            icon={<ArrowRightOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartOrContinue(program);
                            }}
                          >
                            {program.userProgress?.status === 'completed'
                              ? i18nT("ui.konnected.certifications.certificationPrograms.viewResults")
                              : program.userProgress?.status === 'in_progress'
                              ? i18nT("ui.konnected.certifications.certificationPrograms.continue")
                              : i18nT("ui.konnected.certifications.certificationPrograms.start")}
                          </Button>
                        </Space>
                      </Space>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })
          )}
        </Row>

        {total > pageSize && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={total}
              showSizeChanger
              pageSizeOptions={['6', '12', '24']}
              onChange={(page, size) => {
                setCurrentPage(page);
                if (size && size !== pageSize) {
                  setPageSize(size);
                }
              }}
            />
          </div>
        )}

        <Drawer
          title={selectedProgram?.title}
          open={drawerOpen}
          width={480}
          onClose={() => setDrawerOpen(false)}
        >
          {selectedProgram && (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space direction="vertical" size={4}>
                <Space wrap>
                  {selectedProgram.code && (
                    <Tag bordered={false}>{selectedProgram.code}</Tag>
                  )}
                  {renderDifficultyTag(selectedProgram.difficulty)}
                  {selectedProgram.category && (
                    <Tag color="default">{selectedProgram.category}</Tag>
                  )}
                  {selectedProgram.requiresProctoring && (
                    <Tag color="purple">{i18nT("ui.konnected.certifications.certificationPrograms.proctored")}</Tag>
                  )}
                </Space>
              </Space>

              <div>
                <h3>{i18nT("ui.konnected.certifications.certificationPrograms.description")}</h3>
                <p>{selectedProgram.description}</p>
              </div>

              {!!selectedProgram.skills?.length && (
                <div>
                  <h3>{i18nT("ui.konnected.certifications.certificationPrograms.keySkillsVerified")}</h3>
                  <Space wrap>
                    {selectedProgram.skills.map((skill) => (
                      <Tag key={skill.id}>{skill.name}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              <div>
                <h3>{i18nT("ui.konnected.certifications.certificationPrograms.assessmentRules")}</h3>
                <ul style={{ paddingLeft: 20 }}>
                  <li>
                    {i18nT("ui.konnected.certifications.certificationPrograms.passingThreshold")}{' '}
                    <strong>
                      {selectedProgram.passPercent ?? CERT_PASS_PERCENT}%
                    </strong>
                  </li>
                  {selectedProgram.attemptsAllowed && (
                    <li>
                      {i18nT("ui.konnected.certifications.certificationPrograms.attemptsAllowed")}{' '}
                      <strong>{selectedProgram.attemptsAllowed}</strong>
                    </li>
                  )}
                  {typeof selectedProgram.estimatedHours === 'number' && (
                    <li>
                      {i18nT("ui.konnected.certifications.certificationPrograms.estimatedLearningTime")}{' '}
                      <strong>~{selectedProgram.estimatedHours} {i18nT("ui.konnected.certifications.certificationPrograms.hours")}</strong>
                    </li>
                  )}
                </ul>
              </div>

              {selectedProgram.userProgress && (
                <div>
                  <h3>{i18nT("ui.konnected.certifications.certificationPrograms.myCurrentStatus")}</h3>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space>
                      {renderStatusTag(selectedProgram)}
                      {typeof selectedProgram.userProgress.completionPercent ===
                        'number' && (
                        <span>
                          {selectedProgram.userProgress.completionPercent}
                          {i18nT("ui.konnected.certifications.certificationPrograms.complete")}
                        </span>
                      )}
                    </Space>
                    <Progress
                      percent={selectedProgram.userProgress.completionPercent}
                      status={
                        selectedProgram.userProgress.status === 'completed'
                          ? 'success'
                          : 'active'
                      }
                    />
                    {selectedProgram.userProgress.nextRecommendedStep && (
                      <Alert
                        type="info"
                        showIcon
                        message={i18nT("ui.konnected.certifications.certificationPrograms.nextRecommendedStep")}
                        description={selectedProgram.userProgress.nextRecommendedStep}
                      />
                    )}
                  </Space>
                </div>
              )}

              <Space style={{ marginTop: 8 }}>
                <Button
                  type="primary"
                  icon={<ArrowRightOutlined />}
                  onClick={() => handleStartOrContinue(selectedProgram)}
                >
                  {selectedProgram.userProgress?.status === 'completed'
                    ? i18nT("ui.konnected.certifications.certificationPrograms.viewResults")
                    : selectedProgram.userProgress?.status === 'in_progress'
                    ? i18nT("ui.konnected.certifications.certificationPrograms.continueCertification")
                    : i18nT("ui.konnected.certifications.certificationPrograms.startCertification")}
                </Button>
              </Space>
            </Space>
          )}
        </Drawer>
      </PageContainer>
    </KonnectedPageShell>
  );
}
