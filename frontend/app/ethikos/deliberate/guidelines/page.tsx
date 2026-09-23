// FILE: frontend/app/ethikos/deliberate/guidelines/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { PageContainer } from '@ant-design/pro-components';
import {
  Alert,
  Anchor,
  Card,
  Col,
  Divider,
  List,
  Row,
  Space,
  Steps,
  Table,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

type EvidenceRuleRow = {
  claimType: string;
  minimumEvidence: string;
  preferredSources: string;
};

const evidenceData: EvidenceRuleRow[] = [
  {
    claimType: 'Factual statement about science / policy',
    minimumEvidence: 'At least one credible, verifiable source',
    preferredSources: 'Peer‑reviewed research, official statistics, institutional reports',
  },
  {
    claimType: 'Claim about personal experience or local context',
    minimumEvidence: 'Describe context and limits of your observation',
    preferredSources: 'First‑hand description; optional supporting links',
  },
  {
    claimType: 'Normative / ethical argument',
    minimumEvidence: 'Explicit reasoning chain; reference to frameworks if used',
    preferredSources: 'Ethical frameworks, case law, precedent, structured argumentation',
  },
  {
    claimType: 'Prediction or scenario',
    minimumEvidence: 'Stated assumptions and method (trend, model, analogy)',
    preferredSources: 'Forecasting models, expert assessments, reputable think‑tank reports',
  },
];

const evidenceColumns = (i18nT: TranslateFunction): ColumnsType<EvidenceRuleRow> => ([
  {
    title: i18nT("ui.ethikos.deliberate.guidelines.claimType"),
    dataIndex: 'claimType',
    key: 'claimType',
    width: 260,
  },
  {
    title: i18nT("ui.ethikos.deliberate.guidelines.minimumEvidence"),
    dataIndex: 'minimumEvidence',
    key: 'minimumEvidence',
    width: 260,
  },
  {
    title: i18nT("ui.ethikos.deliberate.guidelines.preferredSources"),
    dataIndex: 'preferredSources',
    key: 'preferredSources',
  },
]);

const quickChecklistItems: string[] = [
  'Is my contribution respectful and focused on the topic?',
  'Have I separated facts from opinions or values?',
  'Did I provide at least one source or explain my reasoning?',
  'Is my stance slider (−3…+3) aligned with what I actually wrote?',
  'Would I be comfortable seeing this appear in a public archive of the debate?',
];

export default function Guidelines() {
  const { t: i18nT } = useLanguage();
  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.deliberate.guidelines.deliberationGuidelines")}
      subtitle={i18nT("ui.ethikos.deliberate.guidelines.sharedRulesForKorumDebatesAndKonsultations")}
      sectionLabel={i18nT("ui.ethikos.deliberate.guidelines.deliberate")}
    >
      <PageContainer ghost>
        <Row gutter={[24, 24]}>
          {/* Left column: navigation + quick rules */}
          <Col xs={24} md={7} lg={6}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small" title={i18nT("ui.ethikos.deliberate.guidelines.navigateThisGuide")}>
                <Anchor
                  affix
                  items={[
                    { key: 'overview', href: '#overview', title: i18nT("ui.ethikos.deliberate.guidelines.overview") },
                    { key: 'principles', href: '#principles', title: i18nT("ui.ethikos.deliberate.guidelines.corePrinciples") },
                    { key: 'etiquette', href: '#etiquette', title: i18nT("ui.ethikos.deliberate.guidelines.etiquetteTone") },
                    { key: 'evidence', href: '#evidence', title: i18nT("ui.ethikos.deliberate.guidelines.evidenceSources") },
                    {
                      key: 'identity',
                      href: '#identity',
                      title: i18nT("ui.ethikos.deliberate.guidelines.identityExpertiseEkoh"),
                    },
                    { key: 'korum', href: '#korum', title: i18nT("ui.ethikos.deliberate.guidelines.korumDebates") },
                    {
                      key: 'konsultations',
                      href: '#konsultations',
                      title: i18nT("ui.ethikos.deliberate.guidelines.konsultationsConsultations"),
                    },
                    { key: 'moderation', href: '#moderation', title: i18nT("ui.ethikos.deliberate.guidelines.moderationLadder") },
                    { key: 'appeals', href: '#appeals', title: i18nT("ui.ethikos.deliberate.guidelines.appealsTransparency") },
                    { key: 'checklist', href: '#checklist', title: i18nT("ui.ethikos.deliberate.guidelines.checklistBeforePosting") },
                  ]}
                />
              </Card>

              <Card size="small" title={i18nT("ui.ethikos.deliberate.guidelines.hardLimits")}>
                <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                  {i18nT("ui.ethikos.deliberate.guidelines.contentMayBeRemovedAndAccountsRestricted")}
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    'Harassment, threats, or targeted hate',
                    'Deliberate misinformation (knowingly false claims)',
                    'Doxxing or disclosure of private data',
                    'Incitement to violence or illegal activity',
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                  )}
                />
              </Card>
            </Space>
          </Col>

          {/* Right column: full guidelines */}
          <Col xs={24} md={17} lg={18}>
            {/* Overview */}
            <section id="overview">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.whatEthikosIsFor")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.ethikosIsKonnaxionSEnvironmentForStructured")}
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  'Nuanced stance‑taking on a −3…+3 scale (from strongly against to strongly for).',
                  'Threaded arguments (Korum) where reasoning and evidence are visible.',
                  'Time‑boxed consultations (Konsultations) with transparent weighted results.',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                )}
              />

              <Alert
                style={{ marginTop: 16 }}
                type="info"
                showIcon
                message={i18nT("ui.ethikos.deliberate.guidelines.keyOperationalRules")}
                description={
                  <Space direction="vertical">
                    <Text>
                      {i18nT("ui.ethikos.deliberate.guidelines.stanceScaleIsFixedAt33")}
                    </Text>
                    <Text>
                      {i18nT("ui.ethikos.deliberate.guidelines.moderationAutoHideIsTriggeredAfter")} <strong>{i18nT("ui.ethikos.deliberate.guidelines.text3IndependentReports")}</strong>.
                    </Text>
                    <Text>
                      {i18nT("ui.ethikos.deliberate.guidelines.expertCohortViewsAreOnlyShownOnce")}{' '}
                      <strong>{i18nT("ui.ethikos.deliberate.guidelines.text12QualifiedExperts")}</strong> {i18nT("ui.ethikos.deliberate.guidelines.haveVoted")}
                    </Text>
                  </Space>
                }
              />
            </section>

            <Divider />

            {/* Core principles */}
            <section id="principles">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.corePrinciples")}</Title>
              <Space wrap>
                <Tag color="blue">{i18nT("ui.ethikos.deliberate.guidelines.respect")}</Tag>
                <Tag color="green">{i18nT("ui.ethikos.deliberate.guidelines.evidence")}</Tag>
                <Tag color="gold">{i18nT("ui.ethikos.deliberate.guidelines.transparency")}</Tag>
                <Tag color="purple">{i18nT("ui.ethikos.deliberate.guidelines.nuance")}</Tag>
                <Tag color="geekblue">{i18nT("ui.ethikos.deliberate.guidelines.accountability")}</Tag>
              </Space>

              <Paragraph style={{ marginTop: 12 }}>
                {i18nT("ui.ethikos.deliberate.guidelines.everyContributionInEthikosShould")}
              </Paragraph>
              <List
                size="small"
                dataSource={[
                  'Focus on ideas and arguments, not on people.',
                  'Separate facts (what is) from values (what ought to be).',
                  'Acknowledge uncertainty and limits of your own knowledge.',
                  'Make it possible for others to verify what you claim.',
                  'Remain readable and accessible to non‑experts where possible.',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                )}
              />
            </section>

            <Divider />

            {/* Etiquette & tone */}
            <section id="etiquette">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.etiquetteTone")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.theGoalIsHighSignalLowToxicity")}
              </Paragraph>

              <List
                size="small"
                dataSource={[
                  'Be concise and stay on topic. Long posts are fine if they are structured.',
                  'Critique arguments, not identities or motives. Avoid ad hominem attacks.',
                  'No mockery, slurs, or profanity aimed at individuals or groups.',
                  'Signal disagreement explicitly (e.g. “I disagree because…”), not by sarcasm alone.',
                  'Use formatting (short paragraphs, bullet points) to make complex ideas readable.',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                )}
              />
            </section>

            <Divider />

            {/* Evidence & sources */}
            <section id="evidence">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.evidenceSources")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.ethikosIsNotJustForOpinionsIt")}
              </Paragraph>

              <List
                size="small"
                dataSource={[
                  'If a claim can be checked, provide enough information for others to check it.',
                  'Link to primary sources where possible (studies, datasets, official documents).',
                  'If you rely on secondary sources (media, blogs), prefer outlets with clear editorial standards.',
                  'Clearly mark personal experience as such and avoid overgeneralising from it.',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                )}
              />

              <Card
                size="small"
                style={{ marginTop: 16 }}
                title={i18nT("ui.ethikos.deliberate.guidelines.minimumEvidenceByClaimType")}
              >
                <Table<EvidenceRuleRow>
                  size="small"
                  rowKey={(row) => row.claimType}
                  columns={evidenceColumns(i18nT)}
                  dataSource={evidenceData}
                  pagination={false}
                />
              </Card>
            </section>

            <Divider />

            {/* Identity, expertise & Ekoh */}
            <section id="identity">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.identityExpertiseEkohWeighting")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.ethikosUsesTheEkohReputationSystemTo")}
              </Paragraph>

              <Card size="small">
                <List
                  size="small"
                  dataSource={[
                    'Expert and verified accounts may be tagged (e.g. “Domain expert”, “Verified identity”) next to their name.',
                    'Weighted results views (e.g. “Experts only”) depend on Ekoh scores in the relevant field.',
                    'Reputation is descriptive, not absolute authority: arguments still stand or fall on their merits.',
                    'You may use pseudonyms where allowed, but you remain bound by all guidelines and legal obligations.',
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </section>

            <Divider />

            {/* Korum-specific rules */}
            <section id="korum">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.korumDebatesStructuredArguments")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.korumIsTheStructuredDebateEnvironmentUnder")}
              </Paragraph>

              <List
                size="small"
                header={<Text strong>{i18nT("ui.ethikos.deliberate.guidelines.whenPostingInAKorumDebateYou")}</Text>}
                dataSource={[
                  'Align your stance slider (−3…+3) with the position you defend in your argument.',
                  'Use one post per main point; avoid packing multiple unrelated arguments into a single block.',
                  'If you reply, indicate whether you are clarifying, objecting, or adding supporting detail.',
                  'Avoid repeating the same argument without engaging with counter‑arguments.',
                  'Flag possible conflicts of interest when relevant to the topic.',
                ]}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>{item}</List.Item>
                )}
              />
            </section>

            <Divider />

            {/* Konsultations-specific rules */}
            <section id="konsultations">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.konsultationsPublicConsultationsFeedback")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.konsultationsHostTimeBoxedConsultationsAndSuggestion")}
              </Paragraph>

              <Card size="small">
                <List
                  size="small"
                  header={<Text strong>{i18nT("ui.ethikos.deliberate.guidelines.forConsultationsAndSuggestions")}</Text>}
                  dataSource={[
                    'Answer the specific question being asked; off‑topic comments may be hidden.',
                    'When suggesting amendments, be as concrete and implementable as possible.',
                    'Explain trade‑offs: what might be improved, and what might be lost?',
                    'Avoid campaigns to flood a consultation with near‑identical comments.',
                    'Respect any participation limits (per‑day comments, max length, etc.) if configured.',
                  ]}
                  renderItem={(item) => (
                    <List.Item style={{ paddingInline: 0, alignItems: 'flex-start' }}>
                      {item}
                    </List.Item>
                  )}
                />
              </Card>
            </section>

            <Divider />

            {/* Moderation ladder */}
            <section id="moderation">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.moderationReportingLadder")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.moderationInEthikosIsAMixOf")}
              </Paragraph>

              <Steps
                direction="vertical"
                size="small"
                current={2}
                style={{ marginTop: 8, maxWidth: 520 }}
              >
                <Step
                  title={i18nT("ui.ethikos.deliberate.guidelines.text0ContentPosted")}
                  description={i18nT("ui.ethikos.deliberate.guidelines.aDebateArgumentCommentOrSuggestionIs")}
                />
                <Step
                  title={i18nT("ui.ethikos.deliberate.guidelines.text1ReportedByUsers")}
                  description={i18nT("ui.ethikos.deliberate.guidelines.otherUsersCanReportContentForClear")}
                />
                <Step
                  title={i18nT("ui.ethikos.deliberate.guidelines.text2AutoHideAt3IndependentReports")}
                  description={i18nT("ui.ethikos.deliberate.guidelines.atThreeDistinctReportsThePostIs")}
                />
                <Step
                  title={i18nT("ui.ethikos.deliberate.guidelines.text3ModeratorReview")}
                  description={i18nT("ui.ethikos.deliberate.guidelines.aModeratorReviewsTheContextReportsAnd")}
                />
                <Step
                  title={i18nT("ui.ethikos.deliberate.guidelines.text4Outcome")}
                  description={i18nT("ui.ethikos.deliberate.guidelines.contentMayBeRestoredOptionallyWithA")}
                />
              </Steps>
            </section>

            <Divider />

            {/* Appeals & transparency */}
            <section id="appeals">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.appealsTransparency")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.youCanRequestASecondLookWhen")}
              </Paragraph>

              <Timeline
                style={{ marginTop: 8 }}
                items={[
                  {
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>{i18nT("ui.ethikos.deliberate.guidelines.text1Trigger")}</Text>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {i18nT("ui.ethikos.deliberate.guidelines.youReceiveANoticeThatAPost")}
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    color: 'blue',
                    children: (
                      <>
                        <Text strong>{i18nT("ui.ethikos.deliberate.guidelines.text2AppealSubmission")}</Text>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {i18nT("ui.ethikos.deliberate.guidelines.useTheRequestReviewOrEquivalentButton")}
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    color: 'green',
                    children: (
                      <>
                        <Text strong>{i18nT("ui.ethikos.deliberate.guidelines.text3SecondaryReview")}</Text>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {i18nT("ui.ethikos.deliberate.guidelines.aModeratorOtherThanTheOriginalReviewer")}
                        </Paragraph>
                      </>
                    ),
                  },
                  {
                    color: 'gray',
                    children: (
                      <>
                        <Text strong>{i18nT("ui.ethikos.deliberate.guidelines.text4FinalOutcome")}</Text>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {i18nT("ui.ethikos.deliberate.guidelines.theDecisionMayBeUpheldOrAdjusted")}
                        </Paragraph>
                      </>
                    ),
                  },
                ]}
              />
            </section>

            <Divider />

            {/* Checklist */}
            <section id="checklist">
              <Title level={3}>{i18nT("ui.ethikos.deliberate.guidelines.checklistBeforePosting")}</Title>
              <Paragraph>
                {i18nT("ui.ethikos.deliberate.guidelines.useThisShortChecklistBeforeYouSubmit")}
              </Paragraph>

              <List
                size="small"
                dataSource={quickChecklistItems}
                renderItem={(item) => (
                  <List.Item style={{ paddingInline: 0 }}>
                    <Text>• {item}</Text>
                  </List.Item>
                )}
              />

              <Alert
                style={{ marginTop: 16 }}
                type="success"
                showIcon
                message={i18nT("ui.ethikos.deliberate.guidelines.signalBoostGoodDebate")}
                description={
                  <Paragraph style={{ marginBottom: 0 }}>
                    {i18nT("ui.ethikos.deliberate.guidelines.useTheAvailableToolsUpWeightingEndorsements")}
                  </Paragraph>
                }
              />
            </section>
          </Col>
        </Row>
      </PageContainer>
    </EthikosPageShell>
  );
}
