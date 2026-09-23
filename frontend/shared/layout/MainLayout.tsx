// FILE: frontend/shared/layout/MainLayout.tsx
"use client";
import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import { BarChartOutlined, HomeOutlined } from "@ant-design/icons";
import { Layout, Menu } from "antd";
import Link from "next/link";

const { Header, Sider, Content } = Layout;

const items = [
  { key: "/", icon: <HomeOutlined />, label: <Link href="/"><TranslatedText id="ui.shared.layout.mainlayout.home" /></Link> },
  { key: "/konsensus", icon: <BarChartOutlined />, label: <Link href="/konsensus"><TranslatedText id="ui.shared.layout.mainlayout.konsensus" /></Link> },
  { key: "/insights", icon: <BarChartOutlined />, label: <Link href="/insights"><TranslatedText id="ui.shared.layout.mainlayout.insights" /></Link> },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { t: i18nT } = useLanguage();
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <Menu theme="dark" mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header className="bg-white shadow px-6 font-semibold">{i18nT("ui.shared.layout.mainlayout.konnaxion")}</Header>
        <Content className="p-8 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}