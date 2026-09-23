// FILE: frontend/app/keenkonnect/ai-team-matching/find-teams/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslateFunction } from '@/i18n/runtime';
import {
  FilterOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Input,
  List,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import KeenPage from '@/app/keenkonnect/KeenPageShell';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

type TeamSizeFilter = 'all' | 'small' | 'medium' | 'large';

interface TeamMatch {
  id: string;
  name: string;
  description: string;
  domain: string;
  members: string[];
  teamSize: number;
  matchReason: string;
  isOpen: boolean;
}

const sampleTeamMatches: TeamMatch[] = [
  {
    id: '1',
    name: 'AI Innovators',
    description: 'A team focused on cutting-edge AI projects and research.',
    domain: 'AI & Robotics',
    members: ['Alice', 'Bob', 'Charlie'],
    teamSize: 3,
    matchReason: 'Your background in robotics aligns with the team’s focus.',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Sustainable Cities Lab',
    description:
      'Collaborating on innovative solutions for sustainable urban development.',
    domain: 'Sustainable Cities',
    members: ['Dana', 'Eve'],
    teamSize: 2,
    matchReason:
      'Your interest in urban planning and green infrastructure is highly relevant.',
    isOpen: true,
  },
  {
    id: '3',
    name: 'HealthTech Pioneers',
    description:
      'Exploring new technologies in health and wellness management.',
    domain: 'Health & Wellness',
    members: ['Frank', 'Grace', 'Heidi', 'Ivan'],
    teamSize: 4,
    matchReason:
      'Your experience at the intersection of healthcare and digital platforms is a strong match.',
    isOpen: false,
  },
];

const getTeamSizeTag = (i18nT: TranslateFunction, size: number) => {
  if (size <= 3) return { label: i18nT('ui.keenkonnect.aiTeamMatching.findTeams.smallTeam'), color: 'green' as const };
  if (size <= 6) return { label: i18nT('ui.keenkonnect.aiTeamMatching.findTeams.mediumTeam'), color: 'blue' as const };
  return { label: i18nT('ui.keenkonnect.aiTeamMatching.findTeams.largeTeam'), color: 'purple' as const };
};

const domainOptions = Array.from(new Set(sampleTeamMatches.map((t) => t.domain)));

const FindTeamsPage: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [teamSizeFilter, setTeamSizeFilter] = useState<TeamSizeFilter>('all');
  const [openOnly, setOpenOnly] = useState<boolean>(false);

  const [selectedTeam, setSelectedTeam] = useState<TeamMatch | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleOpenDrawer = (team: TeamMatch) => {
    setSelectedTeam(team);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedTeam(null);
  };

  const resetFilters = () => {
    setSearchText('');
    setDomainFilter('all');
    setTeamSizeFilter('all');
    setOpenOnly(false);
  };

  const filteredTeams = useMemo(
    () =>
      sampleTeamMatches.filter((team) => {
        const matchesSearch =
          !searchText ||
          team.name.toLowerCase().includes(searchText.toLowerCase()) ||
          team.description.toLowerCase().includes(searchText.toLowerCase()) ||
          team.domain.toLowerCase().includes(searchText.toLowerCase());

        const matchesDomain =
          domainFilter === 'all' || team.domain === domainFilter;

        const matchesOpen = !openOnly || team.isOpen;

        let matchesSize = true;
        if (teamSizeFilter === 'small') {
          matchesSize = team.teamSize <= 3;
        } else if (teamSizeFilter === 'medium') {
          matchesSize = team.teamSize > 3 && team.teamSize <= 6;
        } else if (teamSizeFilter === 'large') {
          matchesSize = team.teamSize > 6;
        }

        return matchesSearch && matchesDomain && matchesOpen && matchesSize;
      }),
    [searchText, domainFilter, teamSizeFilter, openOnly],
  );

  const hasActiveFilters =
    !!searchText ||
    domainFilter !== 'all' ||
    teamSizeFilter !== 'all' ||
    openOnly;

  const handleGoToPreferences = () => {
    router.push('/keenkonnect/ai-team-matching/match-preferences');
  };

  const handleViewMatches = () => {
    router.push('/keenkonnect/ai-team-matching/my-matches');
  };

  const handleViewWorkspace = (team: TeamMatch) => {
    router.push(
      `/keenkonnect/projects/project-workspace?teamId=${encodeURIComponent(
        team.id,
      )}`,
    );
  };

  return (
    <KeenPage
      title={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.findAiRecommendedTeams")}
      description={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.discoverTeamsRecommendedBasedOnYourProfile")}
      metaTitle={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.keenkonnectAiTeamMatchingFindTeams")}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Intro / CTA */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={16}>
              <Space direction="vertical" size={8}>
                <Title level={3} style={{ marginBottom: 0 }}>
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.discoverTeamsThatMatchYourProfile")}
                </Title>
                <Text type="secondary">
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.keenkonnectUsesYourSkillsExperienceAndPreferences")}
                </Text>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space
                direction="vertical"
                size={8}
                style={{ width: '100%', justifyContent: 'flex-end' }}
              >
                <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button
                    onClick={handleGoToPreferences}
                    icon={<FilterOutlined />}
                  >
                    {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.adjustMatchPreferences")}
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleViewMatches}
                    icon={<TeamOutlined />}
                  >
                    {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.viewMyMatches")}
                  </Button>
                </Space>
                <Text type="secondary">
                  <InfoCircleOutlined /> {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.resultsUseADeclaredPreviewDatasetNo")}
                </Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Filters */}
        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={10}>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.searchTeamsDomainsKeywords")}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  style={{ width: '100%' }}
                  value={domainFilter}
                  onChange={(value) => setDomainFilter(value)}
                  placeholder={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.domain")}
                >
                  <Option value="all">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.allDomains")}</Option>
                  {domainOptions.map((domain) => (
                    <Option key={domain} value={domain}>
                      {domain}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={5}>
                <Select
                  style={{ width: '100%' }}
                  value={teamSizeFilter}
                  onChange={(value: TeamSizeFilter) => setTeamSizeFilter(value)}
                >
                  <Option value="all">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.allTeamSizes")}</Option>
                  <Option value="small">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.small3")}</Option>
                  <Option value="medium">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.medium46")}</Option>
                  <Option value="large">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.large7")}</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Space>
                  <Switch
                    checked={openOnly}
                    onChange={setOpenOnly}
                    size="small"
                  />
                  <Text>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.openToNewMembersOnly")}</Text>
                </Space>
              </Col>
            </Row>

            {hasActiveFilters && (
              <Row>
                <Col span={24}>
                  <Space wrap>
                    {searchText && (
                      <Tag closable onClose={() => setSearchText('')}>
                        {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.search")} {searchText}
                      </Tag>
                    )}
                    {domainFilter !== 'all' && (
                      <Tag closable onClose={() => setDomainFilter('all')}>
                        {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.domain_da000b")} {domainFilter}
                      </Tag>
                    )}
                    {teamSizeFilter !== 'all' && (
                      <Tag closable onClose={() => setTeamSizeFilter('all')}>
                        {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.teamSize")} {teamSizeFilter}
                      </Tag>
                    )}
                    {openOnly && (
                      <Tag closable onClose={() => setOpenOnly(false)}>
                        {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.openTeamsOnly")}
                      </Tag>
                    )}
                    <Button
                      type="link"
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={resetFilters}
                    >
                      {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.clearAllFilters")}
                    </Button>
                  </Space>
                </Col>
              </Row>
            )}
          </Space>
        </Card>

        {/* Teams list */}
        <Card
          title={
            <Space>
              <TeamOutlined />
              <span>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.recommendedTeams")}</span>
              <Badge
                count={filteredTeams.length}
                style={{ backgroundColor: '#1890ff' }}
              />
            </Space>
          }
        >
          {filteredTeams.length === 0 ? (
            <Empty
              description={
                <span>
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.noTeamsMatchYourCurrentFiltersTry")}{' '}
                  <Button
                    type="link"
                    size="small"
                    onClick={handleGoToPreferences}
                  >
                    {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.updatingYourPreferences")}
                  </Button>
                  .
                </span>
              }
            />
          ) : (
            <List
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 2,
                xl: 3,
                xxl: 3,
              }}
              dataSource={filteredTeams}
              renderItem={(team) => {
                const sizeTag = getTeamSizeTag(i18nT, team.teamSize);

                return (
                  <List.Item>
                    <Card
                      hoverable
                      onClick={() => handleOpenDrawer(team)}
                      actions={[
                        <Tooltip
                          key="join"
                          title={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.joinRequestsAreUnavailableUntilAnAi")}
                        >
                          <Button
                            type="link"
                            icon={<UserAddOutlined />}
                            disabled
                          >
                            {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.joinUnavailable")}
                          </Button>
                        </Tooltip>,
                        <Tooltip key="save" title={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.savingAiMatchRecommendationsIsUnavailableIn")}>
                          <Button
                            type="link"
                            icon={<HeartOutlined />}
                            disabled
                          >
                            {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.saveUnavailable")}
                          </Button>
                        </Tooltip>,
                      ]}
                    >
                      <Space
                        direction="vertical"
                        size={8}
                        style={{ width: '100%' }}
                      >
                        <Space align="center" style={{ width: '100%' }}>
                          <Title
                            level={5}
                            style={{ marginBottom: 0, flex: 1 }}
                          >
                            {team.name}
                          </Title>
                          <Badge
                            status={team.isOpen ? 'success' : 'default'}
                            text={team.isOpen ? i18nT("ui.keenkonnect.aiTeamMatching.findTeams.open") : i18nT("ui.keenkonnect.aiTeamMatching.findTeams.currentlyFull")}
                          />
                        </Space>

                        <Text type="secondary">{team.description}</Text>

                        <Space wrap size={[4, 4]}>
                          <Tag color="geekblue">{team.domain}</Tag>
                          <Tag color={sizeTag.color}>
                            {sizeTag.label} ({team.teamSize})
                          </Tag>
                          <Tag>{team.members.join(', ')}</Tag>
                        </Space>

                        <Space direction="vertical" size={4}>
                          <Text strong>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.whyThisIsAGoodMatch")}</Text>
                          <Paragraph
                            type="secondary"
                            ellipsis={{ rows: 2 }}
                            style={{ marginBottom: 0 }}
                          >
                            {team.matchReason}
                          </Paragraph>
                        </Space>

                        <Button
                          type="default"
                          block
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDrawer(team);
                          }}
                        >
                          {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.viewDetails")}
                        </Button>
                      </Space>
                    </Card>
                  </List.Item>
                );
              }}
            />
          )}
        </Card>
      </Space>

      {/* Details drawer */}
      <Drawer
        title={
          selectedTeam ? (
            <Space direction="vertical" size={0}>
              <Space align="center">
                <TeamOutlined />
                <span>{selectedTeam.name}</span>
                {selectedTeam.isOpen && (
                  <Tag color="green">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.openToNewMembers")}</Tag>
                )}
              </Space>
              <Text type="secondary">{selectedTeam.domain}</Text>
            </Space>
          ) : (
            i18nT("ui.keenkonnect.aiTeamMatching.findTeams.teamDetails")
          )
        }
        width={520}
        open={drawerVisible}
        onClose={handleCloseDrawer}
        destroyOnHidden
      >
        {selectedTeam && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <section>
              <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.overview")}</Title>
              <Paragraph>{selectedTeam.description}</Paragraph>
              <Text type="secondary">
                <InfoCircleOutlined /> {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.thisTeamRecommendationIsBasedOnYour")}
              </Text>
            </section>

            <section>
              <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.whyYouReAMatch")}</Title>
              <Paragraph>{selectedTeam.matchReason}</Paragraph>
            </section>

            <section>
              <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.teamComposition")}</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space size="small" wrap>
                  <Tag icon={<TeamOutlined />}>
                    {selectedTeam.teamSize} {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.member")}
                    {selectedTeam.teamSize > 1 ? 's' : ''}
                  </Tag>
                  {selectedTeam.isOpen ? (
                    <Tag color="green">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.activelyRecruiting")}</Tag>
                  ) : (
                    <Tag color="default">{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.currentlyFull")}</Tag>
                  )}
                </Space>
                <List
                  size="small"
                  bordered
                  dataSource={selectedTeam.members}
                  renderItem={(member, index) => (
                    <List.Item>
                      <Text>
                        {index + 1}. {member}
                      </Text>
                    </List.Item>
                  )}
                />
              </Space>
            </section>

            <section>
              <Title level={5}>{i18nT("ui.keenkonnect.aiTeamMatching.findTeams.nextSteps")}</Title>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  block
                  disabled
                  title={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.joinRequestsAreUnavailableUntilAnAi")}
                >
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.joinUnavailable")}
                </Button>
                <Button block onClick={() => handleViewWorkspace(selectedTeam)}>
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.previewTeamWorkspace")}
                </Button>
                <Button
                  type="dashed"
                  icon={<HeartOutlined />}
                  block
                  disabled
                  title={i18nT("ui.keenkonnect.aiTeamMatching.findTeams.savingAiMatchRecommendationsIsUnavailableIn")}
                >
                  {i18nT("ui.keenkonnect.aiTeamMatching.findTeams.saveUnavailable")}
                </Button>
              </Space>
            </section>
          </Space>
        )}
      </Drawer>
    </KeenPage>
  );
};

export default FindTeamsPage;
