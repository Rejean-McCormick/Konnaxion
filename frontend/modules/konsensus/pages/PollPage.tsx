// modules/konsensus/pages/PollPage.tsx
"use client";

import React from "react";
import { Card, Spin, Alert, message } from "antd";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/api";
import { usePoll, DEFAULT_POLL_ID, pollConfig } from "../hooks/usePoll";
import useLivePoll from "../hooks/useLivePoll";
import VoteButtons from "../components/VoteButtons";
import PollBarChart from "../components/PollBarChart";

/**
 * Konsensus Center – Smart‑Vote yes/no poll.
 *
 * Reads aggregated results from /api/votes/ (via usePoll)
 * and posts new votes back to /api/votes/.
 */
export default function PollPage() {
  const pollId = DEFAULT_POLL_ID;
  const cfg = pollConfig[pollId];
  const queryClient = useQueryClient();

  const {
    data: poll,
    isLoading,
    isError,
    error,
  } = usePoll(pollId);

  // Periodically refresh the poll snapshot
  useLivePoll(pollId, 5000);

  const handleVote = async (option: string) => {
    if (!cfg) return;

    const normalized = option.toLowerCase();
    const rawValue = normalized === "yes" ? 1 : -1;

    try {
      await api.post("/api/votes/", {
        target_type: cfg.targetType,
        target_id: cfg.targetId,
        raw_value: rawValue,
        // For now, weighted_value mirrors raw_value.
        // A more advanced Ekoh/EcKo engine can later adjust it server‑side.
        weighted_value: rawValue,
      });

      // Refresh local snapshot
      queryClient.invalidateQueries({ queryKey: ["poll", pollId] });
      message.success("Your vote has been recorded.");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Vote submission failed", e);
      message.error("Unable to record your vote. Please try again.");
    }
  };

  if (isLoading) return <Spin />;
  if (isError)
    return (
      <Alert
        message={
          (error as Error)?.message || "Failed to load the current poll."
        }
        type="error"
      />
    );
  if (!poll) return null;

  return (
    <div className="container mx-auto py-8">
      <Card title="Current Konsensus Poll">
        <h1 className="mb-4 text-xl font-semibold">{poll.question}</h1>

        <div className="mb-4 flex flex-wrap items-baseline gap-4">
          <span>Yes: {poll.yes}</span>
          <span>No: {poll.no}</span>
          <span>Total: {poll.total}</span>
          <span>Support: {poll.supportPercent}%</span>
        </div>

        <div className="mb-6 max-w-md">
          <PollBarChart
            labels={["Yes", "No"]}
            votes={[poll.yes, poll.no]}
          />
        </div>

        <VoteButtons
          pollId={pollId}
          options={["yes", "no"]}
          onVote={handleVote}
        />
      </Card>
    </div>
  );
}
