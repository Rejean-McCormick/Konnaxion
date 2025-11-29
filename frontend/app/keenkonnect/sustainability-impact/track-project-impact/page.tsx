// FILE: frontend/app/keenkonnect/sustainability-impact/track-project-impact/page.tsx
'use client';

import React, { Suspense, useState, useEffect, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  DatePicker,
  Select,
  Spin,
  Tabs,
  Timeline,
  Descriptions,
  Empty,
} from 'antd';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import api from '@/api';
import dayjs from 'dayjs';
import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

type ImpactItem = {
  category: string;
  value: number;
};

type Filters = {
  from: string;
  to: string;
  team?: string;
};

const COLORS = ['#4e91ff', '#34c759', '#ff9f0a', '#ff375f', '#af52de'];

export default function TrackProjectImpactPage(): JSX.Element {
  return (
    <KeenPageShell
      title="Track Project Impact"
      description="Monitor sustainability impact across projects over time."
    >
      <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
        <Content />
      </Suspense>
    </KeenPageShell>
  );
}

function Content(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    team: undefined,
  });

  const [impactData, setImpactData] = useState<ImpactItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          fromDate: filters.from,
          toDate: filters.to,
        });

        if (filters.team) {
          params.set('team', filters.team);
        }

        const res = await api.get<ImpactItem[]>(
          `/impact/sustainability/track?${params.toString()}`,
        );

        setImpactData(res ?? []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Track impact load error:', err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [filters]);

  const chartData = useMemo(
    () =>
      (impactData ?? []).map((item) => ({
        name: item.category,
        value: item.value,
      })),
    [impactData],
  );

  const totalImpact = useMemo(
    () => (impactData ?? []).reduce((sum, item) => sum + (item.value ?? 0), 0),
    [impactData],
  );

  const topCategory = useMemo(() => {
    if (!impactData || impactData.length === 0) return undefined;

    return impactData.reduce<ImpactItem>(
      (max, item) => (item.value > max.value ? item : max),
      impactData[0]!,
    );
  }, [impactData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    );
  }

  const hasData = chartData.length > 0;

  return (
    <>
      {/* Main filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <RangePicker
              defaultValue={[dayjs(filters.from), dayjs(filters.to)]}
              style={{ width: '100%' }}
              onChange={(range) => {
                if (!range || !range[0] || !range[1]) return;
                const [start, end] = range;
                setFilters((f) => ({
                  ...f,
                  from: start.format('YYYY-MM-DD'),
                  to: end.format('YYYY-MM-DD'),
                }));
              }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Select
              placeholder="Filter by team"
              style={{ width: '100%' }}
              allowClear
              value={filters.team}
              onChange={(value) =>
                setFilters((f) => ({
                  ...f,
                  team: value || undefined,
                }))
              }
              options={[
                { label: 'Team A', value: 'team-a' },
                { label: 'Team B', value: 'team-b' },
                { label: 'Team C', value: 'team-c' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {!hasData ? (
        <Card>
          <Empty description="No impact data for the selected filters" />
        </Card>
      ) : (
        <Tabs defaultActiveKey="overview">
          {/* OVERVIEW tab: pie chart + summary */}
          <TabPane tab="Overview" key="overview">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={14}>
                <Card title="Impact by Category">
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={10}>
                <Card title="Summary">
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Total impact value">
                      {totalImpact}
                    </Descriptions.Item>
                    <Descriptions.Item label="Number of categories">
                      {impactData.length}
                    </Descriptions.Item>
                    <Descriptions.Item label="Top category">
                      {topCategory?.category ?? '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Top category value">
                      {topCategory?.value ?? '—'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* TIMELINE tab */}
          <TabPane tab="Timeline" key="timeline">
            <Card title="Impact Timeline">
              <Timeline>
                {impactData.map((item, index) => (
                  <Timeline.Item key={`${item.category}-${index}`}>
                    <div style={{ fontWeight: 500 }}>{item.category}</div>
                    <div style={{ color: '#666' }}>
                      Impact value: {item.value}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </TabPane>

          {/* BREAKDOWN tab: bar chart + details */}
          <TabPane tab="Category Breakdown" key="breakdown">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Card title="Impact by Category (Bar Chart)">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <ReTooltip />
                      <Bar dataKey="value">
                        {chartData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card title="Category Details">
                  <Descriptions column={1} size="small" bordered>
                    {impactData.map((item, index) => (
                      <Descriptions.Item
                        key={`${item.category}-${index}`}
                        label={item.category}
                      >
                        {item.value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      )}
    </>
  );
}
