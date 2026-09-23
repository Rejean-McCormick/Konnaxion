import {
  createTranslator,
  formatLocalizedDate,
  formatLocalizedNumber,
} from '../runtime';

describe('i18n runtime', () => {
  const en = {
    greeting: 'Hello {name}',
    items: { one: '{count} item', other: '{count} items' },
    fallbackOnly: 'English fallback',
  };
  const fr = {
    greeting: 'Bonjour {name}',
    items: { one: '{count} élément', other: '{count} éléments' },
  };

  test('translates and interpolates messages', () => {
    const t = createTranslator('fr', fr, en);
    expect(t('greeting', { name: 'Ada' })).toBe('Bonjour Ada');
  });

  test('uses locale-aware plurals', () => {
    const t = createTranslator('en', en, en);
    expect(t('items', { count: 1 })).toBe('1 item');
    expect(t('items', { count: 3 })).toBe('3 items');
  });

  test('falls back to English then fallback text', () => {
    const t = createTranslator('fr', fr, en);
    expect(t('fallbackOnly')).toBe('English fallback');
    expect(t('missing.key', undefined, 'Readable fallback')).toBe('Readable fallback');
  });

  test('formats Canadian locale numbers and dates', () => {
    expect(formatLocalizedNumber('en', 1234.5)).not.toBe(
      formatLocalizedNumber('fr', 1234.5),
    );
    expect(
      formatLocalizedDate('fr', new Date('2026-09-22T12:00:00Z'), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }),
    ).toContain('2026');
  });
});
