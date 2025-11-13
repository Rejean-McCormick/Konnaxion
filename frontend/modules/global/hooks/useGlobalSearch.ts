// modules/global/hooks/useGlobalSearch.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";

export interface GlobalSearchResult {
  id: string;
  title: string;
  snippet: string;
  path: string;
}

/**
 * Client-side search: GET /api/search?q=…
 * Correction:
 * - n’utilise plus "/api/search" avec baseURL "/api" (évite "/api/api/search")
 * - garde axios (shared/api) qui ne déballe pas .data
 */
export default function useGlobalSearch(query: string) {
  const q = query?.trim() ?? "";

  return useQuery<GlobalSearchResult[], Error>({
    queryKey: ["global-search", q],
    enabled: q.length > 0,
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const res = await api.get<GlobalSearchResult[]>("/api/search", { params: { q } });
      return res.data;
    },
  });
}
