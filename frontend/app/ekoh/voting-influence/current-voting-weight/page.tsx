'use client';

import React from 'react';
import { Card, Statistic, Row, Col, Typography, List } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const { Title, Paragraph } = Typography;

// Simulated data for the comparison chart
const weightComparisonData: { category: string; weight: number }[] = [
  { category: 'Your Weight', weight: 70 },
  { category: 'Average Weight', weight: 50 },
  { category: 'Top Experts', weight: 90 },
];

// Simulated data for high-weight domains
const weightByDomain: { domain: string; weight: string }[] = [
  { domain: 'Economy', weight: '80%' },
  { domain: 'Politics', weight: '65%' },
  { domain: 'Technology', weight: '75%' },
];

export default function CurrentVotingWeightPage() {
  // Example: user's smart voting weight (percent)
  const smartVoteWeight = 70;

  return (
    <div className="container mx-auto p-5">
      {/* Page header */}
      <Title level={2}>Current Voting Weight</Title>

      {/* Prominent current weight */}
      <Card className="mb-6">
        <Row justify="center">
          <Col>
            <Statistic title="Smart Vote Weight" value={smartVoteWeight} suffix="%" />
          </Col>
        </Row>
      </Card>

      {/* Explanation */}
      <Card className="mb-6">
        <Paragraph>
          Your Smart Vote weight represents your relative influence in collective
          decisions based on your Ekoh reputation. A higher percentage means your
          vote carries more weight compared to the average user.
        </Paragraph>
      </Card>

      {/* Comparison chart */}
      <Card className="mb-6">
        <Title level={4}>Comparison with Others</Title>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={weightComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="weight" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* High-weight domains */}
      <Card className="mb-6">
        <Title level={4}>Highest Weight by Domain</Title>
        <List
          dataSource={weightByDomain}
          renderItem={(item) => (
            <List.Item>
              <strong>{item.domain}:</strong>&nbsp;{item.weight}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}
