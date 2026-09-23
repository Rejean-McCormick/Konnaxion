// FILE: frontend/modules/admin/pages/AdminConsole.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import React from "react";

import { ModerationQueue, UserStats } from "@/admin/components";
import AppShell from "@/global/components/AppShell";

export default function AdminConsole() {
  const { t: i18nT } = useLanguage();
  return (
    <AppShell>
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">{i18nT("ui.admin.pages.adminconsole.adminConsole")}</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <UserStats />
          <ModerationQueue />
        </div>
      </main>
    </AppShell>
  );
}
