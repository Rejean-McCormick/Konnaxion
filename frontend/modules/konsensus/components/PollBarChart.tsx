// FILE: frontend/modules/konsensus/components/PollBarChart.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
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
  const { t: i18nT } = useLanguage();
  const data = { labels, datasets: [{ label: i18nT("ui.konsensus.pollbarchart.votes"), data: votes }] };
  return <Bar data={data} options={{ responsive: true }} />;
}
