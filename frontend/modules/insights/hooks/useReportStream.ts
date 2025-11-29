// FILE: frontend/modules/insights/hooks/useReportStream.ts
"use client";

import { useEffect, useRef, useState } from "react";

export type ReportStreamMessage = unknown;

export interface ReportStreamState {
  status: "idle" | "connecting" | "open" | "error" | "closed";
  lastMessage?: ReportStreamMessage;
  error?: string;
}

/**
 * Live report stream for the Insights custom builder.
 *
 * Connects to a WebSocket endpoint (default: ws(s)://<host>/ws/reports/custom).
 * Optionally, you can point to another host via NEXT_PUBLIC_REPORTS_WS_BASE
 * (the hook will append `/ws/reports/custom` to that base URL).
 */
export default function useReportStream(): ReportStreamState {
  const [state, setState] = useState<ReportStreamState>({ status: "idle" });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (wsRef.current) return;
    if (typeof window === "undefined") return;

    if (!("WebSocket" in window)) {
      setState({
        status: "error",
        error: "WebSocket not supported in this browser",
      });
      return;
    }

    let isMounted = true;

    setState({ status: "connecting" });

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const wsPath = "/ws/reports/custom";

    const baseFromEnv = process.env.NEXT_PUBLIC_REPORTS_WS_BASE;
    const url =
      baseFromEnv && baseFromEnv.length > 0
        ? `${baseFromEnv.replace(/\/$/, "")}${wsPath}`
        : `${protocol}//${host}${wsPath}`;

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      if (!isMounted) return;
      setState((prev) => ({ ...prev, status: "open" }));

      // Works with the current minimal backend (ping → pong) and
      // is harmless for a richer reports-api implementation.
      try {
        socket.send("ping");
      } catch {
        // ignore send failures
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      if (!isMounted) return;

      let payload: unknown = event.data;

      if (typeof event.data === "string") {
        try {
          payload = JSON.parse(event.data);
        } catch {
          // keep raw text if it is not JSON
          payload = event.data;
        }
      }

      setState((prev) => ({
        ...prev,
        lastMessage: payload,
      }));
    };

    socket.onerror = () => {
      if (!isMounted) return;

      setState((prev) => ({
        ...prev,
        status: "error",
        error: "WebSocket error",
      }));
    };

    socket.onclose = () => {
      if (!isMounted) return;

      setState((prev) => ({
        ...prev,
        status: "closed",
      }));
      wsRef.current = null;
    };

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return state;
}
