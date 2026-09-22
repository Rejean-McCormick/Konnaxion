'use client';

import { usePathname } from 'next/navigation';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import api from '@/api';
import {
  getWorldKeyFromPathname,
  stripWorldPrefix,
  switchWorldPath,
  type WorldRuntime,
  type WorldSummary,
  withWorldPath,
} from '@/lib/worlds';

const RECENT_WORLDS_KEY = 'konnaxion:recent-worlds';
const MAX_RECENT_WORLDS = 8;

type WorldContextValue = {
  pathname: string;
  appPath: string;
  worldKey: string | null;
  runtime: WorldRuntime | null;
  worlds: WorldSummary[];
  recentWorldKeys: string[];
  loadingCatalog: boolean;
  loadingRuntime: boolean;
  catalogError: boolean;
  runtimeError: boolean;
  href: (path: string) => string;
  switchWorld: (key: string) => void;
};

const WorldContext = createContext<WorldContextValue | null>(null);

function readRecentWorlds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_WORLDS_KEY) ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function rememberWorld(key: string, current: string[]): string[] {
  const next = [key, ...current.filter((item) => item !== key)].slice(
    0,
    MAX_RECENT_WORLDS,
  );
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(RECENT_WORLDS_KEY, JSON.stringify(next));
  }
  return next;
}

export function WorldProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const worldKey = getWorldKeyFromPathname(pathname);
  const appPath = stripWorldPrefix(pathname);

  const [runtime, setRuntime] = useState<WorldRuntime | null>(null);
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [recentWorldKeys, setRecentWorldKeys] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingRuntime, setLoadingRuntime] = useState(Boolean(worldKey));
  const [catalogError, setCatalogError] = useState(false);
  const [runtimeError, setRuntimeError] = useState(false);

  useEffect(() => {
    setRecentWorldKeys(readRecentWorlds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingCatalog(true);
    setCatalogError(false);

    void api
      .get<WorldSummary[]>('control/worlds/')
      .then((rows) => {
        if (!cancelled) setWorlds(rows);
      })
      .catch(() => {
        if (!cancelled) {
          setWorlds([]);
          setCatalogError(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingCatalog(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!worldKey) {
      setRuntime(null);
      setRuntimeError(false);
      setLoadingRuntime(false);
      delete document.documentElement.dataset.kxWorld;
      delete document.documentElement.dataset.kxWorldReleaseId;
      return;
    }

    let cancelled = false;
    setLoadingRuntime(true);
    setRuntimeError(false);
    setRecentWorldKeys((current) => rememberWorld(worldKey, current));

    void api
      .get<WorldRuntime>('runtime/')
      .then((value) => {
        if (cancelled) return;
        setRuntime(value);
        document.documentElement.dataset.kxWorld = value.world.key;
        document.documentElement.dataset.kxWorldReleaseId = String(value.release.id);
      })
      .catch(() => {
        if (cancelled) return;
        setRuntime(null);
        setRuntimeError(true);
        document.documentElement.dataset.kxWorld = worldKey;
        delete document.documentElement.dataset.kxWorldReleaseId;
      })
      .finally(() => {
        if (!cancelled) setLoadingRuntime(false);
      });

    return () => {
      cancelled = true;
    };
  }, [worldKey]);

  useEffect(() => {
    let reloading = false;
    const onReleaseChanged = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    window.addEventListener('konnaxion:world-release-changed', onReleaseChanged);
    return () => {
      window.removeEventListener('konnaxion:world-release-changed', onReleaseChanged);
    };
  }, []);

  const href = useCallback(
    (path: string) => withWorldPath(path, worldKey),
    [worldKey],
  );

  const switchWorld = useCallback(
    (key: string) => {
      if (key === worldKey) return;
      setRecentWorldKeys((current) => rememberWorld(key, current));
      const target = switchWorldPath(pathname, key);
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const hash = typeof window !== 'undefined' ? window.location.hash : '';
      window.location.assign(`${target}${search}${hash}`);
    },
    [pathname, worldKey],
  );

  const value = useMemo<WorldContextValue>(
    () => ({
      pathname,
      appPath,
      worldKey,
      runtime,
      worlds,
      recentWorldKeys,
      loadingCatalog,
      loadingRuntime,
      catalogError,
      runtimeError,
      href,
      switchWorld,
    }),
    [
      pathname,
      appPath,
      worldKey,
      runtime,
      worlds,
      recentWorldKeys,
      loadingCatalog,
      loadingRuntime,
      catalogError,
      runtimeError,
      href,
      switchWorld,
    ],
  );

  return <WorldContext.Provider value={value}>{children}</WorldContext.Provider>;
}

export function useWorld(): WorldContextValue {
  const value = useContext(WorldContext);
  if (!value) {
    throw new Error('useWorld must be used inside WorldProvider.');
  }
  return value;
}
