"use client";
import { List } from "antd";
import type { Thread } from "../hooks/useThreads";

export default function ThreadList({ data }: { data: Thread[] }) {
  return (
    <List
      bordered
      dataSource={data}
      renderItem={t => (
        <List.Item key={t.id}>
          <a href={t.url} target="_blank" rel="noreferrer">
            {t.title}
          </a>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(t.created_at).toLocaleString()}
          </span>
        </List.Item>
      )}
    />
  );
}
