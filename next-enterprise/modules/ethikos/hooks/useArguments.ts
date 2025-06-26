import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import type { Argument } from "./useTopic";

/** Post a new argument to a topic. */
export function useCreateArgument(topicId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: Pick<Argument, "stance" | "body">) =>
      api.post(`/ethikos/topics/${topicId}/arguments`, payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["ethikos", "topic", topicId] }),
  });
}

