import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";

export function useThreads() {
  return useQuery({
    queryKey: ["ekoh-threads"],
    queryFn: async () => (await api.get("/ekoh/threads")).data as Thread[],
    staleTime: 60_000,
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => api.post("/ekoh/threads", form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ekoh-threads"] }),
  });
}

export type Thread = {
  id: string;
  title: string;
  url: string;           // mp3 file
  created_at: string;
};
