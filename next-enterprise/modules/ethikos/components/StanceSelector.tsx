"use client";

import { Radio, message } from "antd";
import { useStances } from "../hooks/useStances";

export default function StanceSelector({
  topicId,
  current,
}: {
  topicId: string;
  current: "pro" | "neutral" | "con";
}) {
  const { mutate, isPending } = useStances(topicId);

  return (
    <Radio.Group
      value={current}
      onChange={(e) =>
        mutate(e.target.value, {
          onSuccess: () => message.success("Stance updated"),
        })
      }
      disabled={false}
    >
      <Radio.Button value="pro">Pro</Radio.Button>
      <Radio.Button value="neutral">Neutral</Radio.Button>
      <Radio.Button value="con">Con</Radio.Button>
    </Radio.Group>
  );
}

