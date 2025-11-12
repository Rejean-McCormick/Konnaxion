// tests/auth.setup.ts
import { test as setup } from '@playwright/test';
setup('do login', async ({ page }) => {
  await page.goto(process.env.BASE_URL! + '/login');
  // …perform login…
  await page.context().storageState({ path: 'storageState.json' });
});

// playwright.config.ts
projects: [
  { name: 'chromium', use: { storageState: 'storageState.json' } },
],
