// playwright.ct.config.ts
import { defineConfig, devices } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './ct',
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
