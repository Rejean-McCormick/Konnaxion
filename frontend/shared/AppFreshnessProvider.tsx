// FILE: frontend/shared/AppFreshnessProvider.tsx
'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';

import useRefreshOnResume from '@/hooks/useRefreshOnResume';

type VersionResponse = {
  buildId?: unknown;
};

const VERSION_URL = '/_api/version';
const PERIODIC_CHECK_MS = 5 * 60 * 1000;

/**
 * Detects when an already-open browser tab is running an older Next.js build.
 * This is particularly important on mobile, where tabs can remain suspended
 * across deployments and resume without a full navigation.
 */
export default function AppFreshnessProvider({ children }: { children: ReactNode }) {
  const observedBuildIdRef = useRef<string | null>(null);
  const reloadingRef = useRef(false);

  const checkBuildVersion = useCallback(async () => {
    if (reloadingRef.current) return;

    try {
      const response = await fetch(VERSION_URL, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (!response.ok) return;

      const payload = (await response.json()) as VersionResponse;
      const buildId =
        typeof payload.buildId === 'string' && payload.buildId.trim()
          ? payload.buildId.trim()
          : null;

      if (!buildId) return;

      if (observedBuildIdRef.current === null) {
        observedBuildIdRef.current = buildId;
        return;
      }

      if (observedBuildIdRef.current !== buildId) {
        reloadingRef.current = true;
        window.location.reload();
      }
    } catch {
      // A version check must never make the application unusable while the
      // device is offline or the deployment is temporarily unavailable.
    }
  }, []);

  useEffect(() => {
    void checkBuildVersion();

    const intervalId = window.setInterval(() => {
      void checkBuildVersion();
    }, PERIODIC_CHECK_MS);

    return () => window.clearInterval(intervalId);
  }, [checkBuildVersion]);

  useRefreshOnResume(checkBuildVersion, { minIntervalMs: 2000 });

  return children;
}
