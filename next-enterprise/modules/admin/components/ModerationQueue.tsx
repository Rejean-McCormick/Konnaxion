import React from 'react';
import { useModeration } from '../hooks/useModeration';

export const ModerationQueue: React.FC = () => {
  const { data, isLoading, isError, error } = useModeration();

  if (isLoading) return <div>Loading moderation queue…</div>;
  if (isError) return <div>Error loading queue: {error.message}</div>;

  return (
    <section className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">Moderation Queue</h2>
      <ul className="space-y-4">
        {data.map(item => (
          <li key={item.id} className="border p-3 rounded">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{item.type}</span>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
            <p className="mt-1">By <strong>{item.userId}</strong>: {item.content}</p>
            <p className="mt-1 text-red-600">Reason: {item.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

