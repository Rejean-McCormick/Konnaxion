"use client";
import React from "react";
import AppShell from "@/global/components/AppShell";
import { ModerationQueue, UserStats } from "@/admin/components";

export default function AdminConsole() {
  return (
    <AppShell>
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Console</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <UserStats />
          <ModerationQueue />
        </div>
      </main>
    </AppShell>
  );
}
