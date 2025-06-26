
"use client";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

type Props = {
  labels: string[];
  votes: number[];
  scores: number[];
};

export default function SmartVoteChart({ labels, votes, scores }: Props) {
  const data = {
    labels,
    datasets: [
      { type: "bar", label: "Votes", data: votes, yAxisID: "y" },
      { type: "line", label: "Avg Score", data: scores, yAxisID: "y1" },
    ],
  };
  const options = {
    responsive: true,
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      y: { beginAtZero: true },
      y1: { beginAtZero: true, position: "right" as const },
    },
  };
  return <Chart type="bar" data={data} options={options} />;
}
