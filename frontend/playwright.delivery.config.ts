// FILE: frontend/playwright.delivery.config.ts
import { defineConfig, devices } from '@playwright/test'

const AUTH_STATE =
  process.env.PLAYWRIGHT_AUTH_STATE ?? 'storageState.delivery.json'

// auth.setup.ts reads the same environment variable inside the setup worker.
// Set it here so direct Playwright invocations and package scripts stay coherent.
process.env.PLAYWRIGHT_AUTH_STATE = AUTH_STATE

const testIgnore = [
  '**/_e2e/**',
  '_e2e/**',
  '**/e2e/**',
  'e2e/**',
  '**/*.ct.*',
]

export default defineConfig({
  testDir: './tests',
  testIgnore,

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'artifacts/playwright-delivery-html',
        open: 'never',
      },
    ],
  ],

  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 180_000,
  expect: { timeout: 15_000 },

  outputDir: 'artifacts/playwright-delivery-output',

  use: {
    baseURL: process.env.SMOKE_BASE_URL || 'http://localhost:3000',
    headless: !!process.env.CI,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'setup',
      testMatch: ['**/auth.setup.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ethikos-delivery',
      dependencies: ['setup'],
      testMatch: ['**/ethikos-delivery-workflow.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_STATE,
      },
    },
  ],
})
