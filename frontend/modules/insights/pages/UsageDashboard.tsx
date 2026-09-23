// FILE: frontend/modules/insights/pages/UsageDashboard.tsx
"use client"; 
import { useLanguage } from '@/context/LanguageContext';
import MainLayout from "@/shared/layout/MainLayout";

import UsageBigNumbers from "../components/UsageBigNumbers";
import { useReport } from "../hooks/useReport";

export default function UsageDashboard() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading } = useReport("usage");

  if (isLoading || !data) {
    return (
      <MainLayout>
        <p>{i18nT("ui.insights.pages.usagedashboard.loading")}</p>
      </MainLayout>
    );
  }

  const items = [
    { label: i18nT("ui.insights.pages.usagedashboard.monthlyActiveUsers"), value: data.mau.at(-1) ?? 0 },
    { label: i18nT("ui.insights.pages.usagedashboard.projects"), value: data.projects.at(-1) ?? 0 },
    { label: i18nT("ui.insights.pages.usagedashboard.docsIndexed"), value: data.docs.at(-1) ?? 0 },
  ];

  return (
    <MainLayout>
      <UsageBigNumbers items={items} />
    </MainLayout>
  );
}
