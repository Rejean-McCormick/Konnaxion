// FILE: frontend/modules/insights/pages/CustomBuilderPage.tsx
"use client";
import { useLanguage } from '@/context/LanguageContext';
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

import MainLayout from "@/shared/layout/MainLayout";
import { resolveWorldWebSocketUrl } from "@/lib/worlds";

import TimeRangePicker from "../components/TimeRangePicker";

type Range = [dayjs.Dayjs, dayjs.Dayjs];

type BuilderMetric = "smart-vote" | "usage" | "perf";
type BuilderGroupBy = "day" | "week";

interface BuilderState {
  metric: BuilderMetric;
  groupBy: BuilderGroupBy;
  includeRaw: boolean;
  range: Range;
}

interface StreamMessage {
  ts: string;
  direction: "in" | "out";
  payload: unknown;
}

export default function CustomBuilderPage() {
  const { t: i18nT } = useLanguage();
  const [builder, setBuilder] = useState<BuilderState>({
    metric: "smart-vote",
    groupBy: "day",
    includeRaw: false,
    range: [dayjs().subtract(7, "day"), dayjs()],
  });

  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "connecting" | "open" | "closed" | "error"
  >("idle");
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = resolveWorldWebSocketUrl(
      "/ws/reports/custom",
      process.env.NEXT_PUBLIC_REPORTS_WS_BASE,
    );
    if (!url) {
      setConnectionStatus("error");
      setLastError("World context is required for the report WebSocket.");
      return;
    }

    setConnectionStatus("connecting");
    setLastError(null);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("open");
    };

    ws.onerror = () => {
      setConnectionStatus("error");
      setLastError("Unable to open the World-scoped report WebSocket.");
    };

    ws.onclose = () => {
      setConnectionStatus((prev) => (prev === "error" ? prev : "closed"));
    };

    ws.onmessage = (event) => {
      let payload: unknown = event.data;
      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          payload = event.data;
        }
      }

      setMessages((prev) => [
        {
          ts: new Date().toISOString(),
          direction: "in",
          payload,
        },
        ...prev,
      ]);
    };

    return () => {
      wsRef.current = null;
      ws.close();
    };
  }, []);

  const payload = useMemo(
    () => ({
      metric: builder.metric,
      group_by: builder.groupBy,
      include_raw_samples: builder.includeRaw,
      range: {
        from: builder.range[0].toISOString(),
        to: builder.range[1].toISOString(),
      },
    }),
    [builder],
  );

  const handleSend = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setLastError(
        "Live stream is not connected yet. Wait for status “Connected” and try again.",
      );
      return;
    }

    const outgoing = {
      kind: "custom-report-query",
      ...payload,
    };

    ws.send(JSON.stringify(outgoing));

    setMessages((prev) => [
      {
        ts: new Date().toISOString(),
        direction: "out",
        payload: outgoing,
      },
      ...prev,
    ]);
    setLastError(null);
  };

  const statusLabel =
    connectionStatus === "idle"
      ? "Idle"
      : connectionStatus === "connecting"
      ? i18nT("ui.insights.pages.custombuilderpage.connecting")
      : connectionStatus === "open"
      ? "Connected"
      : connectionStatus === "closed"
      ? "Closed"
      : "Error";

  const statusDotClass =
    connectionStatus === "open"
      ? "bg-green-500"
      : connectionStatus === "error"
      ? "bg-red-500"
      : connectionStatus === "connecting"
      ? "bg-yellow-400"
      : "bg-gray-300";

  return (
    <MainLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{i18nT("ui.insights.pages.custombuilderpage.customReportBuilder")}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className={`inline-block h-2 w-2 rounded-full ${statusDotClass}`}
          />
          <span>{statusLabel}</span>
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        {i18nT("ui.insights.pages.custombuilderpage.defineAnInsightsQueryAndSendIt")}
      </p>

      {lastError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {lastError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-600">
              {i18nT("ui.insights.pages.custombuilderpage.queryDefinition")}
            </h2>

            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                {i18nT("ui.insights.pages.custombuilderpage.timeRange")}
              </label>
              <TimeRangePicker
                value={builder.range}
                onChange={(range) =>
                  setBuilder((prev) => ({
                    ...prev,
                    range,
                  }))
                }
              />
            </div>

            <div className="mb-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {i18nT("ui.insights.pages.custombuilderpage.metric")}
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={builder.metric}
                  onChange={(e) =>
                    setBuilder((prev) => ({
                      ...prev,
                      metric: e.target.value as BuilderMetric,
                    }))
                  }
                >
                  <option value="smart-vote">{i18nT("ui.insights.pages.custombuilderpage.smartVote")}</option>
                  <option value="usage">{i18nT("ui.insights.pages.custombuilderpage.usage")}</option>
                  <option value="perf">{i18nT("ui.insights.pages.custombuilderpage.apiPerformance")}</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  {i18nT("ui.insights.pages.custombuilderpage.grouping")}
                </label>
                <select
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={builder.groupBy}
                  onChange={(e) =>
                    setBuilder((prev) => ({
                      ...prev,
                      groupBy: e.target.value as BuilderGroupBy,
                    }))
                  }
                >
                  <option value="day">{i18nT("ui.insights.pages.custombuilderpage.byDay")}</option>
                  <option value="week">{i18nT("ui.insights.pages.custombuilderpage.byWeek")}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  id="include-raw"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={builder.includeRaw}
                  onChange={(e) =>
                    setBuilder((prev) => ({
                      ...prev,
                      includeRaw: e.target.checked,
                    }))
                  }
                />
                <label
                  htmlFor="include-raw"
                  className="text-xs font-medium text-gray-600"
                >
                  {i18nT("ui.insights.pages.custombuilderpage.includeRawSamples")}
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              disabled={connectionStatus !== "open"}
            >
              {i18nT("ui.insights.pages.custombuilderpage.sendToLiveStream")}
            </button>
          </section>
        </div>

        <div className="space-y-4">
          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              {i18nT("ui.insights.pages.custombuilderpage.payloadPreview")}
            </h2>
            <pre className="max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs">
              {JSON.stringify(payload, null, 2)}
            </pre>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
              {i18nT("ui.insights.pages.custombuilderpage.liveStreamDebug")}
            </h2>
            {messages.length === 0 ? (
              <p className="text-xs text-gray-500">
                {i18nT("ui.insights.pages.custombuilderpage.noMessagesYetWhenTheBackendStarts")}
              </p>
            ) : (
              <ul className="max-h-64 space-y-2 overflow-auto rounded border border-gray-200 bg-white p-2 text-xs">
                {messages.map((msg, idx) => (
                  <li key={`${msg.ts}-${idx}`}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-mono text-[11px] text-gray-500">
                        {msg.ts}
                      </span>
                      <span className="rounded bg-gray-100 px-1 py-0.5 text-[10px] uppercase text-gray-600">
                        {msg.direction === "out" ? i18nT("ui.insights.pages.custombuilderpage.sent") : i18nT("ui.insights.pages.custombuilderpage.received")}
                      </span>
                    </div>
                    <pre className="overflow-auto rounded bg-gray-50 p-2">
                      {JSON.stringify(msg.payload, null, 2)}
                    </pre>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
}
