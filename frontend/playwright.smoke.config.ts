// playwright.smoke.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  /* Uniquement les tests de routes réelles */
  testMatch: ['routes.spec.ts'],
  testIgnore: [
    '**/_e2e/**',
    '_e2e/**',
    '**/e2e/**',
    'e2e/**',
    '**/*.ct.*'
  ],

  /* Rapports et comportement global */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/playwright-smoke', open: 'never' }]
  ],
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },

  /* Configuration d’exécution */
  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'http://localhost:3000',
    headless: !!process.env.CI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000
  },

  /* Navigateurs cibles */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  /* Répertoire des artefacts */
  outputDir: 'artifacts/playwright-smoke/output'
})
