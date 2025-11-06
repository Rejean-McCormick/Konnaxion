'use client'

// File: /pages/konnected/teams-collaboration/activity-planner.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
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
import MainLayout from '@/components/layout-components/MainLayout';
import dayjs, { Moment as Dayjs } from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// Définition de l'interface pour un événement
interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  // La date et l'heure de l'événement sont stockées sous forme d'objet moment
  dateTime: Dayjs;
  owner: string;
  team: string;
}

// Liste fictive d'équipes pour le filtre et le formulaire
const teamOptions = ['All', 'Alpha Innovators', 'Beta Coders', 'Gamma Team'];

const ActivityPlanner: NextPage = () => {
  // État pour la liste des événements
  const [events, setEvents] = useState<ActivityEvent[]>([
    {
      id: 'evt1',
      title: 'Team Meeting',
      description: 'Réunion d’équipe pour définir les prochaines étapes.',
      dateTime: dayjs().add(2, 'days').hour(10).minute(0),
      owner: 'Alice',
      team: 'Alpha Innovators',
    },
    {
      id: 'evt2',
      title: 'Sprint Planning',
      description: 'Planification du sprint avec présentation du backlog.',
      dateTime: dayjs().add(4, 'days').hour(9).minute(30),
      owner: 'Bob',
      team: 'Beta Coders',
    },
    // Ajoutez d'autres événements si besoin
  ]);
  // État pour le filtrage par équipe
  const [selectedTeam, setSelectedTeam] = useState<string>('All');
  // État pour l'affichage du modal d'ajout d'événement
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // Pour pré-remplir la date si l'utilisateur clique sur une date du calendrier
  const [preSelectedDate, setPreSelectedDate] = useState<Dayjs | null>(null);

  const [form] = Form.useForm();

  // Filtrage des événements en fonction de l'équipe sélectionnée
  const filteredEvents =
    selectedTeam === 'All'
      ? events
      : events.filter((evt) => evt.team === selectedTeam);

  // Définition de la fonction de rendu d'une cellule de date dans le calendrier
  const dateCellRender = (value: Dayjs) => {
    const listData = events.filter((evt) =>
      evt.dateTime.isSame(value, 'day')
    );
    return listData.length ? (
      <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Text style={{ fontSize: 10, color: '#1890ff' }}>{item.title}</Text>
          </li>
        ))}
      </ul>
    ) : null;
  };

  // Lorsque l'utilisateur clique sur une date, ouvrir le modal avec la date pré-remplie
  const handleDateSelect = (value: Dayjs) => {
    setPreSelectedDate(value);
    form.setFieldsValue({
      eventDate: value,
      eventTime: null,
    });
    setModalVisible(true);
  };

  // Gestion de la soumission du formulaire d'ajout d'événement
  const handleAddEvent = (values: any) => {
    const { eventTitle, eventDescription, eventDate, eventTime, team, owner } =
      values;
    // Combiner la date et l'heure pour obtenir la dateTime complète
    const dateTime = eventDate.clone().set({
      hour: eventTime.hour(),
      minute: eventTime.minute(),
      second: 0,
    });
    const newEvent: ActivityEvent = {
      id: `evt${Date.now()}`, // Génération simple de l'ID
      title: eventTitle,
      description: eventDescription,
      dateTime,
      owner,
      team,
    };
    setEvents([...events, newEvent]);
    message.success('L’événement a été ajouté.');
    form.resetFields();
    setPreSelectedDate(null);
    setModalVisible(false);
  };

  return (
    <PageContainer title="Activity Planner">
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Calendar dateCellRender={dateCellRender} onSelect={handleDateSelect} />
        </Col>
        <Col xs={24} md={8}>
          <Title level={4}>Upcoming Activities</Title>
          <Select
            style={{ width: '100%', marginBottom: 16 }}
            value={selectedTeam}
            onChange={(value) => setSelectedTeam(value)}
          >
            {teamOptions.map((team) => (
              <Option key={team} value={team}>
                {team}
              </Option>
            ))}
          </Select>
          <List
            dataSource={filteredEvents.sort((a, b) =>
              a.dateTime.diff(b.dateTime)
            )}
            renderItem={(item) => (
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
      {/* Modal pour ajouter un nouvel événement */}
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
        <Form form={form} layout="vertical" onFinish={handleAddEvent}>
          <Form.Item
            label="Event Title"
            name="eventTitle"
            rules={[{ required: true, message: 'Veuillez saisir le titre de l’événement.' }]}
          >
            <Input placeholder="Entrez le titre de l’événement" />
          </Form.Item>
          <Form.Item
            label="Description"
            name="eventDescription"
          >
            <Input.TextArea rows={3} placeholder="Description de l’événement" />
          </Form.Item>
          <Form.Item
            label="Date"
            name="eventDate"
            initialValue={preSelectedDate ? preSelectedDate : null}
            rules={[{ required: true, message: 'Veuillez sélectionner la date.' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            label="Time"
            name="eventTime"
            rules={[{ required: true, message: 'Veuillez sélectionner l’heure.' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item
            label="Team"
            name="team"
            rules={[{ required: true, message: 'Veuillez sélectionner l’équipe.' }]}
            initialValue={teamOptions[1]} // Par défaut, par exemple, la première équipe réelle
          >
            <Select>
              {teamOptions.filter((t) => t !== 'All').map((team) => (
                <Option key={team} value={team}>
                  {team}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Owner"
            name="owner"
            rules={[{ required: true, message: 'Veuillez saisir le nom du responsable.' }]}
          >
            <Input placeholder="Nom du responsable" />
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
};

ActivityPlanner.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ActivityPlanner;
