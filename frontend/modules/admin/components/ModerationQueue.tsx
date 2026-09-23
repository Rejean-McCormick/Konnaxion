// FILE: frontend/modules/admin/components/ModerationQueue.tsx
﻿"use client";
import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, List, Spin, Tag } from "antd";
import React from "react";

import useModeration, { ModerationItem } from "@/admin/hooks/useModeration";

function ModerationQueue() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useModeration();

  if (isLoading) return <Spin />;
  if (isError) return <Alert message={error.message} type="error" />;

  return (
    <Card title={i18nT("ui.admin.moderationqueue.moderationQueue")} style={{ marginTop: 16 }}>
      <List<ModerationItem>
        itemLayout="vertical"
        dataSource={data}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta
              title={
                <>
                  <Tag>{item.type}</Tag> {i18nT("ui.admin.moderationqueue.by")} {item.userId}
                </>
              }
              description={new Date(item.createdAt).toLocaleString()}
            />
            <p>{item.content}</p>
            <p>
              <strong>{i18nT("ui.admin.moderationqueue.reason")}</strong> {item.reason}
            </p>
          </List.Item>
        )}
      />
    </Card>
  );
}

export default ModerationQueue;
