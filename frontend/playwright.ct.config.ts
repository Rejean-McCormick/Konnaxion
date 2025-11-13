// playwright.ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-react'

export default defineConfig({
  testDir: './ct',
  /* Nom explicite et config du navigateur */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: !!process.env.CI,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure'
      }
    }
  ],

  /* Rapports et tolérances */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/playwright-ct', open: 'never' }]
  ],
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 5_000 },

  /* Répertoires de sortie */
  outputDir: 'artifacts/playwright-ct/output'
})
