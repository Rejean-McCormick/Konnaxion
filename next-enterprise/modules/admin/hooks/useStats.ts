import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsers?: number;
}

export function useStats() {
  return useQuery<AdminStats, Error>(
    ['admin', 'stats'],
    async () => {
      const { data } = await api.get<AdminStats>('/api/admin/stats');
      return data;
    },
    {
      staleTime: 5 * 60_000, // cache for 5m
      retry: 1,
    }
  );
}
