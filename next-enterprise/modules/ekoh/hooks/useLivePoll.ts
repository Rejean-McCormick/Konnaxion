import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";

export interface LivePoll {
  id: string;
  question: string;
  yes: number;
  no: number;
}

export default function useLivePoll() {
  return useQuery<LivePoll, Error>({
    queryKey: ["ekoh-live-poll"],
    queryFn: async () => (await api.get<LivePoll>("/api/ekoh/live-poll")).data,
    staleTime: 30_000,
    retry: 1,
  });
}
