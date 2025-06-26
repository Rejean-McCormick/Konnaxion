import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';

export interface GlobalSearchResult {
  id: string;
  title: string;
  snippet: string;
  path: string;
}

export function useGlobalSearch(query: string) {
  return useQuery<GlobalSearchResult[], Error>(
    ['global', 'search', query],
    async () => {
      const { data } = await api.get<{ results: GlobalSearchResult[] }>(
        '/api/search',
        { params: { q: query } }
      );
      return data.results;
    },
    {
      enabled: Boolean(query),
      staleTime: 1 * 60_000, // cache for 1m
      retry: 1,
    }
  );
}
