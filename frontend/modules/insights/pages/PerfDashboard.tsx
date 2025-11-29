// FILE: frontend/modules/insights/pages/PerfDashboard.tsx
"use client"; 
import MainLayout from "@/shared/layout/MainLayout";
import { useReport } from "../hooks/useReport";
import LatencySLOGauge from "../components/LatencySLOGauge";
import ErrorRateSparkline from "../components/ErrorRateSparkline";

export default function PerfDashboard() {
  const { data, isLoading } = useReport("perf", { range: "24h" });

  if (isLoading || !data) {
    return (
      <MainLayout>
        <p>Loading…</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h2 className="mb-4 font-semibold">Latency (p95 vs SLO)</h2>
      <LatencySLOGauge valueMs={data.p95_latency.at(-1) ?? 0} sloMs={300} />

      <h2 className="mt-10 mb-4 font-semibold">Error Rate</h2>
      <ErrorRateSparkline labels={data.labels} rates={data.error_rate} />
    </MainLayout>
  );
}
