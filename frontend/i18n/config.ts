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
