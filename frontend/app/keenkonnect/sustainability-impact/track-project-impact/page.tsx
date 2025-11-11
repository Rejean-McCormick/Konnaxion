'use client'

// app/keenkonnect/sustainability-impact/track-project-impact/index.tsx
import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import { Card, Statistic, Row, Col, Select, DatePicker, Timeline } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import {
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

// ---- Types ----
type DateRange = [Dayjs, Dayjs] | null;

interface ImpactReport {
  key: string;
  date: string;     // ISO string (YYYY-MM-DD) for simplicity
  summary: string;
}

// ---- Demo data ----
const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'] as const;

const sampleImpactMetrics = {
  carbonReduction: 1200, // in kg CO2 reduced
  peopleReached: 450,
  fundsSaved: 3000, // in dollars
};

const sampleImpactTrend = [
  { period: 'Jan', value: 500 },
  { period: 'Feb', value: 600 },
  { period: 'Mar', value: 700 },
  { period: 'Apr', value: 800 },
  { period: 'May', value: 900 },
  { period: 'Jun', value: 1000 },
  { period: 'Jul', value: 1200 },
];

const sampleImpactBreakdown = [
  { category: 'Environmental', value: 1200 },
  { category: 'Social', value: 450 },
  { category: 'Economic', value: 3000 },
];

const impactReports: ImpactReport[] = [
  { key: '1', date: '2023-01-15', summary: 'Initial report - baseline established.' },
  { key: '2', date: '2023-04-20', summary: 'Significant improvement in carbon reduction.' },
  { key: '3', date: '2023-07-10', summary: 'Major milestone achieved in funds saved.' },
];

export default function TrackProjectImpact() {
  // Project & period filters
  // Safe fallback avoids TS2345 under noUncheckedIndexedAccess
  const [selectedProject, setSelectedProject] = useState<string>(projects[0] ?? 'Project Alpha');
  const [dateRange, setDateRange] = useState<DateRange>(null);

  // Filter timeline by dateRange
  const filteredImpactReports = useMemo(() => {
    if (!dateRange) return impactReports;
    const [start, end] = dateRange;
    return impactReports.filter((report) => {
      const reportDate = dayjs(report.date);
      return reportDate.isAfter(start) && reportDate.isBefore(end);
    });
  }, [dateRange]);

  // Example: background refresh hook (kept for future plug-in)
  useEffect(() => {
    // setInterval(...) if you want to refresh charts periodically
  }, []);

  return (
    <MainLayout>
      <Head>
        <title>Track Project Impact</title>
        <meta
          name="description"
          content="Dashboard for tracking the impact metrics of your project."
        />
      </Head>

      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Track Project Impact</h1>

        {/* Project selector & date filter */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12}>
            <Select
              value={selectedProject}
              style={{ width: '100%' }}
              onChange={setSelectedProject}
              options={projects.map((p) => ({ value: p, label: p }))}
            />
          </Col>
          <Col xs={24} sm={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (!dates || !dates[0] || !dates[1]) {
                  setDateRange(null);
                } else {
                  setDateRange([dates[0], dates[1]]);
                }
              }}
            />
          </Col>
        </Row>

        {/* Impact Metrics Overview */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Carbon Footprint Reduced (kg)"
                value={sampleImpactMetrics.carbonReduction}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="People Reached" value={sampleImpactMetrics.peopleReached} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Funds Saved ($)" value={sampleImpactMetrics.fundsSaved} />
            </Card>
          </Col>
        </Row>

        {/* Impact Trend (Line) */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Impact Trend Over Time</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <ReLineChart data={sampleImpactTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" />
              </ReLineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown (Bar) */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Category-wise Impact Breakdown</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={sampleImpactBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Impact Reports Timeline</h2>
          <Timeline>
            {filteredImpactReports.map((report) => (
              <Timeline.Item key={report.key}>
                <strong>{report.date}</strong>: {report.summary}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      </div>
    </MainLayout>
  );
}
