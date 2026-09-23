// FILE: frontend/modules/global/components/AppShell.tsx
﻿"use client";
import { useLanguage } from '@/context/LanguageContext';
import { Layout } from "antd";
import React, { PropsWithChildren } from "react";

/** Light-weight wrapper that gives every page a top‑nav + centred body. */
export default function AppShell({ children }: PropsWithChildren) {
  const { t: i18nT } = useLanguage();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header className="text-white text-lg font-semibold px-8">
        {i18nT("ui.global.appshell.konnaxion")}
      </Layout.Header>
      <Layout.Content className="p-8 max-w-5xl w-full mx-auto">
        {children}
      </Layout.Content>
    </Layout>
  );
}
