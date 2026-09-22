import { expect, test } from '@playwright/test';

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';

function urlFor(path: string): string {
  return new URL(path, BASE_URL).toString();
}

const cases = [
  ['/ethikos/insights', 'ethiKos'],
  ['/konsensus', 'ethiKos'],
  ['/keenkonnect/dashboard', 'keenKonnect'],
  ['/konnected/dashboard', 'KonnectED'],
  ['/kreative/dashboard', 'Kreative'],
  ['/ekoh/dashboard', 'EkoH'],
  ['/teambuilder', 'Team Builder'],
  ['/reports', 'Insights'],
  ['/kontrol/dashboard', 'KonTrol'],
] as const;

test.describe('global navigation shell', () => {
  for (const [path, label] of cases) {
    test(`${path} resolves to ${label}`, async ({ page }) => {
      const response = await page.goto(urlFor(path), {
        waitUntil: 'domcontentloaded',
      });

      expect(response).not.toBeNull();
      expect(response?.ok()).toBeTruthy();

      await expect(
        page.getByRole('button', { name: new RegExp(`Current space: ${label}`, 'i') }),
      ).toBeVisible();
    });
  }

  test('Konsensus is exposed from ethiKos Decide', async ({ page }) => {
    await page.goto(urlFor('/ethikos/insights?sidebar=ethikos'), {
      waitUntil: 'domcontentloaded',
    });

    await page.getByText('Decide', { exact: true }).click();
    await expect(page.getByRole('link', { name: 'Konsensus' })).toBeVisible();
  });

  test('Insights is not nested under KonTrol', async ({ page }) => {
    await page.goto(urlFor('/kontrol/dashboard?sidebar=kontrol'), {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.getByText('Analytics & Reports')).toHaveCount(0);
  });
});
