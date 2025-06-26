
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";

/**
 * Cast or update the current user’s stance on a topic.
 * `stance` must be "pro" | "neutral" | "con".
 */
export function useStances(topicId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (stance: "pro" | "neutral" | "con") =>
      api.post(`/ethikos/topics/${topicId}/stances`, { stance }),
    onSuccess: () => {
      // refresh both the topic detail & global list
      qc.invalidateQueries({ queryKey: ["ethikos", "topic", topicId] });
      qc.invalidateQueries({ queryKey: ["ethikos", "topics"] });
    },
  });
}
