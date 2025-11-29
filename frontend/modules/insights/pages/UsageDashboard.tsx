// FILE: frontend/modules/insights/pages/UsageDashboard.tsx
"use client"; 
import MainLayout from "@/shared/layout/MainLayout";
import { useReport } from "../hooks/useReport";
import UsageBigNumbers from "../components/UsageBigNumbers";

export default function UsageDashboard() {
  const { data, isLoading } = useReport("usage");

  if (isLoading || !data) {
    return (
      <MainLayout>
        <p>Loading…</p>
      </MainLayout>
    );
  }

  const items = [
    { label: "Monthly Active Users", value: data.mau.at(-1) ?? 0 },
    { label: "Projects", value: data.projects.at(-1) ?? 0 },
    { label: "Docs Indexed", value: data.docs.at(-1) ?? 0 },
  ];

  return (
    <MainLayout>
      <UsageBigNumbers items={items} />
    </MainLayout>
  );
}
