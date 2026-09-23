'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslationValues } from '@/i18n/runtime';

export default function TranslatedText({
  id,
  values,
  fallbackText,
}: {
  id: string;
  values?: TranslationValues;
  fallbackText?: string;
}) {
  const { t } = useLanguage();
  return <>{t(id, values, fallbackText)}</>;
}
