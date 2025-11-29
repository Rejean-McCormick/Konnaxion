// FILE: frontend/modules/konsensus/components/PollBarChart.tsx
"use client";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PollBarChart({
  labels,
  votes,
}: {
  labels: string[];
  votes: number[];
}) {
  const data = { labels, datasets: [{ label: "Votes", data: votes }] };
  return <Bar data={data} options={{ responsive: true }} />;
}
