// FILE: frontend/app/ekoh/overview-analytics/current-ekoh-score/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  Alert,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import EkohPageShell from '@/app/ekoh/EkohPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { EkohExpertiseScore, EkohScoreHistoryEntry } from '@/services/ekoh';

const { Paragraph, Text } = Typography;

function percent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function dateLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

const historyColumns = (i18nT: TranslateFunction): ColumnsType<EkohScoreHistoryEntry> => ([
  {
    title: i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.changed"),
    dataIndex: 'changedAt',
    key: 'changedAt',
    render: (value: string) => dateLabel(value),
  },
  {
    title: i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.domain"),
    key: 'domain',
    render: (_, row) => (
      <Space wrap>
        <Text>{row.domainName}</Text>
        <Tag>{row.domainCode}</Tag>
      </Space>
    ),
  },
  {
    title: i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.previous"),
    dataIndex: 'oldValue',
    key: 'oldValue',
    render: (value: number) => `${percent(value)}%`,
  },
  {
    title: i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.current"),
    dataIndex: 'newValue',
    key: 'newValue',
    render: (value: number) => `${percent(value)}%`,
  },
  {
    title: i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.reason"),
    dataIndex: 'changeReason',
    key: 'changeReason',
    render: (value: string) => value || i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.notSupplied"),
  },
]);

export default function CurrentEkohScore(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const profile = data?.ekohProfile ?? null;
  const expertise = profile?.expertise ?? [];
  const history = profile?.scoreHistory ?? [];
  const topDomain = expertise[0];

  return (
    <EkohPageShell
      title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.ekohProfileAnalytics")}
      subtitle={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.canonicalExpertiseEthicsContextVisibilityAndDisclosed")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.unableToLoadEkohProfile")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.noSyntheticCompositeScore")}
        description={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.ekohExposesDomainExpertiseAndAnEthics")}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.expertiseDomains")} value={expertise.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.strongestDomain")}
              value={topDomain ? percent(topDomain.weightedScore) : 0}
              suffix={topDomain ? '%' : undefined}
            />
            {topDomain && <Tag style={{ marginTop: 8 }}>{topDomain.domainName}</Tag>}
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.ethicsReliabilityModifier")}
              value={profile?.ethicsScore ?? 1}
              precision={2}
              suffix="×"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.ratingVisibility")}
              value={profile?.ratingVisibility ?? 'N/A'}
            />
          </Card>
        </Col>
      </Row>

      <Card title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.domainExpertise")} loading={isLoading} style={{ marginTop: 16 }}>
        {expertise.length ? (
          <List<EkohExpertiseScore>
            dataSource={expertise}
            renderItem={(item) => {
              const value = percent(item.weightedScore);
              return (
                <List.Item key={item.domainCode}>
                  <div style={{ width: '100%' }}>
                    <Space
                      style={{ width: '100%', justifyContent: 'space-between' }}
                      wrap
                    >
                      <Space wrap>
                        <Text strong>{item.domainName}</Text>
                        <Tag>{item.domainCode}</Tag>
                      </Space>
                      <Text type="secondary">{value}%</Text>
                    </Space>
                    <Progress percent={value} showInfo={false} />
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.noCanonicalEkohExpertiseProfileAvailable")} />
        )}
      </Card>

      <Card title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.disclosedScoreHistory")} loading={isLoading} style={{ marginTop: 16 }}>
        {history.length ? (
          <Table<EkohScoreHistoryEntry>
            rowKey={(row) => `${row.domainCode}-${row.changedAt}`}
            columns={historyColumns(i18nT)}
            dataSource={history}
            pagination={false}
          />
        ) : (
          <Empty description={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.noScoreHistoryAvailableInTheCurrent")} />
        )}
      </Card>

      {profile?.ratingPublicationBasis && (
        <Card title={i18nT("ui.ekoh.overviewAnalytics.currentEkohScore.publicationBasis")} style={{ marginTop: 16 }}>
          <Paragraph style={{ marginBottom: 0 }}>
            {profile.ratingPublicationBasis}
          </Paragraph>
        </Card>
      )}
    </EkohPageShell>
  );
}
