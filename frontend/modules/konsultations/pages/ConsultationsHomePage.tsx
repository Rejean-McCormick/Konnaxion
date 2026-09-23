// FILE: frontend/modules/konsultations/pages/ConsultationsHomePage.tsx
﻿'use client';

import { useLanguage } from '@/context/LanguageContext';
import { scopeLabel } from '@/i18n/uiModelLabels';
import {
  BarChartOutlined,
  GlobalOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  Button,
  Empty,
  Progress,
  Space,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';

import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchPublicBallots,
  type PublicBallot,
  type PublicBallotResponse,
} from '@/services/decide';
import {
  fetchImpactOutcomes,
  type OutcomeKPI,
} from '@/services/impact';

const { Paragraph, Text } = Typography;

type BallotRow = PublicBallot;
type ImpactData = Awaited<ReturnType<typeof fetchImpactOutcomes>>;

export default function ConsultationsHomePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.konsultations.pages.consultationshomepage.konsultationsHome"));

  const { data: ballotsData, loading: loadingBallots } =
    useRequest<PublicBallotResponse, []>(fetchPublicBallots);

  const { data: impactData, loading: loadingImpact } =
    useRequest<ImpactData, []>(fetchImpactOutcomes);

  const ballots = ballotsData?.ballots ?? [];
  const impactKpis = impactData?.kpis ?? [];
  const loading = loadingBallots || loadingImpact;

  const totalConsultations = ballots.length;
  const avgTurnout =
    totalConsultations > 0
      ? Math.round(
          ballots.reduce((sum, b) => sum + (b.turnout ?? 0), 0) /
            totalConsultations,
        )
      : 0;

  const closingSoonCount = ballots.filter((ballot) => {
    const closes = dayjs(ballot.closesAt);
    return closes.isValid() && closes.diff(dayjs(), 'hour') <= 48;
  }).length;

  const headerStats = [
    { label: i18nT("ui.konsultations.pages.consultationshomepage.activeConsultations"), value: totalConsultations },
    { label: i18nT("ui.konsultations.pages.consultationshomepage.avgParticipation"), value: avgTurnout, suffix: '%' },
    { label: i18nT("ui.konsultations.pages.consultationshomepage.closing48h"), value: closingSoonCount },
  ];

  const kpiByKey = new Map<string, OutcomeKPI>();
  for (const k of impactKpis) {
    kpiByKey.set(k.key, k);
  }

  const impactSummaryKpis: OutcomeKPI[] = [
    kpiByKey.get('resolved'),
    kpiByKey.get('participation'),
    kpiByKey.get('agreement'),
    kpiByKey.get('open'),
  ].filter(Boolean) as OutcomeKPI[];

  const columns: ProColumns<BallotRow>[] = [
    {
      title: i18nT("ui.konsultations.pages.consultationshomepage.consultation"),
      dataIndex: 'title',
      width: 320,
      ellipsis: true,
    },
    {
      title: i18nT("ui.konsultations.pages.consultationshomepage.closes"),
      dataIndex: 'closesAt',
      width: 220,
      render: (_, row) => {
        const closes = dayjs(row.closesAt);
        const closingSoon =
          closes.isValid() && closes.diff(dayjs(), 'hour') <= 48;

        return (
          <Space direction="vertical" size={2}>
            <span>
              {closes.isValid()
                ? closes.format('YYYY-MM-DD HH:mm')
                : '—'}
            </span>
            {closingSoon && <Tag color="volcano">{i18nT("ui.konsultations.pages.consultationshomepage.closingSoon")}</Tag>}
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.konsultations.pages.consultationshomepage.turnout"),
      dataIndex: 'turnout',
      width: 180,
      render: (_, row) => {
        const turnout = Math.round(row.turnout ?? 0);
        return (
          <Space>
            <Progress type="circle" percent={turnout} width={44} />
            <span>{turnout}%</span>
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.konsultations.pages.consultationshomepage.scope"),
      dataIndex: 'scope',
      width: 120,
      render: (_, row) => <Tag color="purple">{scopeLabel(i18nT, row.scope)}</Tag>,
    },
    {
      title: i18nT("ui.konsultations.pages.consultationshomepage.actions"),
      dataIndex: 'actions',
      width: 240,
      render: () => (
        <Space>
          <Link href="/ethikos/decide/public" prefetch={false}>
            <Button size="small" type="primary">
              {i18nT("ui.konsultations.pages.consultationshomepage.openVoting")}
            </Button>
          </Link>
          <Link href="/ethikos/decide/results" prefetch={false}>
            <Button size="small" icon={<BarChartOutlined />}>
              {i18nT("ui.konsultations.pages.consultationshomepage.results")}
            </Button>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      ghost
      loading={loading}
      header={{
        title: i18nT("ui.konsultations.pages.consultationshomepage.konsultations"),
        subTitle:
          i18nT("ui.konsultations.pages.consultationshomepage.timeBoxedPublicConsultationsOnEthikosTopics"),
      }}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.konsultations.pages.consultationshomepage.howKonsultationsFitIntoEthikos")}
          description={
            <Paragraph style={{ marginBottom: 0 }}>
              {i18nT("ui.konsultations.pages.consultationshomepage.consultationsSitOnTopOfKorumDebates")}
            </Paragraph>
          }
        />

        <ProCard gutter={16} wrap>
          {headerStats.map((stat) => (
            <StatisticCard
              key={stat.label}
              colSpan={{ xs: 24, sm: 8, md: 6 }}
              statistic={{
                title: stat.label,
                value: stat.value,
                suffix: stat.suffix,
              }}
            />
          ))}

          {impactSummaryKpis.map((kpi) => (
            <StatisticCard
              key={kpi.key}
              colSpan={{ xs: 24, sm: 8, md: 6 }}
              statistic={{
                title: kpi.label,
                value: kpi.value,
                suffix:
                  typeof kpi.delta === 'number' ? '%' : undefined,
              }}
            />
          ))}
        </ProCard>

        <ProCard
          title={i18nT("ui.konsultations.pages.consultationshomepage.openConsultationsSnapshot")}
          extra={
            <Space>
              <Text type="secondary">
                {i18nT("ui.konsultations.pages.consultationshomepage.snapshotOfPublicEthikosConsultationsCurrentlyOpen")}
              </Text>
              <Link href="/ethikos/decide/public" prefetch={false}>
                <Button
                  type="default"
                  size="small"
                  icon={<GlobalOutlined />}
                >
                  {i18nT("ui.konsultations.pages.consultationshomepage.goToFullList")}
                </Button>
              </Link>
            </Space>
          }
        >
          {ballots.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={i18nT("ui.konsultations.pages.consultationshomepage.noOpenPublicConsultationsRightNow")}
            />
          ) : (
            <ProTable<BallotRow>
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={ballots}
              pagination={{ pageSize: 5 }}
              search={false}
              options={false}
              toolBarRender={false}
            />
          )}
        </ProCard>

        <ProCard
          title={i18nT("ui.konsultations.pages.consultationshomepage.outcomesAndImplementation")}
          extra={
            <Space>
              <Link href="/ethikos/impact/outcomes" prefetch={false}>
                <Button
                  size="small"
                  icon={<BarChartOutlined />}
                >
                  {i18nT("ui.konsultations.pages.consultationshomepage.outcomesAnalytics")}
                </Button>
              </Link>
              <Link href="/ethikos/impact/tracker" prefetch={false}>
                <Button
                  size="small"
                  icon={<HistoryOutlined />}
                >
                  {i18nT("ui.konsultations.pages.consultationshomepage.impactTracker")}
                </Button>
              </Link>
            </Space>
          }
        >
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {i18nT("ui.konsultations.pages.consultationshomepage.useEthikosImpactDashboardsToFollowHow")}
          </Paragraph>
        </ProCard>
      </Space>
    </PageContainer>
  );
}
