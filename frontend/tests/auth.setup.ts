// FILE: frontend/tests/auth.setup.ts
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('do login', async ({ page }) => {
  const base = process.env.BASE_URL ?? 'http://localhost:3000';

  await page.goto(base + '/login');
  // TODO: perform actual login steps here using page.fill(...) or page.click(...)

  await page.context().storageState({ path: 'storageState.json' });
});

// Make this a valid module:
export {};
