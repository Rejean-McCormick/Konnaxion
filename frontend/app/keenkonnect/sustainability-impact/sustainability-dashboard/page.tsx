'use client';

// File: app/keenkonnect/sustainability-impact/sustainability-dashboard/page.tsx
import React, { useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, Row, Col, Statistic, Table, Select, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import MainLayout from '@/components/layout-components/MainLayout';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';

const { Option } = Select;

/* -------------------------------
 * Données simulées
 * ------------------------------- */

// Statistiques globales
const globalStats = {
  totalCO2Saved: 50000,       // en kilogrammes
  totalVolunteerHours: 1200,  // en heures
  totalProjects: 45,
};

// Répartition d’impact (donut)
const impactDistribution = [
  { name: 'Environmental', value: 55 },
  { name: 'Social', value: 30 },
  { name: 'Economic', value: 15 },
];

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Données pour le leaderboard (liste de projets par impact)
interface LeaderboardEntry {
  key: string;
  projectName: string;
  impactScore: number;
  co2Saved: number;
  volunteerHours: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { key: '1', projectName: 'Project Alpha', impactScore: 95, co2Saved: 15000, volunteerHours: 300 },
  { key: '2', projectName: 'Project Beta', impactScore: 88, co2Saved: 12000, volunteerHours: 250 },
  { key: '3', projectName: 'Project Gamma', impactScore: 82, co2Saved: 10000, volunteerHours: 200 },
  { key: '4', projectName: 'Project Delta', impactScore: 78, co2Saved: 8000, volunteerHours: 180 },
  { key: '5', projectName: 'Project Epsilon', impactScore: 75, co2Saved: 7000, volunteerHours: 170 },
];

// Colonnes pour le leaderboard
const columns: ColumnsType<LeaderboardEntry> = [
  { title: 'Project Name', dataIndex: 'projectName', key: 'projectName' },
  { title: 'Impact Score', dataIndex: 'impactScore', key: 'impactScore' },
  { title: 'CO2 Saved (kg)', dataIndex: 'co2Saved', key: 'co2Saved' },
  { title: 'Volunteer Hours', dataIndex: 'volunteerHours', key: 'volunteerHours' },
];

// Filtres supplémentaires (simulés)
const regions = ['All', 'North America', 'Europe', 'Asia'];
const categories = ['All', 'Environmental', 'Social', 'Economic'];

const SustainabilityDashboard: NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
} = () => {
  // États de filtres (ici décoratifs)
  const [selectedRegion, setSelectedRegion] = React.useState('All');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Filtrage simulé
  const filteredLeaderboard = useMemo(() => {
    // Ajouter une vraie logique si nécessaire (region / category)
    return leaderboardData;
  }, [selectedRegion, selectedCategory]);

  return (
    <>
      <Head>
        <title>Sustainability Dashboard</title>
        <meta
          name="description"
          content="High-level dashboard aggregating sustainability impact across projects."
        />
      </Head>

      <div className="container mx-auto p-5">
        {/* En-tête */}
        <h1 className="text-2xl font-bold mb-4">Sustainability Dashboard</h1>

        {/* Filtres */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12}>
            <Select
              value={selectedRegion}
              onChange={(value) => setSelectedRegion(value)}
              style={{ width: '100%' }}
            >
              {regions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <Select
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
              style={{ width: '100%' }}
            >
              {categories.map((cat) => (
                <Option key={cat} value={cat}>
                  {cat}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Divider />

        {/* Statistiques globales */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total CO2 Saved (kg)" value={globalStats.totalCO2Saved} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Volunteer Hours" value={globalStats.totalVolunteerHours} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Total Projects" value={globalStats.totalProjects} />
            </Card>
          </Col>
        </Row>

        {/* Donut: Impact Distribution */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Impact Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <RePieChart>
                <ReTooltip />
                <Legend verticalAlign="bottom" height={36} />
                <Pie
                  data={impactDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {impactDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Top Projects by Impact</h2>
          <Table
            columns={columns}
            dataSource={filteredLeaderboard}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
    </>
  );
};

// Mise en page (si utilisée dans ton app)
SustainabilityDashboard.getLayout = (page: React.ReactElement) => (
  <MainLayout>{page}</MainLayout>
);

export default SustainabilityDashboard;
