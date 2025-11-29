// FILE: frontend/modules/insights/hooks/useReport.ts
// modules/insights/hooks/useReport.ts
import { useQuery } from "@tanstack/react-query";
import api from "@/api";

type SmartVoteResp = { labels: string[]; votes: number[]; avg_score: number[] };
type UsageResp = { labels: string[]; mau: number[]; projects: number[]; docs: number[] };
type PerfResp = { labels: string[]; p95_latency: number[]; error_rate: number[] };

type EndpointMap = {
  "smart-vote": SmartVoteResp;
  usage: UsageResp;
  perf: PerfResp;
};

export function useReport<E extends keyof EndpointMap>(
  endpoint: E,
  params?: Record<string, unknown>,
) {
  return useQuery<EndpointMap[E]>({
    queryKey: [endpoint, params],
    staleTime: 300_000,
    queryFn: async () => {
      // Manually build query string because api.get uses fetch(RequestInit), not axios-style params
      let query = "";

      if (params && Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          // Flatten basic scalar values to strings; callers should pre-serialise complex types
          searchParams.set(key, String(value));
        });

        const qs = searchParams.toString();
        if (qs) {
          query = `?${qs}`;
        }
      }

      return api.get<EndpointMap[E]>(`/reports/${endpoint}${query}`);
    },
  });
}
