// app/layout.tsx
import '@/styles/tailwind.css'                // ← global Tailwind + reset AntD
import { ThemeProvider } from '@/context/ThemeContext'
import QueryProvider from '@/shared/QueryProvider'
import "../src/dayjs-setup"
import AuthProvider from './providers/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
