"use client";

import { Card, Progress } from "antd";
import { TopicStub } from "../hooks/useTopics";

export default function TopicCard({
  topic,
  onSelect,
  selected,
}: {
  topic: TopicStub;
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  const total = topic.pro_count + topic.con_count || 1;
  const proPct = Math.round((topic.pro_count / total) * 100);

  return (
    <Card
      hoverable
      size="small"
      className={selected ? "border-blue-600" : ""}
      onClick={() => onSelect(topic.id)}
    >
      <p className="font-medium mb-2">{topic.title}</p>
      <Progress
        percent={proPct}
        size="small"
        strokeColor="#52c41a"
        trailColor="#ff4d4f"
        showInfo={false}
      />
    </Card>
  );
}

