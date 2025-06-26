"use client";

import { useState } from "react";
import { Col, Row, Spin } from "antd";

import MainLayout from "@/shared/layout/MainLayout";
import { useTopics } from "../hooks/useTopics";
import { useTopic } from "../hooks/useTopic";

import TopicCard from "../components/TopicCard";
import StanceSelector from "../components/StanceSelector";
import DebateThread from "../components/DebateThread";
import NewArgumentForm from "../components/NewArgumentForm";

export default function DebateHub() {
  const { data: topics = [], isLoading: loadingTopics } = useTopics();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: detail,
    isLoading: loadingDetail,
  } = useTopic(selectedId ?? "", !!selectedId);

  return (
    <MainLayout>
      <Row gutter={16}>
        <Col span={8}>
          <h2 className="mb-4 font-semibold">Topics</h2>
          {loadingTopics ? (
            <Spin />
          ) : (
            <div className="space-y-3">
              {topics.map((t) => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  selected={t.id === selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </div>
          )}
        </Col>

        <Col span={16}>
          {selectedId && (
            <>
              {loadingDetail || !detail ? (
                <Spin />
              ) : (
                <>
                  <h2 className="mb-2 font-semibold">{detail.topic.title}</h2>

                  <div className="mb-4">
                    <StanceSelector
                      topicId={selectedId}
                      current={
                        detail.stances.pro > detail.stances.con
                          ? "pro"
                          : detail.stances.con > detail.stances.pro
                          ? "con"
                          : "neutral"
                      }
                    />
                  </div>

                  <DebateThread items={detail.arguments} />

                  <div className="mt-6">
                    <NewArgumentForm topicId={selectedId} />
                  </div>
                </>
              )}
            </>
          )}
        </Col>
      </Row>
    </MainLayout>
  );
}

