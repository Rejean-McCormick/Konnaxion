"use client";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/shared/layout/MainLayout";
import { usePoll } from "../hooks/usePoll";
import useLivePoll from "../hooks/useLivePoll";
import PollBarChart from "../components/PollBarChart";
import VoteButtons from "../components/VoteButtons";

export default function PollPage() {
  const id = useSearchParams().get("id") ?? "";
  const { data, isLoading } = usePoll(id);
  const live = useLivePoll(id) as typeof data | null;

  const poll = live ?? data;

  if (isLoading || !poll) return <MainLayout><p>Loading…</p></MainLayout>;

  return (
    <MainLayout>
      <h1 className="mb-6 text-xl font-semibold">{poll.question}</h1>
      <PollBarChart
        labels={poll.choices.map((c) => c.label)}
        votes={poll.choices.map((c) => c.votes)}
      />
      <div className="mt-8">
        <VoteButtons
          pollId={poll.id}
          choices={poll.choices.map((c) => c.label)}
        />
      </div>
    </MainLayout>
  );
}
