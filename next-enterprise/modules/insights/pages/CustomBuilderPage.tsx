"use client"; 
import MainLayout from "@/shared/layout/MainLayout";
import { useReportStream } from "../hooks/useReportStream";

export default function CustomBuilderPage() {
  const live = useReportStream<Record<string, unknown>>();

  return (
    <MainLayout>
      <h1 className="mb-6 text-xl font-semibold">Custom report builder</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
        {JSON.stringify(live ?? {}, null, 2)}
      </pre>
    </MainLayout>
  );
}
