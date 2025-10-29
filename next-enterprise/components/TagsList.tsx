// frontend/components/TagsList.tsx
'use client' 
import React from "react";
import { useExpertiseTags } from "../hooks/useExpertiseTags";

export default function TagsList() {
  const { data, isLoading, error } = useExpertiseTags();

  if (isLoading) return <p>Loading…</p>;
  if (error)     return <p>Error loading tags</p>;

  return (
    <ul>
      {data.map((tag: { id: number; name: string }) => (
        <li key={tag.id}>{tag.name}</li>
      ))}
    </ul>
  );
}
