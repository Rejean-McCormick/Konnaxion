// FILE: frontend/modules/konsultations/pages/SuggestionPage.tsx
﻿// frontend/modules/konsultations/pages/SuggestionPage.tsx
"use client";

import { useLanguage } from '@/context/LanguageContext';
import {
  BulbOutlined,
  FilterOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Alert, Button, Space, Tag, Typography } from "antd";
import React from "react";

import { SuggestionBoard } from "../components";
import type { Suggestion as BoardSuggestion } from "../components/SuggestionBoard";

const { Title, Paragraph, Text } = Typography;

// Simple demo data so the board is not empty
const INITIAL_SUGGESTIONS: BoardSuggestion[] = [
  {
    id: "demo-1",
    body:
      "Introduce a participatory budget line for small neighbourhood projects, " +
      "with residents voting on proposals once per year.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    authorName: "Sofia R.",
    upvotes: 24,
    downvotes: 3,
    status: "under_review",
    tags: ["Budget", "Neighbourhoods"],
  },
  {
    id: "demo-2",
    body:
      "Pilot car‑free Sundays in the city centre during summer months to test " +
      "impacts on air quality and local commerce.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    authorName: "Jules C.",
    upvotes: 41,
    downvotes: 5,
    status: "accepted",
    tags: ["Mobility", "Climate"],
  },
  {
    id: "demo-3",
    body:
      "Publish an easy‑to‑read overview of how previous consultations influenced " +
      "actual policy decisions, with concrete examples.",
    createdAt: new Date().toISOString(),
    authorName: "Anonymous",
    upvotes: 7,
    downvotes: 0,
    status: "new",
    tags: ["Transparency"],
  },
];

export default function SuggestionPage() {
  const { t: i18nT } = useLanguage();
  const [suggestions, setSuggestions] =
    React.useState<BoardSuggestion[]>(INITIAL_SUGGESTIONS);

  const handleCreateSuggestion = async (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;

    const newSuggestion: BoardSuggestion = {
      id: `local-${Date.now()}`,
      body: trimmed,
      createdAt: new Date().toISOString(),
      authorName: "You",
      upvotes: 0,
      downvotes: 0,
      status: "new",
    };

    setSuggestions((prev) => [newSuggestion, ...prev]);
  };

  const handleUpvote = async (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, upvotes: s.upvotes + 1 } : s,
      ),
    );
  };

  const handleDownvote = async (id: string) => {
    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, downvotes: (s.downvotes ?? 0) + 1 }
          : s,
      ),
    );
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-6 space-y-2">
        <Space align="baseline" size="middle">
          <BulbOutlined />
          <Title level={3} className="!mb-0">
            {i18nT("ui.konsultations.pages.suggestionpage.consultationSuggestions")}
          </Title>
        </Space>

        <Paragraph type="secondary" className="!mb-0">
          {i18nT("ui.konsultations.pages.suggestionpage.collectClusterAndPrioritiseSuggestionsBeforeMoving")}
        </Paragraph>

        <Space wrap>
          <Tag color="blue">{i18nT("ui.konsultations.pages.suggestionpage.suggestionFlow")}</Tag>
          <Tag color="purple">{i18nT("ui.konsultations.pages.suggestionpage.preDecisionStage")}</Tag>
        </Space>
      </header>

      <section className="mb-4">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={i18nT("ui.konsultations.pages.suggestionpage.howThisBoardWorks")}
          description={
            <Text type="secondary">
              {i18nT("ui.konsultations.pages.suggestionpage.eachCardRepresentsASuggestionFromParticipants")}
            </Text>
          }
        />
      </section>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Space wrap>
          <Button icon={<FilterOutlined />}>{i18nT("ui.konsultations.pages.suggestionpage.filterSort")}</Button>
          <Text type="secondary">
            {i18nT("ui.konsultations.pages.suggestionpage.focusOnNewHighSupportOrControversial")}
          </Text>
        </Space>
      </section>

      {/* Core suggestion workflow – wired to SuggestionBoard via local state */}
      <SuggestionBoard
        suggestions={suggestions}
        onCreateSuggestion={handleCreateSuggestion}
        onUpvote={handleUpvote}
        onDownvote={handleDownvote}
      />
    </div>
  );
}
