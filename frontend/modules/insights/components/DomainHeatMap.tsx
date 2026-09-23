'use client';

import { useLanguage } from '@/context/LanguageContext';
// FILE: frontend/modules/insights/components/DomainHeatMap.tsx
export default function DomainHeatMap() {
  const { t: i18nT } = useLanguage();
  return (
    <div style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#bbb" }}>
      {/* TODO: Implement heatmap with Chart.js or another library */}
      <em>{i18nT("ui.insights.domainheatmap.heatmapChartNotAvailableReactChartjs2")}</em>
    </div>
  );
}
