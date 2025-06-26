"use client";
import { Heatmap } from "react-chartjs-2-heatmap";      // thin wrapper
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, Tooltip);

type Props = { labels: string[]; values: number[][] };

export default function DomainHeatMap({ labels, values }: Props) {
  const data = { labels, datasets: [{ label: "Domains", data: values }] };
  return <Heatmap data={data} options={{ responsive: true }} />;
}

