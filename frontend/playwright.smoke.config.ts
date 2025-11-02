// playwright.smoke.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  testMatch: ['routes.spec.ts'],          // ← uniquement les pages réelles
  testIgnore: ['**/_e2e/**', '_e2e/**', '**/e2e/**', 'e2e/**'],
  reporter: 'list',
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
})
