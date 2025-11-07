'use client'

// pages/keenkonnect/sustainability-impact/track-project-impact/index.tsx
import React, { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
// (Optionnel) type NextPage non requis ici
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
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

// Exemple de projets disponibles
const projects = ['Project Alpha', 'Project Beta', 'Project Gamma'];

// Impact metrics simulés pour un projet
const sampleImpactMetrics = {
  carbonReduction: 1200, // in kg CO2 reduced
  peopleReached: 450,
  fundsSaved: 3000, // in dollars
}; // <-- fermeture manquante ajoutée

// Données simulées pour l'évolution de l'impact dans le temps (line chart)
const sampleImpactTrend = [
  { period: 'Jan', value: 500 },
  { period: 'Feb', value: 600 },
  { period: 'Mar', value: 700 },
  { period: 'Apr', value: 800 },
  { period: 'May', value: 900 },
  { period: 'Jun', value: 1000 },
  { period: 'Jul', value: 1200 },
];

// Données simulées pour le breakdown par catégories (bar chart)
const sampleImpactBreakdown = [
  { category: 'Environmental', value: 1200 },
  { category: 'Social', value: 450 },
  { category: 'Economic', value: 3000 },
];

// Simulé: liste d'impact reports (Timeline)
const impactReports = [
  { key: '1', date: '2023-01-15', summary: 'Initial report - baseline established.' },
  { key: '2', date: '2023-04-20', summary: 'Significant improvement in carbon reduction.' },
  { key: '3', date: '2023-07-10', summary: 'Major milestone achieved in funds saved.' },
];

export default function TrackProjectImpact() {
  // États pour le filtre par projet et période
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);

  // Filtre supplémentaire sur dateRange pour la Timeline (exemple simulé)
  const filteredImpactReports = useMemo(() => {
    if (!dateRange) return impactReports;
    return impactReports.filter((report) => {
      const reportDate = dayjs(report.date);
      return reportDate.isAfter(dateRange[0]) && reportDate.isBefore(dateRange[1]);
    });
  }, [dateRange]);

  // Mise à jour automatique de la tendance (optionnel)
  useEffect(() => {
    // Ici vous pourriez intégrer un setInterval pour actualiser sampleImpactTrend en temps réel
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

        {/* Sélecteur de projet et filtre de période */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12}>
            <Select
              defaultValue={selectedProject}
              style={{ width: '100%' }}
              onChange={setSelectedProject}
            >
              {projects.map((proj) => (
                <Option key={proj} value={proj}>
                  {proj}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => setDateRange(dates as any)}
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

        {/* Impact Trend Chart (Line Chart) */}
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

        {/* Impact Breakdown (Bar Chart) */}
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

        {/* Timeline of Impact Reports */}
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
