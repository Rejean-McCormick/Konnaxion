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
  getUniverseKeyFromPathname,
  getWorldKeyFromPathname,
  stripWorldPrefix,
  switchWorldPath,
  type UniverseSummary,
  type WorldRuntime,
  type WorldSummary,
  withWorldPath,
} from '@/lib/worlds';

const RECENT_WORLDS_KEY = 'konnaxion:recent-worlds';
const MAX_RECENT_WORLDS = 8;

type WorldContextValue = {
  pathname: string;
  appPath: string;
  universeKey: string | null;
  worldKey: string | null;
  runtime: WorldRuntime | null;
  universes: UniverseSummary[];
  worlds: WorldSummary[];
  recentWorldKeys: string[];
  loadingCatalog: boolean;
  loadingRuntime: boolean;
  catalogError: boolean;
  runtimeError: boolean;
  href: (path: string) => string;
  switchUniverse: (key: string) => void;
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

function worldRef(universeKey: string, worldKey: string): string {
  return `${universeKey}/${worldKey}`;
}

function rememberWorld(
  universeKey: string,
  worldKey: string,
  current: string[],
): string[] {
  const key = worldRef(universeKey, worldKey);
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
  const routeUniverseKey = getUniverseKeyFromPathname(pathname);
  const worldKey = getWorldKeyFromPathname(pathname);
  const appPath = stripWorldPrefix(pathname);

  const [runtime, setRuntime] = useState<WorldRuntime | null>(null);
  const [universes, setUniverses] = useState<UniverseSummary[]>([]);
  const [worlds, setWorlds] = useState<WorldSummary[]>([]);
  const [recentWorldKeys, setRecentWorldKeys] = useState<string[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingRuntime, setLoadingRuntime] = useState(Boolean(worldKey));
  const [catalogError, setCatalogError] = useState(false);
  const [runtimeError, setRuntimeError] = useState(false);

  const universeKey = routeUniverseKey ?? runtime?.universe.key ?? null;

  useEffect(() => {
    setRecentWorldKeys(readRecentWorlds());
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingCatalog(true);
    setCatalogError(false);

    void Promise.all([
      api.get<UniverseSummary[]>('control/universes/'),
      api.get<WorldSummary[]>('control/worlds/'),
    ])
      .then(([universeRows, worldRows]) => {
        if (cancelled) return;
        setUniverses(universeRows);
        setWorlds(worldRows);
      })
      .catch(() => {
        if (!cancelled) {
          setUniverses([]);
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
      delete document.documentElement.dataset.kxUniverse;
      delete document.documentElement.dataset.kxWorld;
      delete document.documentElement.dataset.kxWorldReleaseId;
      return;
    }

    let cancelled = false;
    setLoadingRuntime(true);
    setRuntimeError(false);
    if (routeUniverseKey) {
      setRecentWorldKeys((current) =>
        rememberWorld(routeUniverseKey, worldKey, current),
      );
    }

    void api
      .get<WorldRuntime>('runtime/')
      .then((value) => {
        if (cancelled) return;
        setRuntime(value);
        setRecentWorldKeys((current) =>
          rememberWorld(value.universe.key, value.world.key, current),
        );
        document.documentElement.dataset.kxUniverse = value.universe.key;
        document.documentElement.dataset.kxWorld = value.world.key;
        document.documentElement.dataset.kxWorldReleaseId = String(value.release.id);
      })
      .catch(() => {
        if (cancelled) return;
        setRuntime(null);
        setRuntimeError(true);
        if (routeUniverseKey) {
          document.documentElement.dataset.kxUniverse = routeUniverseKey;
        } else {
          delete document.documentElement.dataset.kxUniverse;
        }
        document.documentElement.dataset.kxWorld = worldKey;
        delete document.documentElement.dataset.kxWorldReleaseId;
      })
      .finally(() => {
        if (!cancelled) setLoadingRuntime(false);
      });

    return () => {
      cancelled = true;
    };
  }, [routeUniverseKey, worldKey]);

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
    (path: string) => withWorldPath(path, worldKey, universeKey),
    [universeKey, worldKey],
  );

  const navigate = useCallback((target: string) => {
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    window.location.assign(`${target}${search}${hash}`);
  }, []);

  const switchWorld = useCallback(
    (key: string) => {
      if (key === worldKey) return;
      const targetWorld = worlds.find(
        (world) =>
          world.key === key &&
          (!universeKey || world.universe_key === universeKey),
      );
      if (!targetWorld) return;
      setRecentWorldKeys((current) =>
        rememberWorld(targetWorld.universe_key, key, current),
      );
      navigate(
        switchWorldPath(
          pathname,
          key,
          '/ethikos/insights',
          targetWorld.universe_key,
        ),
      );
    },
    [navigate, pathname, universeKey, worldKey, worlds],
  );

  const switchUniverse = useCallback(
    (key: string) => {
      if (key === universeKey) return;
      const universe = universes.find((item) => item.key === key);
      if (!universe) return;
      const candidates = worlds.filter(
        (world) =>
          world.universe_key === key &&
          world.current_release?.status === 'current' &&
          (world.status === 'active' || world.can_manage),
      );
      const targetWorld =
        candidates.find((world) => world.key === universe.default_world_key) ??
        candidates[0];
      if (!targetWorld) return;
      setRecentWorldKeys((current) =>
        rememberWorld(key, targetWorld.key, current),
      );
      navigate(
        switchWorldPath(
          pathname,
          targetWorld.key,
          '/ethikos/insights',
          key,
        ),
      );
    },
    [navigate, pathname, universeKey, universes, worlds],
  );

  const value = useMemo<WorldContextValue>(
    () => ({
      pathname,
      appPath,
      universeKey,
      worldKey,
      runtime,
      universes,
      worlds,
      recentWorldKeys,
      loadingCatalog,
      loadingRuntime,
      catalogError,
      runtimeError,
      href,
      switchUniverse,
      switchWorld,
    }),
    [
      pathname,
      appPath,
      universeKey,
      worldKey,
      runtime,
      universes,
      worlds,
      recentWorldKeys,
      loadingCatalog,
      loadingRuntime,
      catalogError,
      runtimeError,
      href,
      switchUniverse,
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
