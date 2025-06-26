"use client";

import { List, Tag } from "antd";
import { Argument } from "../hooks/useTopic";

export default function DebateThread({ items }: { items: Argument[] }) {
  return (
    <List
      dataSource={items}
      renderItem={(a) => (
        <List.Item key={a.id} className="px-2">
          <Tag color={a.stance === "pro" ? "green" : "red"}>{a.stance}</Tag>
          <span className="font-medium mr-2">{a.author}</span>
          <span>{a.body}</span>
        </List.Item>
      )}
    />
  );
}

