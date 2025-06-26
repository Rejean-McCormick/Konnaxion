"use client";
import { Button } from "antd";
import { useVote } from "../hooks/usePoll";

export default function VoteButtons({
  pollId,
  choices,
}: {
  pollId: string;
  choices: string[];
}) {
  const { mutate, isLoading } = useVote(pollId);

  return (
    <div className="flex gap-4 flex-wrap">
      {choices.map((label, idx) => (
        <Button
          key={idx}
          type="primary"
          loading={isLoading}
          onClick={() => mutate(idx)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
