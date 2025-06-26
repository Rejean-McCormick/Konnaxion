import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";

export function usePoll(id: string) {
  return useQuery({
    queryKey: ["poll", id],
    queryFn: async () => (await api.get(`/polls/${id}`)).data as Poll,
    staleTime: 60_000,
  });
}

export function useVote(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (choice: number) =>
      api.post(`/polls/${id}/vote`, { choice }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["poll", id] }),
  });
}

type Poll = {
  id: string;
  question: string;
  choices: { label: string; votes: number }[];
};
