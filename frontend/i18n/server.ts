import { cookies } from 'next/headers';

import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  isLanguage,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_LOCALES,
} from './config';
import enCatalog from './locales/en.json';
import frCatalog from './locales/fr.json';
import {
  createTranslator,
  formatLocalizedDate,
  formatLocalizedList,
  formatLocalizedNumber,
} from './runtime';

const catalogs = { en: enCatalog, fr: frCatalog } as const;

export async function getServerLanguage() {
  const store = await cookies();
  const value = store.get(LANGUAGE_COOKIE_KEY)?.value;
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export async function getServerI18n() {
  const language = await getServerLanguage();
  const t = createTranslator(
    language,
    catalogs[language],
    catalogs[FALLBACK_LANGUAGE],
  );

  return {
    language,
    locale: LANGUAGE_LOCALES[language],
    t,
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      formatLocalizedNumber(language, value, options),
    formatDate: (
      value: Date | number | string,
      options?: Intl.DateTimeFormatOptions,
    ) => formatLocalizedDate(language, value, options),
    formatList: (values: readonly string[], options?: Intl.ListFormatOptions) =>
      formatLocalizedList(language, values, options),
  };
}
