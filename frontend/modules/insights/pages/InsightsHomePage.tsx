'use client';

// FILE: frontend/modules/insights/pages/InsightsHomePage.tsx

import { useLanguage } from '@/context/LanguageContext';
import Link from "next/link";

import MainLayout from "@/shared/layout/MainLayout";

export default function InsightsHomePage() {
  const { t: i18nT } = useLanguage();
  const links = [
    ["smart-vote", "Smart-Vote dashboard"],
    ["usage", "Usage dashboard"],
    ["perf", "Performance dashboard"],
    ["custom", "Custom report builder"],
  ];
  return (
    <MainLayout>
      <h1 className="mb-6 text-xl font-semibold">{i18nT("ui.insights.pages.insightshomepage.insights")}</h1>
      <ul className="space-y-4 text-blue-600 underline">
        {links.map(([slug, label]) => (
          <li key={slug}>
            <Link href={`/reports/${slug}`}>{label}</Link>
          </li>
        ))}
      </ul>
    </MainLayout>
  );
}
