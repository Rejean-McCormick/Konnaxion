"use client";
import dayjs from "dayjs";

import { Thread } from "../hooks/useThreads";

export default function ThreadList({ data }: { data: Thread[] }) {
  return (
    <ul className="space-y-4">
      {data.map((t) => (
        <li key={t.id} className="p-4 bg-white rounded shadow flex items-center gap-4">
          <audio controls src={t.url} className="w-64" />
          <div>
            <p className="font-semibold">{t.title}</p>
            <p className="text-xs text-gray-500">{dayjs(t.created_at).fromNow()}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
