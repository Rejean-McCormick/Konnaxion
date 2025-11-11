'use client';

import React from 'react';
import { Card, Col, Row, Typography, List } from 'antd';
import { api } from '@/shared/api';

const { Title } = Typography;

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  description?: string;
}

/**
 * Tableau de bord d'activité
 * Correction : lire `.data` car `shared/api` ne déballe pas la réponse Axios.
 */
const ActivityDashboard: React.FC = () => {
  const [recentComments, setRecentComments] = React.useState<ActivityItem[]>([]);
  const [recentLikes, setRecentLikes] = React.useState<ActivityItem[]>([]);
  const [recentVisits, setRecentVisits] = React.useState<ActivityItem[]>([]);

  React.useEffect(() => {
    const fetchAll = async () => {
      try {
        const [commentsRes, likesRes, visitsRes] = await Promise.all([
          api.get<ActivityItem[]>('/activity/recent-comments'),
          api.get<ActivityItem[]>('/activity/recent-likes'),
          api.get<ActivityItem[]>('/activity/recent-visits'),
        ]);

        setRecentComments(commentsRes.data);
        setRecentLikes(likesRes.data);
        setRecentVisits(visitsRes.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    fetchAll();
  }, []);

  return (
    <div className="p-6">
      <Title level={2}>Recent Activity</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card title="Recent Comments" bordered>
            <List
              dataSource={recentComments}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta title={item.title} description={item.date} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Recent Likes" bordered>
            <List
              dataSource={recentLikes}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta title={item.title} description={item.date} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Recent Visits" bordered>
            <List
              dataSource={recentVisits}
              renderItem={(item) => (
                <List.Item key={item.id}>
                  <List.Item.Meta title={item.title} description={item.date} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ActivityDashboard;
