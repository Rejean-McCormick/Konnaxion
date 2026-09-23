// FILE: frontend/app/konnected/teams-collaboration/activity-planner/page.tsx
// app/konnected/teams-collaboration/activity-planner/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PlusOutlined } from '@ant-design/icons';
import type { CalendarProps } from 'antd';
import {
  Button,
  Calendar,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  message,
  Modal,
  Row,
  Select,
  Tag,
  TimePicker,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Title, Text, Paragraph } = Typography;

/** Domain types */
type ActivityType = 'Workshop' | 'Check-in' | 'Live Session' | 'Async Sprint';

interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  /** Stored as Dayjs (AntD v5 default) */
  dateTime: Dayjs;
  owner: string;
  team: string;
  activityType?: ActivityType;
  /** Optional linkage to other KonnectED sub-modules */
  linkedLearningPathLabel?: string;
  linkedResourceLabel?: string;
}

interface ActivityFormValues {
  eventTitle: string;
  eventDescription?: string;
  eventDate?: Dayjs | null;
  eventTime?: Dayjs | null;
  team?: string;
  owner?: string;
  activityType?: ActivityType;
  linkedLearningPathLabel?: string;
  linkedResourceLabel?: string;
}

/** Team list for filter and form */
const teamOptions = ['All', 'Alpha Innovators', 'Beta Coders', 'Gamma Team'] as const;

/** Activity type options (team learning & collaboration) */
const ACTIVITY_TYPE_OPTIONS: ActivityType[] = [
  'Workshop',
  'Check-in',
  'Live Session',
  'Async Sprint',
];

/** Some sample learning paths / resources labels (UI-only for now) */
const LEARNING_PATH_OPTIONS = [
  'Onboarding to KonnectED',
  'AI Literacy Starter',
  'Leadership Essentials',
];

const RESOURCE_OPTIONS = [
  'Knowledge: “Intro to Robotics”',
  'Knowledge: “Impact Evaluation Basics”',
  'Knowledge: “Team Collaboration Best Practices”',
];

export default function ActivityPlannerPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  /** Initial mocked events – replace with API data later */
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      id: 'evt1',
      title: i18nT("ui.konnected.teamsCollaboration.activityPlanner.teamOnboardingWorkshop"),
      description:
        i18nT("ui.konnected.teamsCollaboration.activityPlanner.kickOffSessionForNewMembersReviewing"),
      dateTime: dayjs().add(2, 'day').hour(10).minute(0),
      owner: 'Alice',
      team: 'Alpha Innovators',
      activityType: 'Workshop',
      linkedLearningPathLabel: 'Onboarding to KonnectED',
    },
    {
      id: 'evt2',
      title: i18nT("ui.konnected.teamsCollaboration.activityPlanner.sprintLearningCheckIn"),
      description:
        i18nT("ui.konnected.teamsCollaboration.activityPlanner.shortSyncOnWhatWeLearnedThis"),
      dateTime: dayjs().add(4, 'day').hour(9).minute(30),
      owner: 'Bob',
      team: 'Beta Coders',
      activityType: 'Check-in',
      linkedResourceLabel: 'Knowledge: “Team Collaboration Best Practices”',
    },
  ]);

  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [preSelectedDate, setPreSelectedDate] = useState<Dayjs | null>(null);

  const [form] = Form.useForm<ActivityFormValues>();

  /** Filtering by team */
  const filteredEvents = useMemo(
    () =>
      selectedTeam === 'All'
        ? events
        : events.filter((evt) => evt.team === selectedTeam),
    [events, selectedTeam],
  );

  /** Upcoming list, sorted by date/time */
  const upcomingEvents = useMemo(
    () =>
      [...filteredEvents]
        .filter((evt) => evt.dateTime.isAfter(dayjs().subtract(1, 'day')))
        .sort((a, b) => a.dateTime.valueOf() - b.dateTime.valueOf()),
    [filteredEvents],
  );

  /** AntD v5: use `cellRender` for date cells to show small markers */
  const cellRender: CalendarProps<Dayjs>['cellRender'] = (value, info) => {
    if (info.type !== 'date') return info.originNode;
    const listData = events.filter((evt) => evt.dateTime.isSame(value, 'day'));
    if (!listData.length) return info.originNode;

    return (
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {listData.slice(0, 3).map((item) => (
          <li key={item.id} style={{ marginBottom: 2 }}>
            <Text style={{ fontSize: 10 }} ellipsis>
              {item.title}
            </Text>
          </li>
        ))}
        {listData.length > 3 && (
          <li>
            <Text type="secondary" style={{ fontSize: 10 }}>
              +{listData.length - 3} {i18nT("ui.konnected.teamsCollaboration.activityPlanner.more")}
            </Text>
          </li>
        )}
      </ul>
    );
  };

  /** Calendar selection uses Dayjs in AntD v5 */
  const handleDateSelect = (value: Dayjs) => {
    setPreSelectedDate(value);
    // preset only the date; time stays empty until user picks it
    form.setFieldsValue({ eventDate: value });
    setModalVisible(true);
  };

  /** Add new activity (currently client-side only) */
  const handleAddEvent = (values: ActivityFormValues) => {
    if (!values.eventDate || !values.eventTime || !values.team || !values.owner) {
      message.error(i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseFillInAllRequiredFields"));
      return;
    }

    const mergedDateTime = values.eventDate
      .hour(values.eventTime.hour())
      .minute(values.eventTime.minute());

    const newEvent: ActivityEvent = {
      id: `evt-${Date.now()}`,
      title: values.eventTitle,
      description: values.eventDescription ?? '',
      dateTime: mergedDateTime,
      owner: values.owner,
      team: values.team,
      activityType: values.activityType,
      linkedLearningPathLabel: values.linkedLearningPathLabel,
      linkedResourceLabel: values.linkedResourceLabel,
    };

    setEvents((prev) => [...prev, newEvent]);
    setModalVisible(false);
    form.resetFields();
    setPreSelectedDate(null);
    message.success(i18nT("ui.konnected.teamsCollaboration.activityPlanner.activityAddedToTheTeamCalendar"));
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
    message.success(i18nT("ui.konnected.teamsCollaboration.activityPlanner.activityRemoved"));
  };

  const handleOpenModalEmpty = () => {
    setPreSelectedDate(null);
    form.resetFields();
    setModalVisible(true);
  };

  const modalTitle = preSelectedDate
    ? `Add Activity on ${preSelectedDate.format('YYYY-MM-DD')}`
    : i18nT("ui.konnected.teamsCollaboration.activityPlanner.addNewActivity");

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.teamsCollaboration.activityPlanner.activityPlanner")}
      subtitle={
        <span>
          {i18nT("ui.konnected.teamsCollaboration.activityPlanner.planTeamLearningSessionsWorkshopsAndCollaborative")}
        </span>
      }
      primaryAction={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModalEmpty}>
          {i18nT("ui.konnected.teamsCollaboration.activityPlanner.addActivity")}
        </Button>
      }
      secondaryActions={
        <Select
          value={selectedTeam}
          style={{ minWidth: 180 }}
          onChange={setSelectedTeam}
          options={teamOptions.map((t) => ({ label: t, value: t }))}
        />
      }
    >
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card
            title={i18nT("ui.konnected.teamsCollaboration.activityPlanner.teamActivityCalendar")}
            extra={
              <Text type="secondary">
                {i18nT("ui.konnected.teamsCollaboration.activityPlanner.clickADateToScheduleANew")}
              </Text>
            }
            bordered
          >
            <Calendar
              fullscreen
              onSelect={handleDateSelect}
              cellRender={cellRender}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card bordered>
            <Title level={4} style={{ marginBottom: 8 }}>
              {i18nT("ui.konnected.teamsCollaboration.activityPlanner.upcomingActivities")}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 16 }}>
              {i18nT("ui.konnected.teamsCollaboration.activityPlanner.showingActivitiesFor")}{' '}
              <Text strong>{selectedTeam === 'All' ? i18nT("ui.konnected.teamsCollaboration.activityPlanner.allTeams") : selectedTeam}</Text>.
            </Paragraph>

            <List
              size="small"
              dataSource={upcomingEvents}
              locale={{
                emptyText: i18nT("ui.konnected.teamsCollaboration.activityPlanner.noPlannedActivitiesYetUseAddActivity"),
              }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button
                      key="delete"
                      danger
                      size="small"
                      onClick={() => handleDeleteEvent(item.id)}
                    >
                      {i18nT("ui.konnected.teamsCollaboration.activityPlanner.delete")}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        {item.title}{' '}
                        {item.activityType && <Tag color="blue">{item.activityType}</Tag>}
                      </span>
                    }
                    description={
                      <div>
                        <div>
                          <Text strong>
                            {item.dateTime.format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </div>
                        <div>
                          <Text type="secondary">
                            {i18nT("ui.konnected.teamsCollaboration.activityPlanner.team")} {item.team} {i18nT("ui.konnected.teamsCollaboration.activityPlanner.owner")} {item.owner}
                          </Text>
                        </div>
                        {(item.linkedLearningPathLabel || item.linkedResourceLabel) && (
                          <div style={{ marginTop: 4 }}>
                            {item.linkedLearningPathLabel && (
                              <Tag color="green">
                                {i18nT("ui.konnected.teamsCollaboration.activityPlanner.path")} {item.linkedLearningPathLabel}
                              </Tag>
                            )}
                            {item.linkedResourceLabel && (
                              <Tag color="purple">
                                {i18nT("ui.konnected.teamsCollaboration.activityPlanner.resource")} {item.linkedResourceLabel}
                              </Tag>
                            )}
                          </div>
                        )}
                        {item.description && (
                          <div style={{ marginTop: 4 }}>
                            <Text>{item.description}</Text>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />

            <Divider />

            <Text type="secondary">
              {i18nT("ui.konnected.teamsCollaboration.activityPlanner.tipYouCanLaterWireThisPlanner")}
            </Text>
          </Card>
        </Col>
      </Row>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setPreSelectedDate(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form<ActivityFormValues> form={form} layout="vertical" onFinish={handleAddEvent}>
          <Form.Item
            label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.activityTitle")}
            name="eventTitle"
            rules={[{ required: true, message: i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseEnterTheActivityTitle") }]}
          >
            <Input placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.eGSprintLearningCheckIn")} />
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.description")} name="eventDescription">
            <Input.TextArea
              rows={3}
              placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.whatIsTheTeamExpectedToDo")}
            />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.date")}
                name="eventDate"
                rules={[{ required: true, message: i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseSelectADate") }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.time")}
                name="eventTime"
                rules={[{ required: true, message: i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseSelectATime") }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.team_218887")}
            name="team"
            rules={[{ required: true, message: i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseSelectATeam") }]}
            initialValue={teamOptions[1]}
          >
            <Select
              options={teamOptions
                .filter((t) => t !== 'All')
                .map((t) => ({ value: t, label: t }))}
            />
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.activityType")} name="activityType">
            <Select
              placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.selectAnActivityType")}
              allowClear
              options={ACTIVITY_TYPE_OPTIONS.map((t) => ({ label: t, value: t }))}
            />
          </Form.Item>

          <Form.Item
            label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.owner_89ff31")}
            name="owner"
            rules={[{ required: true, message: i18nT("ui.konnected.teamsCollaboration.activityPlanner.pleaseEnterTheOwner") }]}
          >
            <Input placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.eGTeamLeadOrFacilitatorName")} />
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.linkedLearningPathOptional")} name="linkedLearningPathLabel">
            <Select
              placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.linkToALearningPath")}
              allowClear
              options={LEARNING_PATH_OPTIONS.map((label) => ({ label, value: label }))}
            />
          </Form.Item>

          <Form.Item label={i18nT("ui.konnected.teamsCollaboration.activityPlanner.linkedKnowledgeResourceOptional")} name="linkedResourceLabel">
            <Select
              placeholder={i18nT("ui.konnected.teamsCollaboration.activityPlanner.linkToAKnowledgeResource")}
              allowClear
              options={RESOURCE_OPTIONS.map((label) => ({ label, value: label }))}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block icon={<PlusOutlined />}>
              {i18nT("ui.konnected.teamsCollaboration.activityPlanner.addActivity")}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </KonnectedPageShell>
  );
}
