import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';

export interface ModerationItem {
  id: string;
  type: string;
  content: string;
  reason: string;
  userId: string;
  createdAt: string;
}

export function useModeration() {
  return useQuery<ModerationItem[], Error>(
    ['admin', 'moderation'],
    async () => {
      const { data } = await api.get<ModerationItem[]>('/api/admin/moderation');
      return data;
    },
    {
      staleTime: 2 * 60_000, // cache for 2m
      retry: 1,
    }
  );
}
