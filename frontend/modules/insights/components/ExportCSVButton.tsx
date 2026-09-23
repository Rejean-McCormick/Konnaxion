// FILE: frontend/modules/insights/components/ExportCSVButton.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import { DownloadOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { downloadCsv } from "@/shared/downloadCsv";

export default function ExportCSVButton({
  endpoint,
  params,
}: {
  endpoint: string;
  params?: Record<string, unknown>;
}) {
  const { t: i18nT } = useLanguage();
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={() => downloadCsv(endpoint, params)}
    >
      {i18nT("ui.insights.exportcsvbutton.exportCsv")}
    </Button>
  );
}
