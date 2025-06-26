'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-1">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search…"
        className="flex-1 px-3 py-1 rounded-l border border-gray-300"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 rounded-r">
        Go
      </button>
    </form>
  );
};

