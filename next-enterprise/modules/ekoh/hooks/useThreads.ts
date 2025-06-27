import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";

export interface Thread {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export function useThreads() {
  return useQuery<Thread[], Error>({
    queryKey: ["ekoh-threads"],
    queryFn: async () => (await api.get<Thread[]>("/ekoh/threads")).data,
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

export default useThreads;
