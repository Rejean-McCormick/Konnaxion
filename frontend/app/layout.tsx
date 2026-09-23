// FILE: frontend/app/layout.tsx
// app/layout.tsx
import type { Metadata } from 'next';

import '@/styles/tailwind.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { WorldProvider } from '@/context/WorldContext';
import { LANGUAGE_LOCALES } from '@/i18n/config';
import { getServerLanguage } from '@/i18n/server';
import AppFreshnessProvider from '@/shared/AppFreshnessProvider';
import QueryProvider from '@/shared/QueryProvider';

import '../src/dayjs-setup';

export const metadata: Metadata = {
  title: 'Konnaxion',
  description:
    'Konnaxion · EkoH, ethiKos, keenKonnect, KonnectED, Kreative – orchestration and collaboration suites.',
  icons: {
    icon: '/LogoK.svg',
    shortcut: '/LogoK.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = await getServerLanguage();

  return (
    <html lang={LANGUAGE_LOCALES[language]}>
      <body className="min-h-screen bg-neutral-50 antialiased">
        <AppFreshnessProvider>
          <LanguageProvider initialLanguage={language}>
            <ThemeProvider>
              <WorldProvider>
                <QueryProvider>{children}</QueryProvider>
              </WorldProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AppFreshnessProvider>
      </body>
    </html>
  );
}
