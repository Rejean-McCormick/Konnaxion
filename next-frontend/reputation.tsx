// pages/reputation.tsx

import { useEffect, useState } from 'react';

type ReputationProfile = {
  user: string;
  reputation: number;
  ethical_multiplier: number;
  expertise: string[];
};

export default function ReputationPage() {
  const [profile, setProfile] = useState<ReputationProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReputation() {
      try {
        const res = await fetch('/api/ekoh/reputation/');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: ReputationProfile = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchReputation();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Reputation Profile</h1>
      {profile && (
        <div>
          <p>User: {profile.user}</p>
          <p>Reputation: {profile.reputation}</p>
          <p>Ethical Multiplier: {profile.ethical_multiplier}</p>
          <p>Expertise: {profile.expertise.join(', ')}</p>
        </div>
      )}
    </div>
  );
}
