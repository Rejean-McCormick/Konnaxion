// FILE: frontend/modules/insights/pages/PerfDashboard.tsx
"use client"; 
import { useLanguage } from '@/context/LanguageContext';
import MainLayout from "@/shared/layout/MainLayout";

import ErrorRateSparkline from "../components/ErrorRateSparkline";
import LatencySLOGauge from "../components/LatencySLOGauge";
import { useReport } from "../hooks/useReport";

export default function PerfDashboard() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading } = useReport("perf", { range: "24h" });

  if (isLoading || !data) {
    return (
      <MainLayout>
        <p>{i18nT("ui.insights.pages.perfdashboard.loading")}</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 className="mb-4 font-semibold">{i18nT("ui.insights.pages.perfdashboard.latencyP95VsSlo")}</h2>
      <LatencySLOGauge valueMs={data.p95_latency.at(-1) ?? 0} sloMs={300} />

      <h2 className="mt-10 mb-4 font-semibold">{i18nT("ui.insights.pages.perfdashboard.errorRate")}</h2>
      <ErrorRateSparkline labels={data.labels} rates={data.error_rate} />
    </MainLayout>
  );
}
