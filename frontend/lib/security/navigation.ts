export type ExternalOpenResult = 'opened' | 'cancelled' | 'blocked';

function parseTarget(raw: string): URL | null {
  try {
    return new URL(raw, window.location.origin);
  } catch {
    return null;
  }
}

export function openExternalUrlSafely(raw: string): ExternalOpenResult {
  if (typeof window === 'undefined') return 'blocked';
  const target = parseTarget(raw);
  if (!target) return 'blocked';

  const sameOrigin = target.origin === window.location.origin;
  if (!sameOrigin && target.protocol !== 'https:') return 'blocked';
  if (!['http:', 'https:'].includes(target.protocol)) return 'blocked';
  if (target.username || target.password) return 'blocked';

  if (!sameOrigin) {
    const accepted = window.confirm(
      `You are leaving Konnaxion and opening ${target.hostname}. Continue?`,
    );
    if (!accepted) return 'cancelled';
  }

  window.open(target.toString(), '_blank', 'noopener,noreferrer');
  return 'opened';
}
