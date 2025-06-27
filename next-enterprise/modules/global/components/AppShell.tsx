﻿"use client";
import React, { PropsWithChildren } from "react";
import { Layout } from "antd";

/** Light-weight wrapper that gives every page a top‑nav + centred body. */
export default function AppShell({ children }: PropsWithChildren) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header className="text-white text-lg font-semibold px-8">
        Konnaxion
      </Layout.Header>
      <Layout.Content className="p-8 max-w-5xl w-full mx-auto">
        {children}
      </Layout.Content>
    </Layout>
  );
}
