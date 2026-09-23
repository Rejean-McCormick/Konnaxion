// FILE: frontend/app/keenkonnect/ai-team-matching/my-matches/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { ProCard, type ProColumns, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Drawer, Progress, Space, Tag, Typography } from 'antd';
import React from 'react';

import KeenPage from '@/app/keenkonnect/KeenPageShell';

const { Text, Title, Paragraph } = Typography;

type MatchType = 'team' | 'partner';

interface MatchRow {
  id: string;
  type: MatchType;
  name: string;
  matchScore: number;
  commonInterests: string;
  roleOrNeed: string;
  location?: string;
  availability?: string;
  membersCount?: number;
  new?: boolean;
}

/**
 * Declared preview dataset — teams
 * No AI matching service contract is exposed in this build.
 */
const teamMatches: MatchRow[] = [
  {
    id: 'team1',
    type: 'team',
    name: 'Alpha Team',
    matchScore: 92,
    commonInterests: 'UI/UX, Backend, DevOps',
    roleOrNeed: 'Recherche un·e full-stack pour stabiliser le MVP.',
    location: 'Remote / Europe-friendly',
    availability: '3–5 h / semaine',
    membersCount: 4,
    new: true,
  },
  {
    id: 'team2',
    type: 'team',
    name: 'Beta Squad',
    matchScore: 85,
    commonInterests: 'Mobile, Frontend, Design System',
    roleOrNeed: 'Besoin d’un·e designer produit + front React Native.',
    location: 'Montréal / Hybrid',
    availability: 'Soirs & week-ends',
    membersCount: 3,
  },
  {
    id: 'team3',
    type: 'team',
    name: 'Gamma Builders',
    matchScore: 78,
    commonInterests: 'Data, ML Ops, Product Analytics',
    roleOrNeed: 'Profil orienté data storytelling & dashboards.',
    location: 'Remote',
    availability: 'Flexible',
    membersCount: 5,
  },
];

/**
 * Declared preview dataset — individual partners
 */
const partnerMatches: MatchRow[] = [
  {
    id: 'partner1',
    type: 'partner',
    name: 'Jane Doe',
    matchScore: 88,
    commonInterests: 'Product Management, Design Thinking, Strategy',
    roleOrNeed: 'Veut co-lead un produit AI early-stage.',
    location: 'Montréal / Hybrid',
    availability: 'Soirs de semaine',
    new: true,
  },
  {
    id: 'partner2',
    type: 'partner',
    name: 'John Smith',
    matchScore: 80,
    commonInterests: 'Data Science, Machine Learning, Experimentation',
    roleOrNeed: 'Cherche une équipe pour un projet ML appliqué.',
    location: 'Remote / North America',
    availability: '2–3 soirs / semaine',
  },
  {
    id: 'partner3',
    type: 'partner',
    name: 'Amina K.',
    matchScore: 73,
    commonInterests: 'Community building, Facilitation, UX research',
    roleOrNeed: 'Souhaite rejoindre un projet orienté impact social.',
    location: 'Paris',
    availability: 'Week-ends',
  },
];

export default function MyMatchesPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [selectedMatch, setSelectedMatch] = React.useState<MatchRow | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const allMatches: MatchRow[] = [...teamMatches, ...partnerMatches];

  const total = allMatches.length;
  const newCount = allMatches.filter((m) => m.new).length;
  const avgScore = total
    ? Math.round(allMatches.reduce((acc, m) => acc + m.matchScore, 0) / total)
    : 0;
  const strongMatches = allMatches.filter((m) => m.matchScore >= 80).length;

  const columns: ProColumns<MatchRow>[] = [
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.type"),
      dataIndex: 'type',
      width: 140,
      filters: [
        { text: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.teams"), value: 'team' },
        { text: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.partners"), value: 'partner' },
      ],
      onFilter: (value, row) => row.type === String(value),
      render: (_, row) => (
        <Tag color={row.type === 'team' ? 'blue' : 'purple'}>
          {row.type === 'team' ? i18nT("ui.keenkonnect.aiTeamMatching.myMatches.teamMatch") : i18nT("ui.keenkonnect.aiTeamMatching.myMatches.partnerMatch")}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.nom"),
      dataIndex: 'name',
      width: 240,
      render: (_, row) => (
        <Space>
          {row.new && <Badge dot />}
          <Text strong>{row.name}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.match"),
      dataIndex: 'matchScore',
      width: 220,
      sorter: (a, b) => a.matchScore - b.matchScore,
      render: (_, row) => (
        <Space direction="vertical" size={4} style={{ width: '100%' }}>
          <Progress
            percent={row.matchScore}
            size="small"
            status={
              row.matchScore >= 85
                ? 'success'
                : row.matchScore >= 70
                ? 'active'
                : 'normal'
            }
          />
          <Text type="secondary">{row.matchScore}{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.deCompatibiliteGlobale")}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.pointsCommuns"),
      dataIndex: 'commonInterests',
      ellipsis: true,
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.roleBesoin"),
      dataIndex: 'roleOrNeed',
      ellipsis: true,
      width: 260,
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.localisation"),
      dataIndex: 'location',
      width: 180,
      render: (_, row) =>
        row.location ? <Text>{row.location}</Text> : <Text type="secondary">—</Text>,
    },
    {
      title: i18nT("ui.keenkonnect.aiTeamMatching.myMatches.actions"),
      valueType: 'option',
      width: 200,
      render: (_, row) => [
        <Button
          key="view"
          type="link"
          onClick={() => {
            setSelectedMatch(row);
            setDrawerOpen(true);
          }}
        >
          {i18nT("ui.keenkonnect.aiTeamMatching.myMatches.voirLeDetail")}
        </Button>,
        <Button key="connect" type="link">
          {i18nT("ui.keenkonnect.aiTeamMatching.myMatches.proposerUneConnexion")}
        </Button>,
      ],
    },
  ];

  return (
    <KeenPage
      title={i18nT("ui.keenkonnect.aiTeamMatching.myMatches.mesCorrespondances")}
      description={i18nT("ui.keenkonnect.aiTeamMatching.myMatches.resumeDeTesMatchesGeneresParL")}
      metaTitle={i18nT("ui.keenkonnect.aiTeamMatching.myMatches.keenkonnectMesCorrespondances")}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Bandeau de KPIs / résumé */}
        <ProCard ghost gutter={[16, 16]} wrap>
          <ProCard colSpan={{ xs: 24, sm: 12, md: 6 }} bordered>
            <Text type="secondary">{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.totalDeMatches")}</Text>
            <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
              {total}
            </Title>
          </ProCard>

          <ProCard colSpan={{ xs: 24, sm: 12, md: 6 }} bordered>
            <Text type="secondary">{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.nouveauxMatches")}</Text>
            <Space align="baseline">
              <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
                {newCount}
              </Title>
              {newCount > 0 && (
                <Badge
                  count="Nouveau"
                  style={{ backgroundColor: '#52c41a', marginLeft: 8 }}
                />
              )}
            </Space>
          </ProCard>

          <ProCard colSpan={{ xs: 24, sm: 12, md: 6 }} bordered>
            <Text type="secondary">{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.compatibiliteMoyenne")}</Text>
            <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
              {avgScore}%
            </Title>
            <Progress
              percent={avgScore}
              size="small"
              style={{ marginTop: 8 }}
              status={
                avgScore >= 85 ? 'success' : avgScore >= 70 ? 'active' : 'normal'
              }
            />
          </ProCard>

          <ProCard colSpan={{ xs: 24, sm: 12, md: 6 }} bordered>
            <Text type="secondary">{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.matchesForts80")}</Text>
            <Title level={3} style={{ marginTop: 8, marginBottom: 0 }}>
              {strongMatches}
            </Title>
          </ProCard>
        </ProCard>

        {/* Tableau principal */}
        <ProTable<MatchRow>
          rowKey="id"
          columns={columns}
          dataSource={allMatches}
          search={false}
          pagination={{ pageSize: 6 }}
          options={false}
          onRow={(record) => ({
            onClick: () => {
              setSelectedMatch(record);
              setDrawerOpen(true);
            },
          })}
        />

        {/* Drawer de détail d’un match */}
        <Drawer
          title={selectedMatch ? selectedMatch.name : i18nT("ui.keenkonnect.aiTeamMatching.myMatches.detailDuMatch")}
          open={drawerOpen}
          width={520}
          onClose={() => {
            setDrawerOpen(false);
            setSelectedMatch(null);
          }}
        >
          {selectedMatch && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space>
                <Tag color={selectedMatch.type === 'team' ? 'blue' : 'purple'}>
                  {selectedMatch.type === 'team' ? i18nT("ui.keenkonnect.aiTeamMatching.myMatches.teamMatch") : i18nT("ui.keenkonnect.aiTeamMatching.myMatches.partnerMatch")}
                </Tag>
                {selectedMatch.new && (
                  <Badge count="Nouveau" style={{ backgroundColor: '#52c41a' }} />
                )}
              </Space>

              <Space align="center">
                <Progress
                  type="dashboard"
                  percent={selectedMatch.matchScore}
                  status={
                    selectedMatch.matchScore >= 85
                      ? 'success'
                      : selectedMatch.matchScore >= 70
                      ? 'active'
                      : 'normal'
                  }
                  style={{ marginRight: 16 }}
                />
                <div>
                  <Text strong>
                    {selectedMatch.matchScore}{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.deCompatibiliteGlobale")}
                  </Text>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {i18nT("ui.keenkonnect.aiTeamMatching.myMatches.calculeAPartirDesInteretsCompetencesDisponibilite")}
                  </Paragraph>
                </div>
              </Space>

              <div>
                <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.ceQueVousAvezEnCommun")}</Title>
                <Paragraph>{selectedMatch.commonInterests}</Paragraph>
              </div>

              <div>
                <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.roleAttentes")}</Title>
                <Paragraph>{selectedMatch.roleOrNeed}</Paragraph>
              </div>

              {selectedMatch.location && (
                <Paragraph>
                  <Text strong>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.localisation_97af08")}</Text> {selectedMatch.location}
                </Paragraph>
              )}

              {selectedMatch.availability && (
                <Paragraph>
                  <Text strong>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.disponibilite")}</Text> {selectedMatch.availability}
                </Paragraph>
              )}

              {selectedMatch.membersCount != null && (
                <Paragraph>
                  <Text strong>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.tailleDeLEquipe")}</Text>{' '}
                  {selectedMatch.membersCount} {i18nT("ui.keenkonnect.aiTeamMatching.myMatches.membres")}
                </Paragraph>
              )}

              <Space>
                <Button type="primary">{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.proposerUneConnexion")}</Button>
                <Button>{i18nT("ui.keenkonnect.aiTeamMatching.myMatches.voirLeProfilComplet")}</Button>
              </Space>
            </Space>
          )}
        </Drawer>
      </Space>
    </KeenPage>
  );
}
