"use client";
import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { downloadCsv } from "@/shared/downloadCsv";

export default function ExportCSVButton({
  endpoint,
  params,
}: {
  endpoint: string;
  params?: Record<string, unknown>;
}) {
  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={() => downloadCsv(endpoint, params)}
    >
      Export CSV
    </Button>
  );
}
