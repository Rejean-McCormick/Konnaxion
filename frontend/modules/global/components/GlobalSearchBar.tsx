// FILE: frontend/modules/global/components/GlobalSearchBar.tsx
'use client';

import { Input } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

import { useWorld } from '@/context/WorldContext';

export function GlobalSearchBar() {
  const [q, setQ] = useState(useSearchParams().get('q') ?? '');
  const router = useRouter();
  const { href } = useWorld();

  const onSearch = (value: string) => {
    if (value.trim()) {
      router.push(href(`/search?q=${encodeURIComponent(value.trim())}`));
    }
  };

  return (
    <Input.Search
      placeholder="Search…"
      value={q}
      onChange={(event) => setQ(event.target.value)}
      onSearch={onSearch}
      enterButton
      style={{ maxWidth: 400 }}
    />
  );
}
