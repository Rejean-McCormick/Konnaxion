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
    queryFn: async () =>
      api.get<EndpointMap[E]>(`/reports/${endpoint}`, { params }),
  });
}
