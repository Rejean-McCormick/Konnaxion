"use client";
import { useRef } from "react";
import { Button, Input, message, Spin } from "antd";
import MainLayout from "@/shared/layout/MainLayout";
import useThreads, { useCreateThread } from "@/modules/ekoh/hooks/useThreads";
import { ThreadList, Recorder } from "@/modules/ekoh/components";

export default function ThreadsPage() {
  const title = useRef<string>("");
  const { data = [], isLoading } = useThreads();
  const create = useCreateThread();

  const handleSave = (blob: Blob) => {
    if (!title.current) return message.warning("Enter a title first");
    const form = new FormData();
    form.append("title", title.current);
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
          onChange={(e) => (title.current = e.target.value)}
        />
        <Recorder onFinished={handleSave} />
        <Button onClick={() => undefined} loading={create.isPending}>
          Upload
        </Button>
      </div>
      {isLoading ? <Spin /> : <ThreadList data={data} />}
    </MainLayout>
  );
}
