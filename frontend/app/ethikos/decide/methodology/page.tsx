// FILE: frontend/app/ethikos/decide/methodology/page.tsx
// app/ethikos/decide/methodology/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  InfoCircleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Alert,
  Collapse,
  Descriptions,
  Divider,
  Space,
  Steps,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';

const { Title, Paragraph, Text } = Typography;

export default function Methodology(): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.decide.methodology.votingMethodology")}
      sectionLabel={i18nT("ui.ethikos.decide.methodology.decide")}
      subtitle={i18nT("ui.ethikos.decide.methodology.howEthikosTurnsNuancedStancesEkohReputation")}
    >
      <PageContainer ghost>
        {/* ------------------------------------------------------------------ */}
        {/* Heading                                                            */}
        {/* ------------------------------------------------------------------ */}
        <Title level={3}>{i18nT("ui.ethikos.decide.methodology.howSmartVotingWorks")}</Title>
        <Paragraph type="secondary">
          {i18nT("ui.ethikos.decide.methodology.thisPageExplainsHowEthikosDecisionsAre")}
        </Paragraph>

        {/* ------------------------------------------------------------------ */}
        {/* Key constants / parameters                                        */}
        {/* ------------------------------------------------------------------ */}
        <ProCard
          gutter={16}
          wrap
          style={{ marginTop: 24, marginBottom: 24 }}
        >
          <StatisticCard
            colSpan={{ xs: 24, sm: 8 }}
            statistic={{
              title: i18nT("ui.ethikos.decide.methodology.stanceScale"),
              value: '–3 … +3',
              description: i18nT("ui.ethikos.decide.methodology.stronglyAgainstStronglyFor0Neutral"),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 8 }}
            statistic={{
              title: i18nT("ui.ethikos.decide.methodology.expertQuorum"),
              value: 12,
              suffix: 'experts',
              description:
                i18nT("ui.ethikos.decide.methodology.minimumExpertVotesRequiredForExpertOnly"),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 8 }}
            statistic={{
              title: i18nT("ui.ethikos.decide.methodology.autoHideThreshold"),
              value: 3,
              suffix: 'reports',
              description:
                'Arguments temporarily hidden after 3 independent reports',
            }}
          />
        </ProCard>

        {/* ------------------------------------------------------------------ */}
        {/* Tabs: conceptual overview                                          */}
        {/* ------------------------------------------------------------------ */}
        <Tabs
          style={{ marginBottom: 32 }}
          items={[
            {
              key: 'overview',
              label: i18nT("ui.ethikos.decide.methodology.text1PipelineOverview"),
              children: (
                <ProCard ghost>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.everyDecisionInEthikosFollowsTheSame")}
                  </Paragraph>
                  <Timeline
                    items={[
                      {
                        color: 'blue',
                        children: (
                          <>
                            <Text strong>{i18nT("ui.ethikos.decide.methodology.text1CollectNuancedStances")}</Text>
                            <Paragraph style={{ marginTop: 4 }}>
                              {i18nT("ui.ethikos.decide.methodology.participantsExpressAStanceOnATopic")}{' '}
                              <Text strong>–3</Text> {i18nT("ui.ethikos.decide.methodology.stronglyAgainstTo")}{' '}
                              <Text strong>+3</Text> {i18nT("ui.ethikos.decide.methodology.stronglyForWith")}{' '}
                              <Text strong>0</Text> {i18nT("ui.ethikos.decide.methodology.asNeutralOrUndecided")}
                            </Paragraph>
                          </>
                        ),
                      },
                      {
                        color: 'green',
                        children: (
                          <>
                            <Text strong>{i18nT("ui.ethikos.decide.methodology.text2ApplyEkohWeighting")}</Text>
                            <Paragraph style={{ marginTop: 4 }}>
                              {i18nT("ui.ethikos.decide.methodology.eachStanceIsMultipliedByAWeight")}
                            </Paragraph>
                          </>
                        ),
                      },
                      {
                        color: 'purple',
                        children: (
                          <>
                            <Text strong>{i18nT("ui.ethikos.decide.methodology.text3AggregateSmartVoteResult")}</Text>
                            <Paragraph style={{ marginTop: 4 }}>
                              {i18nT("ui.ethikos.decide.methodology.weightedStancesAreAggregatedByModalityApproval")}
                              <Text strong>{i18nT("ui.ethikos.decide.methodology.elite")}</Text> {i18nT("ui.ethikos.decide.methodology.vs")}{' '}
                              <Text strong>{i18nT("ui.ethikos.decide.methodology.public")}</Text>{i18nT("ui.ethikos.decide.methodology.toProduceSummaryMetricsAndAConsensus")}
                            </Paragraph>
                          </>
                        ),
                      },
                      {
                        color: 'orange',
                        children: (
                          <>
                            <Text strong>
                              {i18nT("ui.ethikos.decide.methodology.text4EnforceThresholdsPublish")}
                            </Text>
                            <Paragraph style={{ marginTop: 4 }}>
                              {i18nT("ui.ethikos.decide.methodology.resultsAreOnlyPresentedOnceMinimumParticipation")}
                            </Paragraph>
                          </>
                        ),
                      },
                    ]}
                  />
                </ProCard>
              ),
            },
            {
              key: 'weighting',
              label: i18nT("ui.ethikos.decide.methodology.text2WeightingEkoh"),
              children: (
                <ProCard ghost>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Paragraph>
                      {i18nT("ui.ethikos.decide.methodology.ethikosReliesOnTheEkohReputationEngine")}
                    </Paragraph>
                    <Descriptions
                      bordered
                      size="small"
                      column={{ xs: 1, sm: 2 }}
                      labelStyle={{ width: 180 }}
                    >
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.baseStance")}>
                        {i18nT("ui.ethikos.decide.methodology.integerIn33ChosenPerTopic")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.reputationWeight")}>
                        {i18nT("ui.ethikos.decide.methodology.aFactorDerivedFromTheUserS")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.ethicalMultiplier")}>
                        {i18nT("ui.ethikos.decide.methodology.anAdditionalMultiplierRewardingConsistentEthicalBehaviour")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.finalVoteValue")}>
                        {i18nT("ui.ethikos.decide.methodology.theProductOfStanceReputationWeightEthical")}
                      </Descriptions.Item>
                    </Descriptions>
                    <Paragraph>
                      {i18nT("ui.ethikos.decide.methodology.expertOnlyViewsFilterTheSameDataset")}
                    </Paragraph>
                  </Space>
                </ProCard>
              ),
            },
            {
              key: 'nuance',
              label: i18nT("ui.ethikos.decide.methodology.text3NuanceModalities"),
              children: (
                <ProCard ghost>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Paragraph>
                      {i18nT("ui.ethikos.decide.methodology.theStanceScaleAndVotingModalitiesAre")}
                    </Paragraph>
                    <Descriptions
                      bordered
                      size="small"
                      column={{ xs: 1, sm: 2 }}
                      labelStyle={{ width: 220 }}
                    >
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.nuancedStanceScale")}>
                        <Space wrap size="small">
                          <Tag color="red">{i18nT("ui.ethikos.decide.methodology.text3StronglyAgainst")}</Tag>
                          <Tag color="volcano">{i18nT("ui.ethikos.decide.methodology.text2Against")}</Tag>
                          <Tag color="orange">
                            {i18nT("ui.ethikos.decide.methodology.text1SomewhatAgainst")}
                          </Tag>
                          <Tag>{i18nT("ui.ethikos.decide.methodology.text0NeutralUnsure")}</Tag>
                          <Tag color="green">{i18nT("ui.ethikos.decide.methodology.text1SomewhatFor")}</Tag>
                          <Tag color="lime">{i18nT("ui.ethikos.decide.methodology.text2For")}</Tag>
                          <Tag color="cyan">{i18nT("ui.ethikos.decide.methodology.text3StronglyFor")}</Tag>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.supportedModalities")}>
                        {i18nT("ui.ethikos.decide.methodology.approvalRatingRankingAndPreferentialVotingAre")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.scopeFilters")}>
                        {i18nT("ui.ethikos.decide.methodology.resultsCanBeSegmentedByScopeElite")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.timeDimension")}>
                        {i18nT("ui.ethikos.decide.methodology.forLongRunningDebatesATimelineOf")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                </ProCard>
              ),
            },
            {
              key: 'thresholds',
              label: i18nT("ui.ethikos.decide.methodology.text4QuorumThresholds"),
              children: (
                <ProCard ghost>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Paragraph>
                      {i18nT("ui.ethikos.decide.methodology.toAvoidOverInterpretingSparseOrUnbalanced")}
                    </Paragraph>
                    <Descriptions
                      bordered
                      size="small"
                      column={{ xs: 1, sm: 2 }}
                      labelStyle={{ width: 220 }}
                    >
                      <Descriptions.Item
                        label={
                          <Space size={4}>
                            <SafetyCertificateOutlined />
                            <span>{i18nT("ui.ethikos.decide.methodology.expertQuorum")}</span>
                          </Space>
                        }
                      >
                        {i18nT("ui.ethikos.decide.methodology.expertOnlyViewsRequireAtLeast")}{' '}
                        <Text strong>{i18nT("ui.ethikos.decide.methodology.text12DistinctExperts")}</Text> {i18nT("ui.ethikos.decide.methodology.usersAboveTheExpertPercentileInThe")}
                      </Descriptions.Item>
                      <Descriptions.Item
                        label={
                          <Space size={4}>
                            <TeamOutlined />
                            <span>{i18nT("ui.ethikos.decide.methodology.participationFloor")}</span>
                          </Space>
                        }
                      >
                        {i18nT("ui.ethikos.decide.methodology.publicFacingSummariesCanEnforceMinimumParticipation")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.consensusClassification")}>
                        {i18nT("ui.ethikos.decide.methodology.thresholdsOnWeightedAgreementForInstanceA")}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.ethikos.decide.methodology.moderationLinkage")}>
                        {i18nT("ui.ethikos.decide.methodology.contentThatReachesTheAutoHideReport")}
                      </Descriptions.Item>
                    </Descriptions>
                  </Space>
                </ProCard>
              ),
            },
            {
              key: 'audit',
              label: i18nT("ui.ethikos.decide.methodology.text5AuditTransparency"),
              children: (
                <ProCard ghost>
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Paragraph>
                      {i18nT("ui.ethikos.decide.methodology.transparencyIsACoreRequirementStakeholdersMust")}
                    </Paragraph>
                    <Collapse
                      ghost
                      items={[
                        {
                          key: 'audit-trail',
                          label: i18nT("ui.ethikos.decide.methodology.auditTrail"),
                          children: (
                            <Paragraph>
                              {i18nT("ui.ethikos.decide.methodology.forEachDecisionEthikosKeepsATrace")}
                            </Paragraph>
                          ),
                        },
                        {
                          key: 'open-data',
                          label: i18nT("ui.ethikos.decide.methodology.openDataExport"),
                          children: (
                            <Paragraph>
                              {i18nT("ui.ethikos.decide.methodology.afterACoolingOffPeriodAnAnonymised")}
                            </Paragraph>
                          ),
                        },
                        {
                          key: 'simulation',
                          label: i18nT("ui.ethikos.decide.methodology.simulationRegressionTests"),
                          children: (
                            <Paragraph>
                              {i18nT("ui.ethikos.decide.methodology.theCollectiveIntelligencePipelineIsContinuouslyValidated")}
                            </Paragraph>
                          ),
                        },
                      ]}
                    />
                  </Space>
                </ProCard>
              ),
            },
          ]}
        />

        {/* ------------------------------------------------------------------ */}
        {/* Deep dive: stages as collapsible sections                          */}
        {/* ------------------------------------------------------------------ */}
        <Divider orientation="left">{i18nT("ui.ethikos.decide.methodology.deepDiveByStage")}</Divider>

        <Collapse
          style={{ marginBottom: 32 }}
          items={[
            {
              key: 'collection',
              label: i18nT("ui.ethikos.decide.methodology.stage1CollectingStances"),
              children: (
                <>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.participantsSeeAClearQuestionAnyRelevant")}
                  </Paragraph>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.usersCanReviseTheirStanceOverTime")}
                  </Paragraph>
                </>
              ),
            },
            {
              key: 'weighting',
              label: i18nT("ui.ethikos.decide.methodology.stage2ApplyingWeights"),
              children: (
                <>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.forEachStanceTheEngineFetchesThe")}
                  </Paragraph>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.inExpertOnlyViewsOnlyVotersAbove")}
                  </Paragraph>
                </>
              ),
            },
            {
              key: 'aggregation',
              label: i18nT("ui.ethikos.decide.methodology.stage3AggregationClassification"),
              children: (
                <>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.weightedStancesAreAggregatedAccordingToThe")}
                  </Paragraph>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.theseSummariesAreComputedSeparatelyForDifferent")}
                  </Paragraph>
                </>
              ),
            },
            {
              key: 'publication',
              label: i18nT("ui.ethikos.decide.methodology.stage4PublicationAuditability"),
              children: (
                <>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.onceThresholdsAreMetResultsAppearOn")}
                  </Paragraph>
                  <Paragraph>
                    {i18nT("ui.ethikos.decide.methodology.forHighImpactDecisionsAdministratorsCanAdditionally")}
                  </Paragraph>
                </>
              ),
            },
          ]}
        />

        {/* ------------------------------------------------------------------ */}
        {/* Visual stepper                                                     */}
        {/* ------------------------------------------------------------------ */}
        <Steps
          current={2}
          style={{ marginTop: 8, marginBottom: 24, maxWidth: 720 }}
          items={[
            {
              title: i18nT("ui.ethikos.decide.methodology.propose"),
              description: i18nT("ui.ethikos.decide.methodology.defineTheQuestionScopeAndVotingModality"),
            },
            {
              title: i18nT("ui.ethikos.decide.methodology.deliberate"),
              description: i18nT("ui.ethikos.decide.methodology.debateThreadsAndEvidenceGatheringInEthikos"),
            },
            {
              title: i18nT("ui.ethikos.decide.methodology.vote"),
              description: i18nT("ui.ethikos.decide.methodology.participantsSubmitOrUpdateTheirNuancedStances"),
            },
            {
              title: i18nT("ui.ethikos.decide.methodology.audit"),
              description: i18nT("ui.ethikos.decide.methodology.resultsFrozenPublishedAndMadeAuditable"),
            },
          ]}
        />

        {/* ------------------------------------------------------------------ */}
        {/* Final info blocks                                                  */}
        {/* ------------------------------------------------------------------ */}
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.decide.methodology.openMethodology")}
            description={
              <>
                {i18nT("ui.ethikos.decide.methodology.thisMethodologyIsStableForTheCurrent")}
              </>
            }
          />
          <Alert
            type="warning"
            showIcon
            icon={<InfoCircleOutlined />}
            message={i18nT("ui.ethikos.decide.methodology.interpretingResults")}
            description={
              <>
                {i18nT("ui.ethikos.decide.methodology.ethikosResultsAreDecisionSupportSignalsNot")}
              </>
            }
          />
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}
