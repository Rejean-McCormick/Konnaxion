// FILE: frontend/modules/global/components/GlobalSearchBar.tsx
// File: modules/global/components/GlobalSearchBar.tsx
'use client'

import React, { useState } from 'react'
import { Input } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'

export function GlobalSearchBar() {
  const [q, setQ] = useState(useSearchParams().get('q') ?? '')
  const router = useRouter()

  const onSearch = (value: string) => {
    if (value.trim()) {
      router.push(`/search?q=${encodeURIComponent(value.trim())}`)
    }
  }

  return (
    <Input.Search
      placeholder="Search…"
      value={q}
      onChange={e => setQ(e.target.value)}
      onSearch={onSearch}
      enterButton
      style={{ maxWidth: 400 }}
    />
  )
}
