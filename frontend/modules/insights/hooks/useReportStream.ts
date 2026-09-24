// FILE: frontend/modules/insights/hooks/useReportStream.ts
'use client';

import { useEffect, useRef, useState } from 'react';

import { resolveWorldWebSocketUrl } from '@/lib/worlds';

export type ReportStreamMessage = unknown;

export type ReportStreamStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'error'
  | 'closed';

export interface ReportStreamState {
  status: ReportStreamStatus;
  lastMessage?: ReportStreamMessage;
  error?: string;
}

const REPORTS_WS_PATH = '/ws/reports/custom';

function resolveReportStreamUrl(): string | null {
  return resolveWorldWebSocketUrl(
    REPORTS_WS_PATH,
    process.env.NEXT_PUBLIC_REPORTS_WS_BASE,
  );
}

async function parseSocketPayload(data: unknown): Promise<unknown> {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    const text = await data.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return data;
}

/**
 * Live report stream for the Insights custom builder.
 *
 * Connects to the active World WebSocket endpoint (/ws/w/<world>/reports/custom).
 * Optionally, you can point to another host via NEXT_PUBLIC_REPORTS_WS_BASE.
 * Supported env examples:
 * - ws://localhost:8000
 * - wss://api.example.com
 * - http://localhost:8000
 * - https://api.example.com
 * - ws://localhost:8000/ws/reports/custom
 */
export default function useReportStream(): ReportStreamState {
  const [state, setState] = useState<ReportStreamState>({ status: 'idle' });

  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    if (wsRef.current) {
      return () => {
        mountedRef.current = false;
      };
    }

    if (typeof window === 'undefined') {
      return () => {
        mountedRef.current = false;
      };
    }

    if (!('WebSocket' in window)) {
      setState({
        status: 'error',
        error: 'WebSocket not supported in this browser',
      });

      return () => {
        mountedRef.current = false;
      };
    }

    const url = resolveReportStreamUrl();

    if (!url) {
      setState({
        status: 'error',
        error: 'Unable to resolve WebSocket URL',
      });

      return () => {
        mountedRef.current = false;
      };
    }

    setState({ status: 'connecting' });

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        status: 'open',
        error: undefined,
      }));

      try {
        socket.send('ping');
      } catch {
        // Ignore ping send failures; the connection itself is already open.
      }
    };

    socket.onmessage = async (event: MessageEvent) => {
      if (!mountedRef.current) return;

      const payload = await parseSocketPayload(event.data);

      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        lastMessage: payload,
      }));
    };

    socket.onerror = () => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: prev.error ?? 'WebSocket error',
      }));
    };

    socket.onclose = () => {
      if (!mountedRef.current) return;

      setState((prev) => ({
        ...prev,
        status: prev.status === 'error' ? 'error' : 'closed',
      }));

      wsRef.current = null;
    };

    return () => {
      mountedRef.current = false;

      if (wsRef.current) {
        try {
          wsRef.current.close();
        } finally {
          wsRef.current = null;
        }
      }
    };
  }, []);

  return state;
}