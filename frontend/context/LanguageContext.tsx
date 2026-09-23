'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import { useRouter } from 'next/navigation';
import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  isLanguage,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_LOCALES,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from '@/i18n/config';
import enCatalog from '@/i18n/locales/en.json';
import frCatalog from '@/i18n/locales/fr.json';
import {
  createTranslator,
  formatLocalizedDate,
  formatLocalizedList,
  formatLocalizedNumber,
  type TranslateFunction,
} from '@/i18n/runtime';

const catalogs = {
  en: enCatalog,
  fr: frCatalog,
} as const;

type Translate = TranslateFunction;

interface LanguageContextValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translate;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (
    value: Date | number | string,
    options?: Intl.DateTimeFormatOptions,
  ) => string;
  formatList: (values: readonly string[], options?: Intl.ListFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [storageRestored, setStorageRestored] = useState(false);

  useLayoutEffect(() => {
    try {
      const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (isLanguage(saved)) setLanguageState(saved);
    } catch {
      // localStorage can be unavailable in privacy/sandboxed contexts.
    } finally {
      setStorageRestored(true);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    html.lang = LANGUAGE_LOCALES[language];
    html.dataset.language = language;
    dayjs.locale(language);
  }, [language]);

  useEffect(() => {
    if (!storageRestored) return;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Persistence is optional; the in-memory language still works.
    }

    try {
      document.cookie = `${LANGUAGE_COOKIE_KEY}=${language}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
    } catch {
      // Cookie persistence is optional for purely client-rendered surfaces.
    }
  }, [language, storageRestored]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== LANGUAGE_STORAGE_KEY || !isLanguage(event.newValue)) return;
      setLanguageState(event.newValue);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLanguage = useCallback(
    (next: Language) => {
      if (!isLanguage(next) || next === language) return;
      setLanguageState(next);

      try {
        document.cookie = `${LANGUAGE_COOKIE_KEY}=${next}; Path=/; Max-Age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
      } catch {
        // Server-rendered surfaces will keep their previous locale until next navigation.
      }

      // Re-render server components that read the language cookie.
      router.refresh();
    },
    [language, router],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'fr' ? 'en' : 'fr');
  }, [language, setLanguage]);

  const t = useMemo(
    () =>
      createTranslator(
        language,
        catalogs[language],
        catalogs[FALLBACK_LANGUAGE],
      ),
    [language],
  );

  const formatNumber = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      formatLocalizedNumber(language, value, options),
    [language],
  );

  const formatDate = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) =>
      formatLocalizedDate(language, value, options),
    [language],
  );

  const formatList = useCallback(
    (values: readonly string[], options?: Intl.ListFormatOptions) =>
      formatLocalizedList(language, values, options),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      locale: LANGUAGE_LOCALES[language],
      setLanguage,
      toggleLanguage,
      t,
      formatNumber,
      formatDate,
      formatList,
    }),
    [language, setLanguage, toggleLanguage, t, formatNumber, formatDate, formatList],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
