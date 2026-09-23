// frontend/app/teambuilder/humans/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  AimOutlined,
  EnvironmentOutlined,
  FlagOutlined,
  GlobalOutlined,
  ScheduleOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Paragraph, Text } = Typography;

export default function HumansOverviewPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  // For now, static placeholder metrics. Wire to real data later.
  const totalPeople = 128;
  const withLanguage = 104;
  const withSchedule = 92;
  const withGeo = 88;

  const languageCoverage = Math.round((withLanguage / totalPeople) * 100);
  const scheduleCoverage = Math.round((withSchedule / totalPeople) * 100);
  const geoCoverage = Math.round((withGeo / totalPeople) * 100);

  const missingCritical = totalPeople - Math.min(withLanguage, withSchedule, withGeo);

  const recentChanges = [
    {
      id: 1,
      title: i18nT("ui.teambuilder.humans.updatedLanguagesFor12People"),
      description: i18nT("ui.teambuilder.humans.addedFrEnBilingualProfileForParis"),
      type: 'language',
      ts: '2 hours ago',
    },
    {
      id: 2,
      title: i18nT("ui.teambuilder.humans.newInterpersonalConflictPair"),
      description: i18nT("ui.teambuilder.humans.flaggedConflictBetweenASmithAndJ"),
      type: 'conflict',
      ts: 'Yesterday',
    },
    {
      id: 3,
      title: i18nT("ui.teambuilder.humans.refinedWorkingHours"),
      description: i18nT("ui.teambuilder.humans.adjustedSchedulesForApacTeamToAvoid"),
      type: 'schedule',
      ts: '2 days ago',
    },
    {
      id: 4,
      title: i18nT("ui.teambuilder.humans.geoBoundariesForEuOnlyProjects"),
      description: i18nT("ui.teambuilder.humans.marked34PeopleAsEuOnlyFor"),
      type: 'geo',
      ts: '3 days ago',
    },
  ];

  const renderStatusTag = () => {
    if (missingCritical === 0) {
      return (
        <Tag color="success" icon={<TeamOutlined />}>
          {i18nT("ui.teambuilder.humans.allProfilesReady")}
        </Tag>
      );
    }

    if (missingCritical < totalPeople * 0.1) {
      return (
        <Tag color="processing" icon={<TeamOutlined />}>
          {i18nT("ui.teambuilder.humans.mostlyReady")}
        </Tag>
      );
    }

    return (
      <Tag color="warning" icon={<WarningOutlined />}>
        {i18nT("ui.teambuilder.humans.needsAttention")}
      </Tag>
    );
  };

  const secondaryActions = (
    <Space>
      <Button type="default" href="/teambuilder">
        {i18nT("ui.teambuilder.humans.backToSessions")}
      </Button>
    </Space>
  );

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.humans.humansConstraintsOverview")}
      subtitle={
        <Paragraph type="secondary">
          {i18nT("ui.teambuilder.humans.configureHowPeopleCanBeGroupedInto")}
        </Paragraph>
      }
      metaTitle={i18nT("ui.teambuilder.humans.teamBuilderHumans")}
      sectionLabel={i18nT("ui.teambuilder.humans.humans")}
      secondaryActions={secondaryActions}
      maxWidth={1200}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Top metrics summary */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Text strong>{i18nT("ui.teambuilder.humans.populationReadiness")}</Text>
                  <Badge status={missingCritical === 0 ? 'success' : 'warning'} />
                </Space>
                <Statistic
                  title={i18nT("ui.teambuilder.humans.peopleInScope")}
                  value={totalPeople}
                  prefix={<TeamOutlined />}
                />
                <Space size="small" direction="vertical">
                  <Text type="secondary">
                    {withLanguage} {i18nT("ui.teambuilder.humans.withLanguageProfile")} {withSchedule} {i18nT("ui.teambuilder.humans.withSchedule")}{' '}
                    {withGeo} {i18nT("ui.teambuilder.humans.withGeoLimits")}
                  </Text>
                  {renderStatusTag()}
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center">
                  <GlobalOutlined />
                  <Text strong>{i18nT("ui.teambuilder.humans.languageGeography")}</Text>
                </Space>
                <Statistic
                  title={i18nT("ui.teambuilder.humans.languageCoverage")}
                  value={languageCoverage}
                  suffix="%"
                />
                <Progress
                  percent={languageCoverage}
                  size="small"
                  status={languageCoverage > 80 ? 'active' : 'exception'}
                />
                <Statistic
                  title={i18nT("ui.teambuilder.humans.geoCoverage")}
                  value={geoCoverage}
                  suffix="%"
                />
                <Progress
                  percent={geoCoverage}
                  size="small"
                  status={geoCoverage > 80 ? 'active' : 'exception'}
                />
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Space align="center">
                  <ScheduleOutlined />
                  <Text strong>{i18nT("ui.teambuilder.humans.schedulesConflicts")}</Text>
                </Space>
                <Statistic
                  title={i18nT("ui.teambuilder.humans.scheduleCoverage")}
                  value={scheduleCoverage}
                  suffix="%"
                />
                <Progress
                  percent={scheduleCoverage}
                  size="small"
                  status={scheduleCoverage > 80 ? 'active' : 'exception'}
                />
                <Space size="small">
                  <Tag color="default">{i18nT("ui.teambuilder.humans.conflictPairs")}</Tag>
                  <Text type="secondary">{i18nT("ui.teambuilder.humans.configuredWhereNeeded")}</Text>
                </Space>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* How this works */}
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.teambuilder.humans.howHumanConstraintsAreApplied")}
          description={
            <Space direction="vertical" size={4}>
              <Text>
                {i18nT("ui.teambuilder.humans.theseSettingsDefine")} <strong>{i18nT("ui.teambuilder.humans.whoCanBeGroupedTogether")}</strong> {i18nT("ui.teambuilder.humans.inTheTeamBuilderTheEngineWill")}
              </Text>
              <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                <li>
                  {i18nT("ui.teambuilder.humans.respect")} <strong>{i18nT("ui.teambuilder.humans.languageCompatibility")}</strong> {i18nT("ui.teambuilder.humans.whenFormingEliteOrLearningTeams")}
                </li>
                <li>
                  {i18nT("ui.teambuilder.humans.enforce")} <strong>{i18nT("ui.teambuilder.humans.geographyJurisdictionLimits")}</strong> {i18nT("ui.teambuilder.humans.forSensitiveProjects")}
                </li>
                <li>
                  {i18nT("ui.teambuilder.humans.avoid")} <strong>{i18nT("ui.teambuilder.humans.hardConflictPairs")}</strong> {i18nT("ui.teambuilder.humans.inAllModes")}
                </li>
                <li>
                  {i18nT("ui.teambuilder.humans.match")} <strong>{i18nT("ui.teambuilder.humans.overlappingSchedules")}</strong> {i18nT("ui.teambuilder.humans.soTeamsCanActuallyMeet")}
                </li>
              </ul>
            </Space>
          }
        />

        <Divider />

        {/* Sub-module navigation */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <GlobalOutlined />
                  <span>{i18nT("ui.teambuilder.humans.languagesCommunication")}</span>
                </Space>
              }
              extra={
                <Button type="link" href="/teambuilder/humans/language">
                  {i18nT("ui.teambuilder.humans.open")}
                </Button>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.teambuilder.humans.defineWhichLanguagesEachPersonCanWork")}
                </Paragraph>
                <Space wrap>
                  <Tag>{i18nT("ui.teambuilder.humans.languageProfiles")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.preferredChannels")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.multiLingualSupport")}</Tag>
                </Space>
                <Space split={<Divider type="vertical" />} wrap>
                  <Text type="secondary">
                    <Badge status={languageCoverage > 80 ? 'success' : 'warning'} />{' '}
                    {languageCoverage}{i18nT("ui.teambuilder.humans.coverage")}
                  </Text>
                  <Text type="secondary">{withLanguage} / {totalPeople} {i18nT("ui.teambuilder.humans.peopleConfigured")}</Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <EnvironmentOutlined />
                  <span>{i18nT("ui.teambuilder.humans.geographyLegalLimits")}</span>
                </Space>
              }
              extra={
                <Button type="link" href="/teambuilder/humans/geo">
                  {i18nT("ui.teambuilder.humans.open")}
                </Button>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.teambuilder.humans.specifyWhereEachPersonCanLegallyOperate")}
                </Paragraph>
                <Space wrap>
                  <Tag>{i18nT("ui.teambuilder.humans.timeZones")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.regions")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.jurisdictions")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.dataResidency")}</Tag>
                </Space>
                <Space split={<Divider type="vertical" />} wrap>
                  <Text type="secondary">
                    <Badge status={geoCoverage > 80 ? 'success' : 'warning'} />{' '}
                    {geoCoverage}{i18nT("ui.teambuilder.humans.coverage")}
                  </Text>
                  <Text type="secondary">{withGeo} / {totalPeople} {i18nT("ui.teambuilder.humans.peopleWithGeoData")}</Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <ScheduleOutlined />
                  <span>{i18nT("ui.teambuilder.humans.schedulesAvailability")}</span>
                </Space>
              }
              extra={
                <Button type="link" href="/teambuilder/humans/schedules">
                  {i18nT("ui.teambuilder.humans.open")}
                </Button>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.teambuilder.humans.captureWorkingHoursBlackoutPeriodsAndPreferred")}
                </Paragraph>
                <Space wrap>
                  <Tag>{i18nT("ui.teambuilder.humans.workingHours")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.blackoutPeriods")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.preferredSlots")}</Tag>
                </Space>
                <Space split={<Divider type="vertical" />} wrap>
                  <Text type="secondary">
                    <Badge status={scheduleCoverage > 80 ? 'success' : 'warning'} />{' '}
                    {scheduleCoverage}{i18nT("ui.teambuilder.humans.coverage")}
                  </Text>
                  <Text type="secondary">{withSchedule} / {totalPeople} {i18nT("ui.teambuilder.humans.peopleWithSchedule")}</Text>
                </Space>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={
                <Space>
                  <WarningOutlined />
                  <span>{i18nT("ui.teambuilder.humans.interpersonalConflicts")}</span>
                </Space>
              }
              extra={
                <Button type="link" href="/teambuilder/humans/conflicts">
                  {i18nT("ui.teambuilder.humans.open")}
                </Button>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.teambuilder.humans.flagHardDoNotPairConflictsAnd")}
                </Paragraph>
                <Space wrap>
                  <Tag color="red">{i18nT("ui.teambuilder.humans.doNotPair")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.riskyCombinations")}</Tag>
                  <Tag>{i18nT("ui.teambuilder.humans.leaderSafeguards")}</Tag>
                </Space>
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginTop: 4 }}
                  message={i18nT("ui.teambuilder.humans.conflictsAreTreatedAsHardConstraints")}
                  description={i18nT("ui.teambuilder.humans.whenSetThesePairsWillNotAppear")}
                />
              </Space>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Recent activity / audit trail */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Card
              title={
                <Space>
                  <FlagOutlined />
                  <span>{i18nT("ui.teambuilder.humans.recentConfigurationChanges")}</span>
                </Space>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={recentChanges}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Badge
                          status={
                            item.type === 'conflict'
                              ? 'error'
                              : item.type === 'schedule'
                              ? 'processing'
                              : 'success'
                          }
                        />
                      }
                      title={
                        <Space>
                          <Text strong>{item.title}</Text>
                          <Tag
                            color={
                              item.type === 'language'
                                ? 'blue'
                                : item.type === 'geo'
                                ? 'purple'
                                : item.type === 'schedule'
                                ? 'gold'
                                : 'red'
                            }
                          >
                            {item.type}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={0}>
                          <Text>{item.description}</Text>
                          <Text type="secondary">{item.ts}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              title={
                <Space>
                  <AimOutlined />
                  <span>{i18nT("ui.teambuilder.humans.nextRecommendedActions")}</span>
                </Space>
              }
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Button type="primary" block href="/teambuilder/humans/language">
                  {i18nT("ui.teambuilder.humans.completeLanguageProfilesForMissingPeople")}
                </Button>
                <Button block href="/teambuilder/humans/schedules">
                  {i18nT("ui.teambuilder.humans.reviewSchedulesForNightHeavyPatterns")}
                </Button>
                <Button block href="/teambuilder/humans/conflicts">
                  {i18nT("ui.teambuilder.humans.auditConflictListForOutdatedEntries")}
                </Button>
                <Divider />
                <Text type="secondary">
                  {i18nT("ui.teambuilder.humans.onceCoverageIsAbove90OnAll")}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </TeamBuilderPageShell>
  );
}
