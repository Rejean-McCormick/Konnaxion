
import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { TopicStub } from "./useTopics";

export interface StanceStats {
  pro: number;
  neutral: number;
  con: number;
}

export interface Argument {
  id: string;
  author: string;
  stance: "pro" | "con";
  body: string;
  created_at: string;
}

export interface TopicDetail {
  topic: TopicStub;
  stances: StanceStats;
  arguments: Argument[];
}

/** Details (stances + arguments) for a single topic. */
export function useTopic(topicId: string, enabled = true) {
  return useQuery<TopicDetail>({
    queryKey: ["ethikos", "topic", topicId],
    queryFn: async () => (await api.get(`/ethikos/topics/${topicId}`)).data,
    enabled,
  });
}
