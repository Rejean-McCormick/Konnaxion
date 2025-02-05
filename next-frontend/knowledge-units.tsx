// pages/knowledge-units.tsx

import { useEffect, useState } from 'react';

type KnowledgeUnit = {
  id: number;
  title: string;
  content: string;
  category: string;
  age_range: string;
  language: string;
};

export default function KnowledgeUnitsPage() {
  const [units, setUnits] = useState<KnowledgeUnit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKnowledgeUnits() {
      try {
        const res = await fetch('/api/konnected/knowledge-units/');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: KnowledgeUnit[] = await res.json();
        setUnits(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchKnowledgeUnits();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Knowledge Units</h1>
      <ul>
        {units.map((unit) => (
          <li key={unit.id}>
            <h2>{unit.title}</h2>
            <p>{unit.content}</p>
            <p>Category: {unit.category}</p>
            <p>Age Range: {unit.age_range}</p>
            <p>Language: {unit.language}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
