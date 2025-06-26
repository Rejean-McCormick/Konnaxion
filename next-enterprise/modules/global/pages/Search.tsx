'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '../components/AppShell';
import { useGlobalSearch } from '../hooks/useGlobalSearch';

const SearchPage: React.FC = () => {
  const params = useSearchParams();
  const q = params.get('q') || '';
  const { data, isLoading, isError, error } = useGlobalSearch(q);

  return (
    <AppShell>
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Search Results for “{q}”</h1>
        {isLoading && <div>Searching…</div>}
        {isError && <div>Error: {error.message}</div>}
        {data && (
          <ul className="space-y-4">
            {data.map(item => (
              <li key={item.id}>
                <a href={item.path} className="text-blue-600 underline text-lg">
                  {item.title}
                </a>
                <p className="text-gray-700">{item.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
};

export default SearchPage;

