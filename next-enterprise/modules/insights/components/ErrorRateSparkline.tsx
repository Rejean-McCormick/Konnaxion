"use client";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
ChartJS.register(LineElement, CategoryScale, LinearScale, Tooltip);

export default function ErrorRateSparkline({
  labels,
  rates,
}: {
  labels: string[];
  rates: number[];
}) {
  const data = {
    labels,
    datasets: [
      {
        data: rates,
        fill: false,
        tension: 0.3,
        borderWidth: 2,
      },
    ],
  };
  return <Line data={data} options={{ plugins: { legend: { display: false } } }} />;
}

