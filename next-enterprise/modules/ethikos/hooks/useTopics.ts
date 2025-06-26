import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";

/** Shallow list item returned by `GET /ethikos/topics` */
export interface TopicStub {
  id: string;
  title: string;
  created_at: string;
  pro_count: number;
  con_count: number;
}

/** Fetch *all* topics for the debates hub. */
export function useTopics() {
  return useQuery<TopicStub[]>({
    queryKey: ["ethikos", "topics"],
    queryFn: async () => (await api.get("/ethikos/topics")).data,
    staleTime: 60_000, // 1 min
  });
}
