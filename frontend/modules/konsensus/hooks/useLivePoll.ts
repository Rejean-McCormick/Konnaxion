// modules/konsensus/hooks/useLivePoll.ts
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { PollId } from "./usePoll";

/**
 * Lightweight "live" layer for Konsensus polls.
 *
 * Instead of a dedicated WebSocket endpoint (/api/poll/:id),
 * this hook periodically invalidates the React Query cache
 * so `usePoll` refetches fresh data from the Smart‑Vote API
 * (kollective/votes/).
 */
export default function useLivePoll(
  id: PollId,
  intervalMs = 5000,
): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!id) return;

    const timer = window.setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["poll", id] });
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [id, intervalMs, queryClient]);
}
