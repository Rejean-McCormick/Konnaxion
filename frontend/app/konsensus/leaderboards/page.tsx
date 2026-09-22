import React, { Suspense } from 'react';

import LeaderboardsClient from './LeaderboardsClient';

export default function KonsensusLeaderboardsPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardsClient />
    </Suspense>
  );
}
