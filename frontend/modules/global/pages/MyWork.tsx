// FILE: frontend/modules/global/pages/MyWork.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import AppShell from "../components/AppShell";

export default function MyWork() {
  const { t: i18nT } = useLanguage();
  return (
    <AppShell>
      <h1 className="text-xl font-semibold mb-4">{i18nT("ui.global.pages.mywork.myWork")}</h1>
      <p>{i18nT("ui.global.pages.mywork.comingSoon")}</p>
    </AppShell>
  );
}
