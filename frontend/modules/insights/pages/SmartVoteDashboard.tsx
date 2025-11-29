// FILE: frontend/modules/insights/pages/SmartVoteDashboard.tsx
"use client"; 
import { useState } from "react";
import dayjs from "dayjs";

import MainLayout from "@/shared/layout/MainLayout";
import { useReport } from "../hooks/useReport";
import SmartVoteChart from "../components/SmartVoteChart";
import TimeRangePicker from "../components/TimeRangePicker";
import ExportCSVButton from "../components/ExportCSVButton";

export default function SmartVoteDashboard() {
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "day"),
    dayjs(),
  ]);

  const params = { from: range[0].toISOString(), to: range[1].toISOString() };
  const { data, isLoading } = useReport("smart-vote", params);

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <TimeRangePicker value={range} onChange={setRange} />
        <ExportCSVButton endpoint="smart-vote" params={params} />
      </div>

      {isLoading || !data ? (
        <p>Loading…</p>
      ) : (
        <SmartVoteChart
          labels={data.labels}
          votes={data.votes}
          scores={data.avg_score}
        />
      )}
    </MainLayout>
  );
}
