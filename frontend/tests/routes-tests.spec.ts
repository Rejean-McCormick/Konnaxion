// FILE: frontend/tests/routes-tests.spec.ts
// tests/routes-tests.spec.ts
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const routes = JSON.parse(
  fs.readFileSync('routes-tests.json', 'utf8')
) as string[];

const outDir = path.join('playwright-report', 'index-test');
const NAV_TMO = Number(process.env.NAV_TMO ?? 45_000);
const toSafe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, '_');

fs.mkdirSync(outDir, { recursive: true });

test.describe('Smoke pages index.test (collect errors)', () => {
  for (const r of routes) {
    test(`GET ${r}`, async ({ page }) => {
      page.setDefaultNavigationTimeout(NAV_TMO);

      let resp: any = null;
      try {
        resp = await page.goto(`http://localhost:3000${r}`, {
          waitUntil: 'domcontentloaded',
          timeout: NAV_TMO,
        });
      } catch {
        // navigation errors handled via response/body inspection below
      }

      const bodyText = await page.evaluate(
        () => document.body?.innerText || '',
      );
      const modNotFound =
        bodyText.match(/Module not found:.*resolve.*\n?.*/i)?.[0] ?? null;
      const buildErr = /Build Error/i.test(bodyText);
      const status = resp?.status?.();

      const base = toSafe(r);
      try {
        await page.screenshot({
          path: path.join(outDir, `${base}.png`),
          fullPage: true,
        });
      } catch {
        // ignore screenshot errors
      }

      fs.writeFileSync(
        path.join(outDir, `${base}.html`),
        await page.content(),
        'utf8',
      );
      fs.appendFileSync(
        path.join(outDir, 'summary.ndjson'),
        JSON.stringify({ route: r, status, buildErr, modNotFound }) + '\n',
      );
    });
  }
});
