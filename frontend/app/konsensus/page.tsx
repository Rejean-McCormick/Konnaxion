import { Suspense } from 'react';

import { PollPage } from '@/modules/konsensus/pages';

export default function KonsensusPage() {
  return (
    <Suspense fallback={null}>
      <PollPage />
    </Suspense>
  );
}
