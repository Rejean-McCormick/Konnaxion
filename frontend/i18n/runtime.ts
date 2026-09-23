import type { Language } from './config';
import { LANGUAGE_LOCALES } from './config';

export type TranslationPrimitive = string | number | boolean | Date | null | undefined;
export type TranslationValues = Record<string, TranslationPrimitive>;
export type TranslationCatalog = Record<string, unknown>;
export type TranslateFunction = (
  key: string,
  values?: TranslationValues,
  fallbackText?: string,
) => string;

function getAtPath(catalog: TranslationCatalog, key: string): unknown {
  return key.split('.').reduce<unknown>((current, part) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, catalog);
}

function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;

  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, token: string) => {
    const value = values[token];
    if (value === undefined || value === null) return match;
    if (value instanceof Date) return value.toISOString();
    return String(value);
  });
}

function resolveNode(
  node: unknown,
  language: Language,
  values?: TranslationValues,
): string | undefined {
  if (typeof node === 'string') return interpolate(node, values);

  const count = values?.count;
  if (
    typeof count === 'number' &&
    node &&
    typeof node === 'object' &&
    !Array.isArray(node)
  ) {
    const pluralMap = node as Record<string, unknown>;
    const category = new Intl.PluralRules(LANGUAGE_LOCALES[language]).select(count);
    const candidate = pluralMap[category] ?? pluralMap.other;
    if (typeof candidate === 'string') return interpolate(candidate, values);
  }

  return undefined;
}

export function createTranslator(
  language: Language,
  catalog: TranslationCatalog,
  fallbackCatalog: TranslationCatalog,
): TranslateFunction {
  return (
    key: string,
    values?: TranslationValues,
    fallbackText?: string,
  ): string => {
    const localized = resolveNode(getAtPath(catalog, key), language, values);
    if (localized !== undefined) return localized;

    const fallback = resolveNode(getAtPath(fallbackCatalog, key), 'en', values);
    if (fallback !== undefined) return fallback;

    return fallbackText ?? key;
  };
}

export function formatLocalizedNumber(
  language: Language,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(LANGUAGE_LOCALES[language], options).format(value);
}

export function formatLocalizedDate(
  language: Language,
  value: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LANGUAGE_LOCALES[language], options).format(date);
}

export function formatLocalizedList(
  language: Language,
  values: readonly string[],
  options?: Intl.ListFormatOptions,
): string {
  return new Intl.ListFormat(LANGUAGE_LOCALES[language], options).format(values);
}
