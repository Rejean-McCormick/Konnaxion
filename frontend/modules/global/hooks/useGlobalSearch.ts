import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";

export interface GlobalSearchResult {
  id: string;
  title: string;
  snippet: string;
  path: string;
}

/** Client‑side search against GET /api/search?q=… */
export default function useGlobalSearch(query: string) {
  return useQuery<GlobalSearchResult[], Error>({
    queryKey: ["global-search", query],
    queryFn: async () =>
      (await api.get<GlobalSearchResult[]>("/api/search", { params: { q: query } })).data,
    enabled: Boolean(query),
    staleTime: 60_000,
    retry: 1,
  });
}
