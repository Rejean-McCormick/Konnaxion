// FILE: frontend/modules/admin/components/UserStats.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, Descriptions, Spin } from "antd";
import React from "react";

import useStats from "@/admin/hooks/useStats";

export default function UserStats() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useStats();
  if (isLoading) return <Spin />;
  if (isError)   return <Alert message={error.message} type="error" />;
  if (!data)     return null;                         // TS18048 safe‑guard

  return (
    <Card title={i18nT("ui.admin.userstats.userStatistics")}>
      <Descriptions column={1}>
        <Descriptions.Item label={i18nT("ui.admin.userstats.totalUsers")}>{data.totalUsers}</Descriptions.Item>
        <Descriptions.Item label={i18nT("ui.admin.userstats.activeUsers")}>{data.activeUsers}</Descriptions.Item>
        {data.newUsers != null && (
          <Descriptions.Item label={i18nT("ui.admin.userstats.newUsers24H")}>
            {data.newUsers}
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );
}
