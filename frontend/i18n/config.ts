export const LANGUAGE_CODES = ['fr', 'en'] as const;

export type Language = (typeof LANGUAGE_CODES)[number];

export const DEFAULT_LANGUAGE: Language = 'fr';
export const FALLBACK_LANGUAGE: Language = 'en';
export const LANGUAGE_STORAGE_KEY = 'konnaxion.language';
export const LANGUAGE_COOKIE_KEY = 'konnaxion.language';
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LANGUAGE_LOCALES: Record<Language, string> = {
  fr: 'fr-CA',
  en: 'en-CA',
};

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === 'string' &&
    (LANGUAGE_CODES as readonly string[]).includes(value)
  );
}

/**
 * Resolve the best supported UI language from an HTTP Accept-Language header.
 * Explicitly persisted user choices still take precedence elsewhere via cookie/localStorage.
 */
export function detectLanguageFromAcceptLanguage(
  headerValue: string | null | undefined,
): Language | null {
  if (!headerValue) return null;

  const candidates = headerValue
    .split(',')
    .map((entry, index) => {
      const [rawTag = '', ...params] = entry.trim().split(';');
      const tag = rawTag.trim().toLowerCase();
      let quality = 1;

      for (const param of params) {
        const [key, rawValue] = param.trim().split('=');
        if (key?.toLowerCase() !== 'q') continue;
        const parsed = Number(rawValue);
        if (Number.isFinite(parsed)) quality = parsed;
      }

      return { tag, quality, index };
    })
    .filter(({ tag, quality }) => tag.length > 0 && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of candidates) {
    if (tag === '*') continue;
    const primary = tag.split('-')[0];
    if (isLanguage(primary)) return primary;
  }

  return null;
}

