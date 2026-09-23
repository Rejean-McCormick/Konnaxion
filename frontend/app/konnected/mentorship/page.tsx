// FILE: frontend/app/konnected/mentorship/page.tsx
// app/konnected/mentorship/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  FilterOutlined,
  MessageOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Alert,
  Divider,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import api from '@/services/_request';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type MentorLevel = 'primary' | 'secondary' | 'adult';

type MentorApi = {
  id: number | string;
  display_name?: string;
  user?: string;
  bio?: string;
  expertise_areas?: string[] | null;
  languages?: string[] | null;
  level?: MentorLevel | '';
  rating?: number | string | null;
  sessions_completed?: number;
  is_active?: boolean;
  is_accepting_mentees?: boolean;
  focus_areas?: string[] | null;
};

type Mentor = {
  id: string;
  name: string;
  expertise: string[];
  languages: string[];
  level: MentorLevel;
  rating: number;
  sessionsCompleted: number;
  isAvailable: boolean;
  bio: string;
  focusAreas: string[];
};

type AvailabilityFilter = 'all' | 'available';

type FilterState = {
  subject?: string;
  level?: MentorLevel | 'all';
  language?: string;
  availability: AvailabilityFilter;
};

type MentorshipRequestFormValues = {
  learningGoal: string;
  preferredLanguage?: string;
  ageGroup?: string;
  contactChannel?: string;
  additionalNotes?: string;
};

function toMentor(row: MentorApi): Mentor {
  return {
    id: String(row.id),
    name: row.display_name?.trim() || row.user?.trim() || `Mentor ${row.id}`,
    expertise: row.expertise_areas ?? [],
    languages: row.languages ?? [],
    level: row.level || 'adult',
    rating: Number(row.rating ?? 0),
    sessionsCompleted: row.sessions_completed ?? 0,
    isAvailable: Boolean(row.is_accepting_mentees),
    bio: row.bio ?? '',
    focusAreas: row.focus_areas ?? [],
  };
}

const SUBJECT_OPTIONS = [
  'Any',
  'STEM',
  'Languages',
  'Digital literacy',
  'Civics & Ethics',
  'Study skills',
];

const LEVEL_OPTIONS = (i18nT: TranslateFunction): { label: string; value: MentorLevel | 'all' }[] => ([
  { label: i18nT("ui.konnected.mentorship.allLevels"), value: 'all' },
  { label: i18nT("ui.konnected.mentorship.primary"), value: 'primary' },
  { label: i18nT("ui.konnected.mentorship.secondary"), value: 'secondary' },
  { label: i18nT("ui.konnected.mentorship.adultLifelongLearning"), value: 'adult' },
]);

const LANGUAGE_OPTIONS = ['Any', 'English', 'French', 'Spanish', 'Arabic', 'Other'];

export default function KonnectedMentorshipPage() {
  const { t: i18nT } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    subject: 'Any',
    level: 'all',
    language: 'Any',
    availability: 'available',
  });
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [mentorError, setMentorError] = useState<string | null>(null);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [form] = Form.useForm<MentorshipRequestFormValues>();

  useEffect(() => {
    let cancelled = false;

    async function loadMentors() {
      setLoadingMentors(true);
      setMentorError(null);

      try {
        const rows = await api.get<MentorApi[]>('konnected/mentors/');
        if (!cancelled) {
          setMentors(rows.map(toMentor));
        }
      } catch (error) {
        console.error('Failed to load KonnectED mentors', error);
        if (!cancelled) {
          setMentorError('Unable to load mentors right now.');
        }
      } finally {
        if (!cancelled) {
          setLoadingMentors(false);
        }
      }
    }

    void loadMentors();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      if (filters.availability === 'available' && !mentor.isAvailable) {
        return false;
      }

      if (filters.level && filters.level !== 'all' && mentor.level !== filters.level) {
        return false;
      }

      if (filters.language && filters.language !== 'Any') {
        if (!mentor.languages.includes(filters.language)) {
          return false;
        }
      }

      if (filters.subject && filters.subject !== 'Any') {
        const subject = filters.subject.toLowerCase();
        const expertiseMatch = mentor.expertise.some((e) =>
          e.toLowerCase().includes(subject),
        );
        if (!expertiseMatch) {
          return false;
        }
      }

      return true;
    });
  }, [filters, mentors]);

  const handleOpenRequest = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setRequestModalOpen(true);
  };

  const handleCloseRequest = () => {
    setRequestModalOpen(false);
    form.resetFields();
  };

  const handleSubmitRequest = async (values: MentorshipRequestFormValues) => {
    if (!selectedMentor) {
      message.error(i18nT("ui.konnected.mentorship.chooseAMentorBeforeSubmittingARequest"));
      return;
    }

    setSubmittingRequest(true);
    try {
      await api.post('konnected/mentorship-requests/', {
        mentor: Number(selectedMentor.id),
        learning_goal: values.learningGoal.trim(),
        preferred_language: values.preferredLanguage ?? '',
        age_group: values.ageGroup ?? '',
        contact_channel: values.contactChannel ?? '',
        additional_notes: values.additionalNotes ?? '',
      });

      message.success(i18nT("ui.konnected.mentorship.yourMentorshipRequestHasBeenRecorded"));
      handleCloseRequest();
    } catch (error) {
      console.error('Failed to create mentorship request', error);
      message.error(i18nT("ui.konnected.mentorship.unableToSubmitTheMentorshipRequest"));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      subject: 'Any',
      level: 'all',
      language: 'Any',
      availability: 'available',
    });
  };

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.mentorship.mentorship")}
      subtitle={i18nT("ui.konnected.mentorship.connectWithVolunteerMentorsAndJoinCross")}
      primaryAction={
        <Button icon={<TeamOutlined />} href="#learning-circles">
          {i18nT("ui.konnected.mentorship.browseLearningCircles")}
        </Button>
      }
      secondaryActions={
        <Button icon={<FilterOutlined />} onClick={handleResetFilters}>
          {i18nT("ui.konnected.mentorship.resetFilters")}
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title={i18nT("ui.konnected.mentorship.filterMentors")} extra={<FilterOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>{i18nT("ui.konnected.mentorship.subjectFocus")}</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={filters.subject}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      subject: value,
                    }))
                  }
                >
                  {SUBJECT_OPTIONS.map((subject) => (
                    <Option key={subject} value={subject}>
                      {subject}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>{i18nT("ui.konnected.mentorship.level")}</Text>
                <Radio.Group
                  style={{ marginTop: 4 }}
                  value={filters.level}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      level: e.target.value as FilterState['level'],
                    }))
                  }
                >
                  {LEVEL_OPTIONS(i18nT).map((opt) => (
                    <Radio.Button key={opt.value} value={opt.value}>
                      {opt.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>

              <div>
                <Text strong>{i18nT("ui.konnected.mentorship.language")}</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  value={filters.language}
                  onChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      language: value,
                    }))
                  }
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <Option key={lang} value={lang}>
                      {lang}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text strong>{i18nT("ui.konnected.mentorship.availability")}</Text>
                <Radio.Group
                  style={{ marginTop: 4 }}
                  value={filters.availability}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      availability: e.target.value as AvailabilityFilter,
                    }))
                  }
                >
                  <Radio value="available">{i18nT("ui.konnected.mentorship.currentlyAvailable")}</Radio>
                  <Radio value="all">{i18nT("ui.konnected.mentorship.showAllMentors")}</Radio>
                </Radio.Group>
              </div>
            </Space>
          </Card>

          <Card style={{ marginTop: 16 }} title={i18nT("ui.konnected.mentorship.howMentorshipWorks")}>
            <Space direction="vertical" size="small">
              <Paragraph>
                {i18nT("ui.konnected.mentorship.mentorsAreVolunteersWhoSupportLearnersWith")}
              </Paragraph>
              <Paragraph>
                {i18nT("ui.konnected.mentorship.onceYourRequestIsAcceptedYouWill")}
              </Paragraph>
              <Paragraph>
                {i18nT("ui.konnected.mentorship.forYouthAccountsGuardianApprovalMayBe")}
              </Paragraph>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <UserOutlined />
                <span>{i18nT("ui.konnected.mentorship.availableMentors")}</span>
              </Space>
            }
            extra={
              <Text type="secondary">
                {filteredMentors.length} {i18nT("ui.konnected.mentorship.of")} {mentors.length} {i18nT("ui.konnected.mentorship.mentorsShown")}
              </Text>
            }
          >
            {mentorError && (
              <Alert
                type="error"
                showIcon
                message={mentorError}
                style={{ marginBottom: 16 }}
              />
            )}
            {loadingMentors ? (
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Spin />
              </div>
            ) : filteredMentors.length === 0 ? (
              <Empty
                description={i18nT("ui.konnected.mentorship.noMentorsMatchYourCurrentFiltersTry")}
                style={{ padding: '24px 0' }}
              />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={filteredMentors}
                renderItem={(mentor) => (
                  <List.Item
                    key={mentor.id}
                    actions={[
                      <Space key="rating">
                        <StarFilled style={{ color: '#faad14' }} />
                        <Text>
                          {mentor.rating.toFixed(1)} · {mentor.sessionsCompleted} {i18nT("ui.konnected.mentorship.sessions")}
                        </Text>
                      </Space>,
                      <Button
                        key="request"
                        type="link"
                        icon={<MessageOutlined />}
                        onClick={() => handleOpenRequest(mentor)}
                        disabled={!mentor.isAvailable}
                      >
                        {mentor.isAvailable ? i18nT("ui.konnected.mentorship.requestMentorship") : i18nT("ui.konnected.mentorship.joinWaitlist")}
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar size="large" icon={<UserOutlined />} />}
                      title={
                        <Space wrap>
                          <Text strong>{mentor.name}</Text>
                          {mentor.isAvailable ? (
                            <Badge status="success" text={i18nT("ui.konnected.mentorship.available")} />
                          ) : (
                            <Badge status="default" text={i18nT("ui.konnected.mentorship.waitlist")} />
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={4}>
                          <Space wrap>
                            {mentor.expertise.map((area) => (
                              <Tag key={area}>{area}</Tag>
                            ))}
                          </Space>
                          <Text type="secondary">
                            {i18nT("ui.konnected.mentorship.speaks")} {mentor.languages.join(', ')} {i18nT("ui.konnected.mentorship.level_890680")}{' '}
                            {mentor.level === 'primary'
                              ? i18nT("ui.konnected.mentorship.primary")
                              : mentor.level === 'secondary'
                              ? i18nT("ui.konnected.mentorship.secondary")
                              : i18nT("ui.konnected.mentorship.adultLifelong")}
                          </Text>
                        </Space>
                      }
                    />
                    <Paragraph style={{ marginTop: 8 }}>{mentor.bio}</Paragraph>
                    <Space wrap>
                      {mentor.focusAreas.map((area) => (
                        <Tag key={area} color="blue">
                          {area}
                        </Tag>
                      ))}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>

          {/* Divider does not receive id – keep it purely presentational */}
          <Divider />

          {/* Anchor target lives on the Card, which is valid HTML and TS-safe */}
          <Card
            id="learning-circles"
            title={
              <Space>
                <TeamOutlined />
                <span>{i18nT("ui.konnected.mentorship.crossAgeLearningCircles")}</span>
              </Space>
            }
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Paragraph>
                {i18nT("ui.konnected.mentorship.learningCirclesAreSmallGroupsOfLearners")}
              </Paragraph>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card size="small" variant="borderless">
                    <Title level={5}>{i18nT("ui.konnected.mentorship.projectBasedCircles")}</Title>
                    <Paragraph type="secondary">
                      {i18nT("ui.konnected.mentorship.workOnAConcreteProjectScienceFair")}
                    </Paragraph>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card size="small" variant="borderless">
                    <Title level={5}>{i18nT("ui.konnected.mentorship.skillBuildingCircles")}</Title>
                    <Paragraph type="secondary">
                      {i18nT("ui.konnected.mentorship.focusOnSpecificSkillsLikeReadingFluency")}
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
              <Button type="primary" icon={<TeamOutlined />}>
                {i18nT("ui.konnected.mentorship.expressInterestInALearningCircle")}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          selectedMentor
            ? i18nT("ui.konnected.mentorship.requestMentorshipWith", { name: selectedMentor.name })
            : i18nT("ui.konnected.mentorship.requestMentorship")
        }
        open={requestModalOpen}
        onCancel={handleCloseRequest}
        footer={null}
        destroyOnHidden
      >
        <Form<MentorshipRequestFormValues>
          layout="vertical"
          form={form}
          onFinish={handleSubmitRequest}
        >
          <Form.Item
            label={i18nT("ui.konnected.mentorship.whatWouldYouLikeToWorkOn")}
            name="learningGoal"
            rules={[
              {
                required: true,
                message: i18nT("ui.konnected.mentorship.pleaseDescribeYourLearningGoal"),
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder={i18nT("ui.konnected.mentorship.exampleINeedHelpPreparingForMy")}
            />
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.mentorship.preferredLanguage")} name="preferredLanguage">
            <Select placeholder={i18nT("ui.konnected.mentorship.chooseALanguageOptional")}>
              {LANGUAGE_OPTIONS.filter((l) => l !== 'Any').map((lang) => (
                <Option key={lang} value={lang}>
                  {lang}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.mentorship.ageGroup")} name="ageGroup">
            <Select placeholder={i18nT("ui.konnected.mentorship.selectYourAgeGroup")}>
              <Option value="primary">{i18nT("ui.konnected.mentorship.primaryApprox612")}</Option>
              <Option value="secondary">{i18nT("ui.konnected.mentorship.secondaryApprox1318")}</Option>
              <Option value="adult">{i18nT("ui.konnected.mentorship.adultLifelongLearner")}</Option>
            </Select>
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.mentorship.preferredContactChannel")} name="contactChannel">
            <Radio.Group>
              <Radio value="messaging">{i18nT("ui.konnected.mentorship.inAppMessaging")}</Radio>
              <Radio value="video">{i18nT("ui.konnected.mentorship.videoOrAudioSessions")}</Radio>
              <Radio value="either">{i18nT("ui.konnected.mentorship.eitherIsFine")}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.mentorship.additionalNotesOptional")} name="additionalNotes">
            <TextArea
              rows={3}
              placeholder={i18nT("ui.konnected.mentorship.shareAnyConstraintsScheduleAccessibilityNeedsGuardian")}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseRequest}>{i18nT("ui.konnected.mentorship.cancel")}</Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<MessageOutlined />}
                loading={submittingRequest}
              >
                {i18nT("ui.konnected.mentorship.submitRequest")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </KonnectedPageShell>
  );
}
