import React from 'react';
import { useStats } from '../hooks/useStats';

export const UserStats: React.FC = () => {
  const { data, isLoading, isError, error } = useStats();

  if (isLoading) return <div>Loading statistics…</div>;
  if (isError) return <div>Error loading stats: {error.message}</div>;

  return (
    <section className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-2">User Statistics</h2>
      <ul className="list-disc pl-5">
        <li>Total users: {data.totalUsers}</li>
        <li>Active users: {data.activeUsers}</li>
        {data.newUsers !== undefined && <li>New users (24h): {data.newUsers}</li>}
      </ul>
    </section>
  );
};

