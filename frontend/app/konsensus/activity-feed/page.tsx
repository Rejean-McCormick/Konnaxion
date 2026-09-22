import React, { Suspense } from 'react';

import KonsensusActivityFeedClient from './ActivityFeedClient';

export default function KonsensusActivityFeedPage() {
  return (
    <Suspense fallback={null}>
      <KonsensusActivityFeedClient />
    </Suspense>
  );
}
