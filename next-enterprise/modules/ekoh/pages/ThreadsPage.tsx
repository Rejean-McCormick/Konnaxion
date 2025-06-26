"use client";
import { useRef } from "react";
import { Button, Input, message } from "antd";
import MainLayout from "@/shared/layout/MainLayout";
import { useThreads, useCreateThread } from "../hooks/useThreads";
import ThreadList from "../components/ThreadList";
import Recorder from "../components/Recorder";

export default function ThreadsPage() {
  const titleRef = useRef<string>("");
  const { data = [], isLoading } = useThreads();
  const create = useCreateThread();

  const handleSave = (blob: Blob) => {
    if (!titleRef.current) return message.warning("Enter a title first");
    const form = new FormData();
    form.append("title", titleRef.current);
    form.append("file", blob, "note.wav");
    create.mutate(form);
  };

  return (
    <MainLayout>
      <h1 className="mb-6 text-xl font-semibold">Ekoh voice threads</h1>

      <div className="mb-6 flex gap-4">
        <Input
          placeholder="Title"
          className="w-72"
          onChange={(e) => (titleRef.current = e.target.value)}
        />
        <Recorder onFinished={handleSave} />
        <Button loading={create.isLoading} onClick={() => undefined}>
          Upload
        </Button>
      </div>

      {isLoading ? <p>Loading…</p> : <ThreadList data={data} />}
    </MainLayout>
  );
}
