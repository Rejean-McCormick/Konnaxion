'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Tooltip,
} from 'antd';
import {
  ArrowRightOutlined,
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';

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
 * API client for the CertifiKation catalog.
 * Adjust the path string to match your actual backend route if needed.
 */
async function fetchCertificationPrograms(): Promise<ProgramsResponse> {
  // Backend path is derived from the CertifiKation / KonnectED API spec.
  // Update if your OpenAPI uses a slightly different route.
  return get<ProgramsResponse>('certs/programs');
}

export default function CertificationProgramsPage(): JSX.Element {
  usePageTitle('KonnectED · Certification Programs');
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
      return <Tag>Not started</Tag>;
    }

    if (progress.status === 'in_progress') {
      return <Tag color="blue">In progress</Tag>;
    }

    if (progress.status === 'completed') {
      return <Tag color="green">Completed</Tag>;
    }

    return null;
  };

  const renderDifficultyTag = (difficulty: ProgramDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return <Tag color="green">Beginner</Tag>;
      case 'intermediate':
        return <Tag color="blue">Intermediate</Tag>;
      case 'advanced':
        return <Tag color="orange">Advanced</Tag>;
      case 'expert':
        return <Tag color="red">Expert</Tag>;
      default:
        return null;
    }
  };

  const errorState = error ? normalizeError(error) : null;
  const errorMessage = errorState?.message ?? null;

  return (
    <KonnectedPageShell
      title="Certification Programs"
      subtitle="Browse certification paths, track your progress, and launch formal evaluations."
      primaryAction={
        <Button
          type="primary"
          icon={<SafetyCertificateOutlined />}
          onClick={() => {
            // Simple heuristic: jump to first in-progress or featured program
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
          Go to my next certification
        </Button>
      }
    >
      <PageContainer ghost loading={loading}>
        <Row gutter={[16, 16]}>
          {/* Stats */}
          <Col xs={24} md={10} lg={8}>
            <ProCard
              ghost
              title="My CertifiKation overview"
              extra={
                <Tooltip title={`Global pass threshold is ${CERT_PASS_PERCENT}% for most exams.`}>
                  <InfoCircleOutlined />
                </Tooltip>
              }
            >
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic title="Total programs" value={stats.totalPrograms} />
                </Col>
                <Col span={12}>
                  <Statistic title="Active" value={stats.activePrograms} />
                </Col>
                <Col span={12}>
                  <Statistic title="Completed" value={stats.completedPrograms} />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Avg. completion"
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
                  <span>Overall progress toward certifications</span>
                  <span>{stats.averageCompletion}%</span>
                </div>
                <Progress percent={stats.averageCompletion} size="small" />
              </div>
            </ProCard>
          </Col>

          {/* Filters */}
          <Col xs={24} md={14} lg={16}>
            <ProCard ghost title="Filter programs">
              <Row gutter={[12, 12]}>
                <Col span={24}>
                  <Input
                    allowClear
                    prefix={<SearchOutlined />}
                    placeholder="Search by name, code, tag, or description"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>Difficulty</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={difficultyFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        All
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'beginner' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('beginner');
                          setCurrentPage(1);
                        }}
                      >
                        Beginner
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'intermediate' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('intermediate');
                          setCurrentPage(1);
                        }}
                      >
                        Intermediate
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'advanced' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('advanced');
                          setCurrentPage(1);
                        }}
                      >
                        Advanced
                      </Button>
                      <Button
                        size="small"
                        type={difficultyFilter === 'expert' ? 'primary' : 'default'}
                        onClick={() => {
                          setDifficultyFilter('expert');
                          setCurrentPage(1);
                        }}
                      >
                        Expert
                      </Button>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>Status</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={statusFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        All
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'not_started' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('not_started');
                          setCurrentPage(1);
                        }}
                      >
                        Not started
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'in_progress' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('in_progress');
                          setCurrentPage(1);
                        }}
                      >
                        In progress
                      </Button>
                      <Button
                        size="small"
                        type={statusFilter === 'completed' ? 'primary' : 'default'}
                        onClick={() => {
                          setStatusFilter('completed');
                          setCurrentPage(1);
                        }}
                      >
                        Completed
                      </Button>
                    </Space>
                  </Space>
                </Col>

                <Col xs={24} sm={8}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <span>Category</span>
                    <Space wrap>
                      <Button
                        size="small"
                        type={categoryFilter === 'all' ? 'primary' : 'default'}
                        onClick={() => {
                          setCategoryFilter('all');
                          setCurrentPage(1);
                        }}
                      >
                        All
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
            message="Unable to load certification programs"
            description={
              <Space align="start">
                <span>{errorMessage}</span>
                <Button size="small" onClick={() => refresh()}>
                  Retry
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
                      ? 'No certification programs match your filters.'
                      : 'No certification programs are available yet.'
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
                      Clear filters
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
                    text={program.isFeatured ? 'Featured' : undefined}
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
                                <Tag color="purple">Proctored</Tag>
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
                            <span>My progress</span>
                            <span>{percent}%</span>
                          </div>
                          <Progress
                            percent={percent}
                            size="small"
                            status={percent >= passPercent ? 'success' : 'active'}
                          />
                        </Space>

                        <Space
                          size={8}
                          wrap
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Space size={4} wrap>
                            {program.skills?.slice(0, 3).map((skill) => (
                              <Tag key={skill.id}>{skill.name}</Tag>
                            ))}
                            {program.skills && program.skills.length > 3 && (
                              <Tag>+{program.skills.length - 3} more</Tag>
                            )}
                          </Space>

                          {typeof program.estimatedHours === 'number' && (
                            <Tooltip title="Estimated total learning time for this path">
                              <span style={{ fontSize: 12, color: '#888' }}>
                                ~{program.estimatedHours}h
                              </span>
                            </Tooltip>
                          )}
                        </Space>

                        <Space
                          style={{
                            marginTop: 8,
                            width: '100%',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Button
                            size="small"
                            type="link"
                            onClick={() => handleOpenDetails(program)}
                          >
                            View details
                          </Button>

                          <Button
                            type="primary"
                            size="small"
                            icon={<ArrowRightOutlined />}
                            onClick={() => handleStartOrContinue(program)}
                          >
                            {program.userProgress?.status === 'completed'
                              ? 'View results'
                              : program.userProgress?.status === 'in_progress'
                              ? 'Continue'
                              : 'Start'}
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

        {/* Pagination */}
        {total > 0 && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Space>
              <span style={{ fontSize: 12, color: '#888' }}>
                Showing {startIndex + 1}-{Math.min(startIndex + pageSize, total)} of {total}{' '}
                programs
              </span>
              <Input
                type="number"
                min={3}
                max={24}
                value={pageSize}
                style={{ width: 80 }}
                onChange={(e) => {
                  const value = Number(e.target.value) || 6;
                  setPageSize(value);
                  setCurrentPage(1);
                }}
                addonBefore="Page size"
              />
            </Space>
          </div>
        )}

        {/* Drawer: full program details */}
        <Drawer
          open={drawerOpen}
          width={520}
          title={
            <Space>
              <SafetyCertificateOutlined />
              <span>{selectedProgram?.title ?? 'Certification details'}</span>
            </Space>
          }
          onClose={() => {
            setDrawerOpen(false);
            setSelectedProgram(null);
          }}
          destroyOnClose
        >
          {selectedProgram && (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Space size={8} wrap>
                {selectedProgram.code && <Tag>{selectedProgram.code}</Tag>}
                {renderDifficultyTag(selectedProgram.difficulty)}
                {selectedProgram.category && (
                  <Tag color="default">{selectedProgram.category}</Tag>
                )}
                {selectedProgram.requiresProctoring && (
                  <Tag color="purple">Proctored exam</Tag>
                )}
              </Space>

              <div>
                <h3>Description</h3>
                <p>{selectedProgram.description}</p>
              </div>

              {!!selectedProgram.skills?.length && (
                <div>
                  <h3>Key skills verified</h3>
                  <Space wrap>
                    {selectedProgram.skills.map((skill) => (
                      <Tag key={skill.id}>{skill.name}</Tag>
                    ))}
                  </Space>
                </div>
              )}

              <div>
                <h3>Assessment rules</h3>
                <ul style={{ paddingLeft: 20 }}>
                  <li>
                    Passing threshold:{' '}
                    <strong>
                      {selectedProgram.passPercent ?? CERT_PASS_PERCENT}%
                    </strong>
                  </li>
                  {selectedProgram.attemptsAllowed && (
                    <li>
                      Attempts allowed:{' '}
                      <strong>{selectedProgram.attemptsAllowed}</strong>
                    </li>
                  )}
                  {typeof selectedProgram.estimatedHours === 'number' && (
                    <li>
                      Estimated learning time:{' '}
                      <strong>~{selectedProgram.estimatedHours} hours</strong>
                    </li>
                  )}
                </ul>
              </div>

              {selectedProgram.userProgress && (
                <div>
                  <h3>My current status</h3>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <Space>
                      {renderStatusTag(selectedProgram)}
                      {typeof selectedProgram.userProgress.completionPercent ===
                        'number' && (
                        <span>
                          {selectedProgram.userProgress.completionPercent}
                          % complete
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
                        message="Next recommended step"
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
                    ? 'View results'
                    : selectedProgram.userProgress?.status === 'in_progress'
                    ? 'Continue certification'
                    : 'Start certification'}
                </Button>
              </Space>
            </Space>
          )}
        </Drawer>
      </PageContainer>
    </KonnectedPageShell>
  );
}
