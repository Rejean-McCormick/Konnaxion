'use client';

import React, { useState } from 'react';
import type { CalendarProps } from 'antd';
import {
  Calendar,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Input,
  Button,
  List,
  Select,
  Typography,
  Row,
  Col,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

/** Domain types */
interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  /** Stored as Dayjs (AntD v5 default) */
  dateTime: Dayjs;
  owner: string;
  team: string;
}

interface ActivityForm {
  eventTitle: string;
  eventDescription?: string;
  eventDate: Dayjs;
  eventTime: Dayjs;
  team: string;
  owner: string;
}

/** Team list for filter and form */
const teamOptions = ['All', 'Alpha Innovators', 'Beta Coders', 'Gamma Team'];

export default function Page() {
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      id: 'evt1',
      title: 'Team Meeting',
      description: 'Réunion d’équipe pour définir les prochaines étapes.',
      dateTime: dayjs().add(2, 'day').hour(10).minute(0),
      owner: 'Alice',
      team: 'Alpha Innovators',
    },
    {
      id: 'evt2',
      title: 'Sprint Planning',
      description: 'Planification du sprint avec présentation du backlog.',
      dateTime: dayjs().add(4, 'day').hour(9).minute(30),
      owner: 'Bob',
      team: 'Beta Coders',
    },
  ]);

  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [preSelectedDate, setPreSelectedDate] = useState<Dayjs | null>(null);

  const [form] = Form.useForm<ActivityForm>();

  const filteredEvents =
    selectedTeam === 'All'
      ? events
      : events.filter((evt) => evt.team === selectedTeam);

  /** AntD v5: use `cellRender` for date cells */
  const cellRender: CalendarProps<Dayjs>['cellRender'] = (value, info) => {
    if (info.type !== 'date') return info.originNode;
    const listData = events.filter((evt) => evt.dateTime.isSame(value, 'day'));
    if (!listData.length) return info.originNode;

    return (
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Text style={{ fontSize: 10 }}>{item.title}</Text>
          </li>
        ))}
      </ul>
    );
  };

  /** Calendar selection uses Dayjs in AntD v5 */
  const handleDateSelect = (value: Dayjs) => {
    setPreSelectedDate(value);
    // preset only the date; time stays empty until user picks it
    form.setFieldsValue({ eventDate: value } as Partial<ActivityForm>);
    setModalVisible(true);
  };

  /** Submit new event with strongly typed form values */
  const handleAddEvent = (values: ActivityForm) => {
    const { eventTitle, eventDescription, eventDate, eventTime, team, owner } =
      values;

    const dateTime = eventDate
      .clone()
      .set({ hour: eventTime.hour(), minute: eventTime.minute(), second: 0, millisecond: 0 });

    const newEvent: ActivityEvent = {
      id: `evt${Date.now()}`,
      title: eventTitle,
      description: eventDescription ?? '',
      dateTime,
      owner,
      team,
    };

    setEvents((prev) => [...prev, newEvent]);
    message.success('Activity added');
    form.resetFields();
    setPreSelectedDate(null);
    setModalVisible(false);
  };

  return (
    <PageContainer title="Activity Planner">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Calendar cellRender={cellRender} onSelect={handleDateSelect} />
        </Col>

        <Col xs={24} md={8}>
          <Title level={4}>Upcoming Activities</Title>

          <Select
            style={{ width: '100%', marginBottom: 16 }}
            value={selectedTeam}
            onChange={(value: string) => setSelectedTeam(value)}
            options={teamOptions.map((t) => ({ value: t, label: t }))}
          />

          <List
            dataSource={[...filteredEvents].sort((a, b) =>
              a.dateTime.diff(b.dateTime),
            )}
            renderItem={(item: ActivityEvent) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={
                    <>
                      <Text type="secondary">
                        {item.dateTime.format('MMM D, YYYY, HH:mm')}
                      </Text>
                      <br />
                      <Text strong>Owner:</Text> {item.owner}
                      <br />
                      <Text strong>Team:</Text> {item.team}
                    </>
                  }
                />
              </List.Item>
            )}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ marginTop: 16 }}
            onClick={() => {
              setPreSelectedDate(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Activity
          </Button>
        </Col>
      </Row>

      <Modal
        title="Add New Activity"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setPreSelectedDate(null);
        }}
        footer={null}
      >
        <Form<ActivityForm> form={form} layout="vertical" onFinish={handleAddEvent}>
          <Form.Item
            label="Event Title"
            name="eventTitle"
            rules={[{ required: true, message: 'Please enter the event title.' }]}
          >
            <Input placeholder="Event title" />
          </Form.Item>

          <Form.Item label="Description" name="eventDescription">
            <Input.TextArea rows={3} placeholder="Event description" />
          </Form.Item>

          <Form.Item
            label="Date"
            name="eventDate"
            rules={[{ required: true, message: 'Please select a date.' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Time"
            name="eventTime"
            rules={[{ required: true, message: 'Please select a time.' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="Team"
            name="team"
            rules={[{ required: true, message: 'Please select a team.' }]}
            initialValue={teamOptions[1]}
          >
            <Select options={teamOptions.filter((t) => t !== 'All').map((t) => ({ value: t, label: t }))} />
          </Form.Item>

          <Form.Item
            label="Owner"
            name="owner"
            rules={[{ required: true, message: 'Please enter the owner.' }]}
          >
            <Input placeholder="Owner name" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Add Activity
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
