// app/layout.tsx
import '@/styles/tailwind.css';
import { ThemeProvider } from '@/context/ThemeContext';
import QueryProvider from '@/shared/QueryProvider';
import '../src/dayjs-setup';
import AuthProvider from './providers/AuthProvider';
import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Konnaxion',
  description:
    'Konnaxion · Ekoh, Ethikos, KeenKonnect, KonnectED, Kreative – orchestration and collaboration suites.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-neutral-50 antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
