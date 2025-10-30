"use client";
import React from "react";
import { Card, Spin, Alert } from "antd";
import { usePoll } from "../hooks/usePoll";
import VoteButtons from "../components/VoteButtons";

// Replace with actual poll id logic if dynamic, here we use a fixed id for simplicity
const POLL_ID = "current"; 

export default function PollPage() {
  const { data: poll, isLoading, isError, error } = usePoll(POLL_ID);

  // Example handler
  const handleVote = (option: string) => {
    // TODO: Implement real API call
    console.log("Voted", option, "on poll", poll?.id);
  };

  if (isLoading) return <Spin />;
  if (isError) return <Alert message={error?.message} type="error" />;
  if (!poll) return null;

  return (
    <div className="container mx-auto py-8">
      <Card title="Current Poll">
        <h1 className="mb-6 text-xl font-semibold">{poll.question}</h1>
        <div className="mb-4 flex gap-4">
          <span>Yes: {poll.yes}</span>
          <span>No: {poll.no}</span>
        </div>
        {/* Pass pollId and option labels to VoteButtons */}
        <VoteButtons pollId={poll.id} options={["yes", "no"]} onVote={handleVote} />
      </Card>
    </div>
  );
}
