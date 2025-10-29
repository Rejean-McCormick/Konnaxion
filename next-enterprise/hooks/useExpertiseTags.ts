"use client";
import { useQuery } from '@tanstack/react-query';
import apiRequest      from '@/services/_request';

export function useExpertiseTags() {
  return useQuery({
    queryKey: ['expertise-tags'],
    queryFn : () => apiRequest('/expertise‑tags')
  });
}
