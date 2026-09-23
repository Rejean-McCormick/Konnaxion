// FILE: frontend/app/konnected/certifications/exam-dashboard-results/page.tsx
// app/konnected/certifications/exam-dashboard-results/page.tsx
'use client'

import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useRequest } from 'ahooks'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  List,
  message,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useMemo, useState } from 'react'

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell'
import api from '@/services/_request'

const { Title, Text, Paragraph } = Typography

// NOTE: These thresholds mirror the global params from the CertifiKation spec.
// Keep in sync with backend/global-params.
const CERT_PASS_PERCENT = 80
const EXAM_RETRY_COOLDOWN_MIN = 30

// -----------------------------------------------------------------------------
// Domain types (aligned with Evaluation / CertificationPath / Portfolio models)
// -----------------------------------------------------------------------------

export type EvaluationStatus =
  | 'passed'
  | 'failed'
  | 'pending_peer'
  | 'under_review'
  | 'scheduled'
  | 'in_progress'

export interface ExamAttempt {
  id: string
  certificationPathId: string
  certificationPathName: string
  attemptNumber: number
  takenAt: string // ISO date
  deliveryMode: 'online' | 'offline' | 'blended'
  proctored: boolean
  scorePercent: number | null
  maxScore: number | null
  status: EvaluationStatus

  // Peer validation / review
  peerValidationRequired: boolean
  peerValidationStatus?: 'approved' | 'rejected' | 'pending'
  appealStatus?: 'none' | 'open' | 'resolved' | 'rejected'

  // Portfolio / certificate linkage
  certificateId?: string
  certificateUrl?: string
  portfolioItemId?: string
  portfolioUrl?: string

  // Retry & cooldown metadata
  canRetry: boolean
  nextRetryAt?: string // ISO date if blocked by cooldown
}

interface ExamAttemptsResponse {
  attempts: ExamAttempt[]
}

// -----------------------------------------------------------------------------
// API endpoint helpers
// -----------------------------------------------------------------------------
//
// IMPORTANT:
// - we use *relative* URLs WITHOUT a leading "/" so that axios baseURL
//   (NEXT_PUBLIC_API_BASE or "/api") is correctly applied.
// - On the wire this becomes:  /api/konnected/certifications/...
//

const EXAM_ATTEMPTS_ENDPOINT = 'konnected/certifications/exam-attempts/me'
const EXAM_ATTEMPT_DETAIL_ENDPOINT = (attemptId: string) =>
  `konnected/certifications/exam-attempts/${attemptId}`
const EXAM_APPEAL_ENDPOINT = (attemptId: string) =>
  `konnected/certifications/exam-attempts/${attemptId}/appeal`
const EXAM_RETRY_ENDPOINT = (attemptId: string) =>
  `konnected/certifications/exam-attempts/${attemptId}/retry`

async function fetchExamAttempts(): Promise<ExamAttemptsResponse> {
  return api.get<ExamAttemptsResponse>(EXAM_ATTEMPTS_ENDPOINT)
}

// -----------------------------------------------------------------------------
// Utility helpers
// -----------------------------------------------------------------------------

const formatDateTime = (iso: string | undefined) => {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString()
}

const getStatusTag = (attempt: ExamAttempt) => {
  if (attempt.status === 'scheduled') {
    return (
      <Tag icon={<ClockCircleOutlined />} color="default">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.scheduled" />
      </Tag>
    )
  }

  if (attempt.status === 'in_progress') {
    return (
      <Tag icon={<ClockCircleOutlined />} color="processing">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.inProgress" />
      </Tag>
    )
  }

  if (attempt.status === 'passed') {
    if (attempt.peerValidationRequired && attempt.peerValidationStatus !== 'approved') {
      // Passed automated evaluation but still waiting on peers
      return (
        <Tag icon={<ClockCircleOutlined />} color="processing">
          <TranslatedText id="ui.konnected.certifications.examDashboardResults.pendingPeerValidation" />
        </Tag>
      )
    }
    return (
      <Tag icon={<CheckCircleOutlined />} color="success">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.passed" />
      </Tag>
    )
  }

  if (attempt.status === 'failed') {
    return (
      <Tag icon={<ExclamationCircleOutlined />} color="error">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.notPassed" />
      </Tag>
    )
  }

  if (attempt.status === 'pending_peer') {
    return (
      <Tag icon={<ClockCircleOutlined />} color="processing">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.pendingPeerValidation" />
      </Tag>
    )
  }

  if (attempt.status === 'under_review') {
    return (
      <Tag icon={<ClockCircleOutlined />} color="warning">
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.underReview" />
      </Tag>
    )
  }

  return <Tag><TranslatedText id="ui.konnected.certifications.examDashboardResults.unknown" /></Tag>
}

const getAppealTag = (attempt: ExamAttempt) => {
  if (!attempt.appealStatus || attempt.appealStatus === 'none') {
    return null
  }

  if (attempt.appealStatus === 'open') {
    return (
      <Tag color="processing" icon={<ClockCircleOutlined />}>
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.appealOpen" />
      </Tag>
    )
  }

  if (attempt.appealStatus === 'resolved') {
    return (
      <Tag color="success" icon={<CheckCircleOutlined />}>
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.appealResolved" />
      </Tag>
    )
  }

  if (attempt.appealStatus === 'rejected') {
    return (
      <Tag color="error" icon={<ExclamationCircleOutlined />}>
        <TranslatedText id="ui.konnected.certifications.examDashboardResults.appealRejected" />
      </Tag>
    )
  }

  return null
}

type ScoreColor = 'success' | 'warning' | 'danger' | undefined

const getScoreColor = (percent: number | null): ScoreColor => {
  if (percent == null) return undefined
  if (percent >= CERT_PASS_PERCENT) return 'success'
  if (percent >= CERT_PASS_PERCENT - 10) return 'warning'
  return 'danger'
}

// -----------------------------------------------------------------------------
// Main component
// -----------------------------------------------------------------------------

const ExamDashboardResultsPage: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const [selectedAttempt, setSelectedAttempt] = useState<ExamAttempt | null>(null)
  const [appealLoadingId, setAppealLoadingId] = useState<string | null>(null)
  const [retryLoadingId, setRetryLoadingId] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const pathIdFromQuery = searchParams.get('pathId')

  const {
    data,
    loading,
    error,
    refresh: refreshAttempts,
  } = useRequest(fetchExamAttempts, {
    retryCount: 1,
  })

  const allAttempts = data?.attempts ?? []

  // If pathId is present, filter attempts to that certification path
  const attempts = useMemo(
    () =>
      pathIdFromQuery
        ? allAttempts.filter((a) => a.certificationPathId === pathIdFromQuery)
        : allAttempts,
    [allAttempts, pathIdFromQuery],
  )

  const stats = useMemo(() => {
    if (!attempts.length) {
      return {
        totalAttempts: 0,
        passedCount: 0,
        passRate: 0,
        avgScore: 0,
        uniqueCerts: 0,
      }
    }

    const totalAttempts = attempts.length
    const scoredAttempts = attempts.filter(
      (a) => typeof a.scorePercent === 'number',
    ) as Array<ExamAttempt & { scorePercent: number }>
    const passedCount = scoredAttempts.filter((a) => a.scorePercent >= CERT_PASS_PERCENT).length
    const passRate = scoredAttempts.length
      ? Math.round((passedCount / scoredAttempts.length) * 100)
      : 0
    const avgScore = scoredAttempts.length
      ? Math.round(
          scoredAttempts.reduce((sum, a) => sum + (a.scorePercent ?? 0), 0) /
            scoredAttempts.length,
        )
      : 0
    const uniqueCerts = new Set(
      attempts.map((a) => a.certificationPathId || a.certificationPathName),
    ).size

    return { totalAttempts, passedCount, passRate, avgScore, uniqueCerts }
  }, [attempts])

  const handleOpenDetails = async (attempt: ExamAttempt) => {
    try {
      const detail = await api.get<ExamAttempt>(EXAM_ATTEMPT_DETAIL_ENDPOINT(attempt.id))
      setSelectedAttempt(detail)
    } catch {
      // Fallback to row data if detail endpoint is not yet wired.
      setSelectedAttempt(attempt)
    }
  }

  const handleCloseDetails = () => {
    setSelectedAttempt(null)
  }

  const handleOpenCertificate = (attempt: ExamAttempt) => {
    if (attempt.certificateUrl) {
      window.open(attempt.certificateUrl, '_blank', 'noopener,noreferrer')
    } else {
      message.info(i18nT("ui.konnected.certifications.examDashboardResults.certificateIsNotYetAvailableForThis"))
    }
  }

  const handleOpenPortfolio = (attempt: ExamAttempt) => {
    if (attempt.portfolioUrl) {
      window.open(attempt.portfolioUrl, '_blank', 'noopener,noreferrer')
    } else {
      message.info(i18nT("ui.konnected.certifications.examDashboardResults.thisAttemptIsNotYetLinkedTo"))
    }
  }

  const handleOpenAppeal = async (attempt: ExamAttempt) => {
    setAppealLoadingId(attempt.id)
    try {
      const updated = await api.post<ExamAttempt>(EXAM_APPEAL_ENDPOINT(attempt.id))
      setSelectedAttempt((prev) => (prev && prev.id === attempt.id ? updated : prev))
      refreshAttempts()
      message.success(i18nT("ui.konnected.certifications.examDashboardResults.appealRequestSubmittedYouWillBeNotified"))
    } catch {
      message.error(i18nT("ui.konnected.certifications.examDashboardResults.unableToSubmitAppealPleaseTryAgain"))
    } finally {
      setAppealLoadingId(null)
    }
  }

  const handleRetry = async (attempt: ExamAttempt) => {
    setRetryLoadingId(attempt.id)
    try {
      const newAttempt = await api.post<ExamAttempt>(EXAM_RETRY_ENDPOINT(attempt.id))
      refreshAttempts()
      message.success(i18nT("ui.konnected.certifications.examDashboardResults.newAttemptScheduledSuccessfully"))

      // Redirect into the certification flow for this path
      if (newAttempt.certificationPathId) {
        router.push(
          `/konnected/certifications/exam-preparation?pathId=${newAttempt.certificationPathId}`,
        )
      } else if (attempt.certificationPathId) {
        router.push(
          `/konnected/certifications/exam-preparation?pathId=${attempt.certificationPathId}`,
        )
      }
    } catch (err: unknown) {
      let detail: string | null = null
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: unknown }).response
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as { data?: unknown }).data
          if (data && typeof data === 'object' && 'detail' in data) {
            const value = (data as { detail?: unknown }).detail
            detail = typeof value === 'string' ? value : null
          }
        }
      }

      if (detail) {
        // e.g. "Retry cooldown is still active for this exam."
        message.error(detail)
      } else {
        message.error(i18nT("ui.konnected.certifications.examDashboardResults.unableToStartANewAttemptPlease"))
      }
    } finally {
      setRetryLoadingId(null)
    }
  }

  const columns: ColumnsType<ExamAttempt> = [
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.certificationPath"),
      dataIndex: 'certificationPathName',
      key: 'certificationPathName',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {i18nT("ui.konnected.certifications.examDashboardResults.attempt")}{record.attemptNumber}
          </Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.status"),
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: i18nT("ui.konnected.certifications.examDashboardResults.passed"), value: 'passed' },
        { text: i18nT("ui.konnected.certifications.examDashboardResults.notPassed"), value: 'failed' },
        { text: i18nT("ui.konnected.certifications.examDashboardResults.pendingPeerValidation"), value: 'pending_peer' },
        { text: i18nT("ui.konnected.certifications.examDashboardResults.underReview"), value: 'under_review' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (_value, record) => (
        <Space direction="vertical" size={2}>
          {getStatusTag(record)}
          {getAppealTag(record)}
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.score"),
      dataIndex: 'scorePercent',
      key: 'scorePercent',
      render: (value: number | null) => {
        if (value == null) {
          return <Text type="secondary">{i18nT("ui.konnected.certifications.examDashboardResults.pending")}</Text>
        }
        const color = getScoreColor(value)
        return (
          <Space direction="vertical" size={0}>
            <Text
              strong
              type={
                color === 'success'
                  ? 'success'
                  : color === 'danger'
                  ? 'danger'
                  : color === 'warning'
                  ? 'warning'
                  : undefined
              }
            >
              {value}%
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.konnected.certifications.examDashboardResults.passThreshold")} {CERT_PASS_PERCENT}%
            </Text>
          </Space>
        )
      },
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.date"),
      dataIndex: 'takenAt',
      key: 'takenAt',
      render: (value: string) => <Text>{formatDateTime(value)}</Text>,
      sorter: (a, b) => {
        const aTime = new Date(a.takenAt).getTime()
        const bTime = new Date(b.takenAt).getTime()
        return aTime - bTime
      },
      defaultSortOrder: 'descend',
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.delivery"),
      dataIndex: 'deliveryMode',
      key: 'deliveryMode',
      render: (_value, record) => (
        <Space direction="vertical" size={0}>
          <Text>{record.deliveryMode === 'online' ? i18nT("ui.konnected.certifications.examDashboardResults.online") : record.deliveryMode}</Text>
          {record.proctored && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.konnected.certifications.examDashboardResults.proctored")}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.validation"),
      key: 'validation',
      render: (_value, record) => {
        if (!record.peerValidationRequired) {
          return <Text type="secondary">{i18nT("ui.konnected.certifications.examDashboardResults.notRequired")}</Text>
        }
        if (!record.peerValidationStatus || record.peerValidationStatus === 'pending') {
          return (
            <Tag icon={<ClockCircleOutlined />} color="processing">
              {i18nT("ui.konnected.certifications.examDashboardResults.waitingForPeers")}
            </Tag>
          )
        }
        if (record.peerValidationStatus === 'approved') {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              {i18nT("ui.konnected.certifications.examDashboardResults.peerApproved")}
            </Tag>
          )
        }
        if (record.peerValidationStatus === 'rejected') {
          return (
            <Tag icon={<ExclamationCircleOutlined />} color="error">
              {i18nT("ui.konnected.certifications.examDashboardResults.peerRejected")}
            </Tag>
          )
        }
        return <Text type="secondary">—</Text>
      },
    },
    {
      title: i18nT("ui.konnected.certifications.examDashboardResults.actions"),
      key: 'actions',
      render: (_value, record) => (
        <Space>
          <Tooltip title={i18nT("ui.konnected.certifications.examDashboardResults.viewAttemptDetails")}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetails(record)}
            />
          </Tooltip>
          <Tooltip title={i18nT("ui.konnected.certifications.examDashboardResults.openCertificateIfAvailable")}>
            <Button
              size="small"
              icon={<FilePdfOutlined />}
              onClick={() => handleOpenCertificate(record)}
              disabled={!record.certificateUrl}
            />
          </Tooltip>
          <Tooltip title={i18nT("ui.konnected.certifications.examDashboardResults.openPortfolioEntryIfAvailable")}>
            <Button
              size="small"
              onClick={() => handleOpenPortfolio(record)}
              disabled={!record.portfolioUrl}
            >
              {i18nT("ui.konnected.certifications.examDashboardResults.portfolio")}
            </Button>
          </Tooltip>
          <Tooltip title={i18nT("ui.konnected.certifications.examDashboardResults.requestAManualReviewOfThisAttempt")}>
            <Button
              size="small"
              type="default"
              icon={<WarningOutlined />}
              loading={appealLoadingId === record.id}
              onClick={() => handleOpenAppeal(record)}
              disabled={record.appealStatus === 'open'}
            >
              {i18nT("ui.konnected.certifications.examDashboardResults.appeal")}
            </Button>
          </Tooltip>
          <Tooltip title={i18nT("ui.konnected.certifications.examDashboardResults.startANewAttemptIfAllowed")}>
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              loading={retryLoadingId === record.id}
              onClick={() => handleRetry(record)}
              disabled={!record.canRetry}
            >
              {i18nT("ui.konnected.certifications.examDashboardResults.retry")}
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  // ---------------------------------------------------------------------------
  // Derived blocks
  // ---------------------------------------------------------------------------

  const kpiCards = (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title={i18nT("ui.konnected.certifications.examDashboardResults.totalAttempts")} value={stats.totalAttempts} />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title={i18nT("ui.konnected.certifications.examDashboardResults.pathsPassed")}
            value={stats.passedCount}
            suffix={`/ ${stats.uniqueCerts || stats.totalAttempts || 0}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title={i18nT("ui.konnected.certifications.examDashboardResults.passRate")} value={stats.passRate} suffix="%" />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic title={i18nT("ui.konnected.certifications.examDashboardResults.averageScore")} value={stats.avgScore} suffix="%" />
        </Card>
      </Col>
    </Row>
  )

  const cooldownAlerts = (() => {
    const blockedAttempts = attempts.filter(
      (a) => !a.canRetry && a.nextRetryAt && a.status === 'failed',
    )
    if (!blockedAttempts.length) return null

    return (
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={i18nT("ui.konnected.certifications.examDashboardResults.retryCooldownInEffect")}
        description={
          <Space direction="vertical">
            <Text>
              {i18nT("ui.konnected.certifications.examDashboardResults.retryBlockExplanation")}
            </Text>
            <List
              size="small"
              dataSource={blockedAttempts}
              renderItem={(a) => (
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Text strong>{a.certificationPathName}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {i18nT("ui.konnected.certifications.examDashboardResults.nextRetryAvailable")} {formatDateTime(a.nextRetryAt)}
                    </Text>
                  </Space>
                </List.Item>
              )}
            />
            <Text type="secondary">
              {i18nT("ui.konnected.certifications.examDashboardResults.globalPolicy")} {EXAM_RETRY_COOLDOWN_MIN} {i18nT("ui.konnected.certifications.examDashboardResults.minutesMinimumBetweenFailedAttemptsOnThe")}
            </Text>
          </Space>
        }
      />
    )
  })()

  // ---------------------------------------------------------------------------
  // Global loading / error / empty handling
  // ---------------------------------------------------------------------------

  if (loading && !data) {
    return (
      <KonnectedPageShell
        title={i18nT("ui.konnected.certifications.examDashboardResults.examDashboardResults")}
        subtitle={i18nT("ui.konnected.certifications.examDashboardResults.trackYourCertificationExamAttemptsScoresAnd")}
      >
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      </KonnectedPageShell>
    )
  }

  if (error) {
    return (
      <KonnectedPageShell
        title={i18nT("ui.konnected.certifications.examDashboardResults.examDashboardResults")}
        subtitle={i18nT("ui.konnected.certifications.examDashboardResults.trackYourCertificationExamAttemptsScoresAnd")}
      >
        <div style={{ padding: 24 }}>
          <Result
            status="error"
            title={i18nT("ui.konnected.certifications.examDashboardResults.weCouldNotLoadYourExamResults")}
            subTitle={i18nT("ui.konnected.certifications.examDashboardResults.serviceContactError")}
            extra={
              <Button type="primary" onClick={() => refreshAttempts()}>
                {i18nT("ui.konnected.certifications.examDashboardResults.retryLoading")}
              </Button>
            }
          />
        </div>
      </KonnectedPageShell>
    )
  }

  // No attempts at all for this user (global empty state)
  if (!allAttempts.length) {
    return (
      <KonnectedPageShell
        title={i18nT("ui.konnected.certifications.examDashboardResults.examDashboardResults")}
        subtitle={i18nT("ui.konnected.certifications.examDashboardResults.trackYourCertificationExamAttemptsScoresAnd")}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>{i18nT("ui.konnected.certifications.examDashboardResults.youHaveNotAttemptedAnyCertificationExams")}</Text>
                    <Text type="secondary">
                      {i18nT("ui.konnected.certifications.examDashboardResults.onceYouCompleteAnExamInThe")}
                    </Text>
                  </Space>
                }
              >
                <Button
                  type="primary"
                  href="/konnected/certifications/exam-registration"
                >
                  {i18nT("ui.konnected.certifications.examDashboardResults.browseCertificationExams")}
                </Button>
              </Empty>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title={i18nT("ui.konnected.certifications.examDashboardResults.howThisDashboardWorks")}>
              <Space direction="vertical">
                <Text>
                  {i18nT("ui.konnected.certifications.examDashboardResults.thisDashboardConsolidatesAllYourExamAttempts")}
                </Text>
                <List
                  size="small"
                  dataSource={[
                    'Each attempt shows your score, pass/fail status, and validation state.',
                    'If peer validation is required, you will see when it is pending or approved.',
                    'Once a certification is granted, you can open the official certificate and any portfolio entry.',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text type="secondary">{item}</Text>
                    </List.Item>
                  )}
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </KonnectedPageShell>
    )
  }

  // There are attempts overall, but none for the current path filter
  if (!attempts.length) {
    return (
      <KonnectedPageShell
        title={i18nT("ui.konnected.certifications.examDashboardResults.examDashboardResults")}
        subtitle={i18nT("ui.konnected.certifications.examDashboardResults.trackYourCertificationExamAttemptsScoresAnd")}
      >
        <Row gutter={24}>
          <Col xs={24} md={16}>
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>{i18nT("ui.konnected.certifications.examDashboardResults.noAttemptsYetForThisCertification")}</Text>
                    <Text type="secondary">
                      {i18nT("ui.konnected.certifications.examDashboardResults.youCanRegisterForAnExamSession")}
                    </Text>
                  </Space>
                }
              >
                <Button
                  type="primary"
                  href="/konnected/certifications/exam-registration"
                >
                  {i18nT("ui.konnected.certifications.examDashboardResults.goToExamRegistration")}
                </Button>
              </Empty>
            </Card>
          </Col>
        </Row>
      </KonnectedPageShell>
    )
  }

  // ---------------------------------------------------------------------------
  // Main content (normal case with attempts)
  // ---------------------------------------------------------------------------

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.certifications.examDashboardResults.examDashboardResults")}
      subtitle={i18nT("ui.konnected.certifications.examDashboardResults.trackYourCertificationExamAttemptsScoresAnd")}
    >
      <Space direction="vertical" size={24} style={{ width: '100%' }}>
        {cooldownAlerts}

        {kpiCards}

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Card
              title={i18nT("ui.konnected.certifications.examDashboardResults.recentExamAttempts")}
              extra={
                <Space>
                  <Badge color="success" text={i18nT("ui.konnected.certifications.examDashboardResults.passed")} />
                  <Badge color="error" text={i18nT("ui.konnected.certifications.examDashboardResults.notPassed")} />
                  <Badge color="processing" text={i18nT("ui.konnected.certifications.examDashboardResults.pendingInProgress")} />
                </Space>
              }
            >
              <Table<ExamAttempt>
                rowKey="id"
                columns={columns}
                dataSource={attempts}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                onRow={(record) => ({
                  onClick: () => handleOpenDetails(record),
                })}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card title={i18nT("ui.konnected.certifications.examDashboardResults.certificationOutcomes")}>
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  <Paragraph>
                    {i18nT("ui.konnected.certifications.examDashboardResults.whenYouPassACertifikationPathAnd")}
                  </Paragraph>
                  <List
                    size="small"
                    dataSource={[
                      'Recorded in the Evaluation & CertificationPath tables.',
                      'Linked to your Portfolio as a verifiable achievement.',
                      'Exposed as a downloadable/shareable certificate.',
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <Text type="secondary">{item}</Text>
                      </List.Item>
                    )}
                  />
                </Space>
              </Card>

              <Card title={i18nT("ui.konnected.certifications.examDashboardResults.tipsForImprovingYourScore")}>
                <List
                  size="small"
                  dataSource={[
                    'Review the learning path content linked to this certification.',
                    'Use the Exam Preparation page to practice with sample questions.',
                    'Respect cooldowns between attempts to avoid rushed retries.',
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text type="secondary">{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>
        </Row>

        {/* Details drawer */}
        <Drawer
          title={i18nT("ui.konnected.certifications.examDashboardResults.examAttemptDetails")}
          width={520}
          open={!!selectedAttempt}
          onClose={handleCloseDetails}
          destroyOnClose
        >
          {selectedAttempt ? (
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Title level={4}>{selectedAttempt.certificationPathName}</Title>
                <Text type="secondary">
                  {i18nT("ui.konnected.certifications.examDashboardResults.attempt")}{selectedAttempt.attemptNumber} ·{' '}
                  {formatDateTime(selectedAttempt.takenAt)}
                </Text>
              </div>

              <Space size={16}>
                <Statistic
                  title={i18nT("ui.konnected.certifications.examDashboardResults.score")}
                  value={selectedAttempt.scorePercent ?? 0}
                  suffix="%"
                />
                <Statistic
                  title={i18nT("ui.konnected.certifications.examDashboardResults.passThreshold_5f0fe9")}
                  value={CERT_PASS_PERCENT}
                  suffix="%"
                />
              </Space>

              <Space direction="vertical" size={8}>
                <Text strong>{i18nT("ui.konnected.certifications.examDashboardResults.status")}</Text>
                {getStatusTag(selectedAttempt)}
                {getAppealTag(selectedAttempt)}
              </Space>

              <Space direction="vertical" size={8}>
                <Text strong>{i18nT("ui.konnected.certifications.examDashboardResults.validationReview")}</Text>
                <Space direction="vertical" size={4}>
                  <Text>
                    {i18nT("ui.konnected.certifications.examDashboardResults.peerValidationRequired")}{' '}
                    {selectedAttempt.peerValidationRequired ? i18nT("ui.konnected.certifications.examDashboardResults.yes") : i18nT("ui.konnected.certifications.examDashboardResults.no")}
                  </Text>
                  <Text>
                    {i18nT("ui.konnected.certifications.examDashboardResults.peerValidationStatus")}{' '}
                    {selectedAttempt.peerValidationStatus ?? '—'}
                  </Text>
                  <Text>{i18nT("ui.konnected.certifications.examDashboardResults.appealStatus")} {selectedAttempt.appealStatus ?? i18nT("ui.konnected.certifications.examDashboardResults.none")}</Text>
                </Space>
              </Space>

              <Space direction="vertical" size={8}>
                <Text strong>{i18nT("ui.konnected.certifications.examDashboardResults.deliveryConditions")}</Text>
                <Space direction="vertical" size={4}>
                  <Text>{i18nT("ui.konnected.certifications.examDashboardResults.mode")} {selectedAttempt.deliveryMode}</Text>
                  <Text>{i18nT("ui.konnected.certifications.examDashboardResults.proctored_4bc147")} {selectedAttempt.proctored ? i18nT("ui.konnected.certifications.examDashboardResults.yes") : i18nT("ui.konnected.certifications.examDashboardResults.no")}</Text>
                </Space>
              </Space>

              <Space direction="vertical" size={8}>
                <Text strong>{i18nT("ui.konnected.certifications.examDashboardResults.linkedAssets")}</Text>
                <Space>
                  <Button
                    icon={<FilePdfOutlined />}
                    onClick={() => handleOpenCertificate(selectedAttempt)}
                    disabled={!selectedAttempt.certificateUrl}
                  >
                    {i18nT("ui.konnected.certifications.examDashboardResults.openCertificate")}
                  </Button>
                  <Button
                    onClick={() => handleOpenPortfolio(selectedAttempt)}
                    disabled={!selectedAttempt.portfolioUrl}
                  >
                    {i18nT("ui.konnected.certifications.examDashboardResults.viewPortfolioEntry")}
                  </Button>
                </Space>
              </Space>

              {selectedAttempt.nextRetryAt && (
                <Alert
                  type={selectedAttempt.canRetry ? 'success' : 'info'}
                  showIcon
                  message={
                    selectedAttempt.canRetry
                      ? i18nT("ui.konnected.certifications.examDashboardResults.youCanStartANewAttemptNow")
                      : i18nT("ui.konnected.certifications.examDashboardResults.retryCooldownInEffectForThisPath")
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text>
                        {i18nT("ui.konnected.certifications.examDashboardResults.nextRetryAvailable")} {formatDateTime(selectedAttempt.nextRetryAt)}
                      </Text>
                      <Text type="secondary">
                        {i18nT("ui.konnected.certifications.examDashboardResults.globalCooldown")} {EXAM_RETRY_COOLDOWN_MIN} {i18nT("ui.konnected.certifications.examDashboardResults.minutesBetweenAttemptsOnTheSamePath")}
                      </Text>
                    </Space>
                  }
                />
              )}

              <Space>
                <Button
                  type="default"
                  icon={<WarningOutlined />}
                  loading={appealLoadingId === selectedAttempt.id}
                  onClick={() => handleOpenAppeal(selectedAttempt)}
                  disabled={selectedAttempt.appealStatus === 'open'}
                >
                  {i18nT("ui.konnected.certifications.examDashboardResults.openAppeal")}
                </Button>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  loading={retryLoadingId === selectedAttempt.id}
                  onClick={() => handleRetry(selectedAttempt)}
                  disabled={!selectedAttempt.canRetry}
                >
                  {i18nT("ui.konnected.certifications.examDashboardResults.startNewAttempt")}
                </Button>
              </Space>
            </Space>
          ) : (
            <Spin />
          )}
        </Drawer>
      </Space>
    </KonnectedPageShell>
  )
}

export default ExamDashboardResultsPage
