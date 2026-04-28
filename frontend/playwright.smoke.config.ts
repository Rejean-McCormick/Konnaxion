// FILE: frontend/playwright.smoke.config.ts
// playwright.smoke.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',

  /*
   * Smoke specs.
   *
   * routes.spec.ts:
   *   Broad route gate generated from routes.json.
   *
   * routes-tests.spec.ts:
   *   Optional index-test collection/audit spec.
   *
   * ethikos-wave1-demo.spec.ts:
   *   Focused Kintsugi Wave 1 demo smoke.
   *
   * ethikos-wave1-workflow.spec.ts:
   *   Real UI workflow for the Kintsugi Wave 1 demo slice.
   */
  testMatch: [
    '**/routes.spec.ts',
    '**/routes-tests.spec.ts',
    '**/ethikos-wave1-demo.spec.ts',
    '**/ethikos-wave1-workflow.spec.ts'
  ],

  testIgnore: [
    '**/_e2e/**',
    '_e2e/**',
    '**/e2e/**',
    'e2e/**',
    '**/*.ct.*'
  ],

  /*
   * Keep the HTML reporter output outside the raw Playwright outputDir.
   * Playwright clears the HTML folder before writing reports, so it must not
   * contain traces/screenshots/videos.
   */
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'artifacts/playwright-smoke-html',
        open: 'never'
      }
    ]
  ],

  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },

  outputDir: 'artifacts/playwright-smoke-output',

  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'http://localhost:3000',
    headless: !!process.env.CI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
})