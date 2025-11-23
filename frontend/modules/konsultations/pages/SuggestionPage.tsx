// frontend/modules/konsultations/pages/SuggestionPage.tsx
"use client";

import React from "react";
import { Alert, Button, Space, Tag, Typography } from "antd";
import {
  BulbOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { SuggestionBoard } from "../components";

const { Title, Paragraph, Text } = Typography;

export default function SuggestionPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-6 space-y-2">
        <Space align="baseline" size="middle">
          <BulbOutlined />
          <Title level={3} className="!mb-0">
            Consultation suggestions
          </Title>
        </Space>

        <Paragraph type="secondary" className="!mb-0">
          Collect, cluster, and prioritise suggestions before moving them into a
          formal consultation or Smart‑Vote ballot.
        </Paragraph>

        <Space wrap>
          <Tag color="blue">Suggestion flow</Tag>
          <Tag color="purple">Pre‑decision stage</Tag>
        </Space>
      </header>

      <section className="mb-4">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="How this board works"
          description={
            <Text type="secondary">
              Each card represents a suggestion from participants. Use the
              board below to triage new ideas, merge duplicates, and surface
              candidates for the next voting round.
            </Text>
          }
        />
      </section>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <Button icon={<FilterOutlined />}>Filter &amp; sort</Button>
          <Text type="secondary">
            Focus on new, high‑support, or controversial suggestions.
          </Text>
        </Space>
      </section>

      {/* Core suggestion workflow – data + interactions live inside SuggestionBoard */}
      <SuggestionBoard />
    </div>
  );
}
