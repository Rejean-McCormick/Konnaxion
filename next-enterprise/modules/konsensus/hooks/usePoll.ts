import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";

export function usePoll(id: string) {
  return useQuery({
    queryKey: ["poll", id],
    queryFn: async () => (await api.get(`/api/polls/${id}`)).data,
    staleTime: 30000,
    retry: 1,
  });
}
