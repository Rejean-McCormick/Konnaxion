// FILE: frontend/hooks/useRefreshOnResume.ts
'use client';

import { useEffect, useRef } from 'react';

type RefreshCallback = () => void | Promise<void>;

type UseRefreshOnResumeOptions = {
  enabled?: boolean;
  minIntervalMs?: number;
};

/**
 * Re-run a refresh callback when a suspended/backgrounded browser becomes
 * usable again. This covers the lifecycle events that matter most on mobile:
 * returning to a visible tab, BFCache restoration, and network recovery.
 */
export function useRefreshOnResume(
  refresh: RefreshCallback,
  options: UseRefreshOnResumeOptions = {},
) {
  const { enabled = true, minIntervalMs = 1500 } = options;
  const refreshRef = useRef(refresh);
  const lastRunAtRef = useRef(0);

  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;

    const triggerRefresh = () => {
      if (document.visibilityState === 'hidden') return;

      const now = Date.now();
      if (now - lastRunAtRef.current < minIntervalMs) return;
      lastRunAtRef.current = now;

      try {
        const result = refreshRef.current();
        if (result instanceof Promise) {
          void result.catch(() => undefined);
        }
      } catch {
        // Resume refreshes are best-effort; the owning screen remains
        // responsible for presenting fetch errors to the user.
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') triggerRefresh();
    };

    window.addEventListener('pageshow', triggerRefresh);
    window.addEventListener('online', triggerRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', triggerRefresh);
      window.removeEventListener('online', triggerRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, minIntervalMs]);
}

export default useRefreshOnResume;
