"use client";
import Link from "next/link";
import { Layout, Menu } from "antd";
import { HomeOutlined, BarChartOutlined } from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const items = [
  { key: "/", icon: <HomeOutlined />, label: <Link href="/">Home</Link> },
  { key: "/konsensus", icon: <BarChartOutlined />, label: <Link href="/konsensus">Konsensus</Link> },
  { key: "/insights", icon: <BarChartOutlined />, label: <Link href="/insights">Insights</Link> },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <Menu theme="dark" mode="inline" items={items} />
      </Sider>
      <Layout>
        <Header className="bg-white shadow px-6 font-semibold">Konnaxion</Header>
        <Content className="p-8 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}