// modules/global/hooks/useGlobalSearch.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export interface GlobalSearchResult {
  id: string;
  title: string;
  snippet: string;
  path: string;
}

interface SearchResponse {
  results: GlobalSearchResult[];
}

/**
 * Client-side global search.
 *
 * Hits the Next.js route: GET /_api/search?q=…
 * - avoids mixing with the backend API baseURL (/api, NEXT_PUBLIC_API_BASE, etc.)
 * - normalizes the `{ results: [...] }` response to `GlobalSearchResult[]`
 */
export default function useGlobalSearch(query: string) {
  const q = query?.trim() ?? "";

  return useQuery<GlobalSearchResult[], Error>({
    queryKey: ["global-search", q],
    enabled: q.length > 0,
    staleTime: 60_000,
    retry: 1,
    queryFn: async () => {
      const params = new URLSearchParams({ q });

      const res = await fetch(`/_api/search?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `Search failed with status ${res.status}`);
      }

      const json = (await res.json()) as SearchResponse;

      return Array.isArray(json.results) ? json.results : [];
    },
  });
}
