// FILE: frontend/tests/routes-tests.spec.ts
// tests/routes-tests.spec.ts
import { expect, test, type Page, type Response } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { normalizeError } from '../shared/errors';

type IndexSmokeResult = {
  route: string;
  url: string;
  manifest: string;
  status?: number;
  ok: boolean;
  navErr: string | null;
  buildErr: boolean;
  modNotFound: string | null;
  forbiddenDrift: boolean;
};

type LoadedRoutes = {
  filePath: string;
  routes: string[];
};

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000';
const NAV_TMO = Number(process.env.NAV_TMO ?? 45_000);
const GATE =
  process.env.SMOKE_GATE === '1' || process.env.INDEX_SMOKE_GATE === '1';

const outDir = path.join('playwright-report', 'index-test');

const ROUTE_MANIFEST_CANDIDATES = [
  process.env.ROUTES_TESTS_FILE
    ? path.resolve(process.cwd(), process.env.ROUTES_TESTS_FILE)
    : null,
  path.join(process.cwd(), 'routes-tests.json'),
  path.join(process.cwd(), 'routes.json'),
  path.join(process.cwd(), 'routes', 'routes-tests.json'),
  path.join(process.cwd(), 'routes', 'routes.json'),
].filter((candidate): candidate is string => Boolean(candidate));

const FORBIDDEN_KINTSUGI_DRIFT_PREFIXES = [
  '/api/kialo',
  '/api/kintsugi',
  '/api/korum',
  '/api/deliberation',
  '/api/deliberate',
  '/api/home',
  '/kialo',
  '/kintsugi',
  '/korum',
  '/deliberation',
];

function toSafe(value: string): string {
  return value.replace(/[^a-z0-9-_]+/gi, '_');
}

function normalizeRoutePath(routePath: string): string {
  const trimmed = routePath.trim();

  if (!trimmed) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const parsed = new URL(trimmed);
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function loadRoutesFromManifest(filePath: string): string[] {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(parsed)) {
    throw new Error(`Route manifest must be an array: ${filePath}`);
  }

  return Array.from(
    new Set(
      parsed
        .filter(
          (route): route is string =>
            typeof route === 'string' && route.trim().length > 0,
        )
        .map(normalizeRoutePath)
        .filter(Boolean),
    ),
  );
}

function loadRoutes(candidates: string[]): LoadedRoutes {
  const existingManifest = candidates.find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!existingManifest) {
    throw new Error(
      `No route manifest found. Tried: ${candidates.join(', ')}`,
    );
  }

  const routes = loadRoutesFromManifest(existingManifest);

  if (routes.length === 0) {
    throw new Error(`Route manifest contains no routes: ${existingManifest}`);
  }

  return {
    filePath: existingManifest,
    routes,
  };
}

function routeToUrl(routePath: string): string {
  return new URL(routePath, BASE_URL).toString();
}

function routePathname(routePath: string): string {
  return new URL(routePath, BASE_URL).pathname;
}

function isForbiddenKintsugiDrift(routePath: string): boolean {
  const pathname = routePathname(routePath);

  return FORBIDDEN_KINTSUGI_DRIFT_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
}

async function safeBodyText(page: Page): Promise<string> {
  try {
    return await page.evaluate(() => document.body?.innerText || '');
  } catch {
    return '';
  }
}

async function safeContent(page: Page): Promise<string> {
  try {
    return await page.content();
  } catch {
    return '';
  }
}

async function safeScreenshot(page: Page, outputPath: string): Promise<void> {
  try {
    await page.screenshot({
      path: outputPath,
      fullPage: true,
    });
  } catch {
    // Ignore screenshot errors. HTML/NDJSON are still written when available.
  }
}

const loadedRoutes = loadRoutes(ROUTE_MANIFEST_CANDIDATES);
const routes = loadedRoutes.routes;

fs.mkdirSync(outDir, { recursive: true });

test.describe('Smoke pages index.test (collect errors)', () => {
  for (const routePath of routes) {
    test(`GET ${routePath}`, async ({ page }) => {
      page.setDefaultTimeout(NAV_TMO);
      page.setDefaultNavigationTimeout(NAV_TMO);

      const url = routeToUrl(routePath);
      const forbiddenDrift = isForbiddenKintsugiDrift(routePath);

      let resp: Response | null = null;
      let navErr: string | null = null;

      try {
        resp = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: NAV_TMO,
        });
      } catch (error: unknown) {
        const normalized = normalizeError(error);
        navErr = String(normalized.message ?? error);
      }

      const bodyText = await safeBodyText(page);
      const pageHtml = await safeContent(page);

      const modNotFound =
        bodyText.match(/Module not found:.*resolve.*\n?.*/i)?.[0] ?? null;
      const buildErr = /Build Error/i.test(bodyText);
      const status = resp?.status();
      const ok = Boolean(resp?.ok());

      const base = toSafe(routePath);

      await safeScreenshot(page, path.join(outDir, `${base}.png`));

      fs.writeFileSync(path.join(outDir, `${base}.html`), pageHtml, 'utf8');

      const result: IndexSmokeResult = {
        route: routePath,
        url,
        manifest: loadedRoutes.filePath,
        status,
        ok,
        navErr,
        buildErr,
        modNotFound,
        forbiddenDrift,
      };

      fs.appendFileSync(
        path.join(outDir, 'summary.ndjson'),
        `${JSON.stringify(result)}\n`,
      );

      if (GATE) {
        expect(
          forbiddenDrift,
          `forbidden Kintsugi drift route: ${routePath}`,
        ).toBe(false);
        expect(navErr, `navigation error on ${routePath}`).toBeNull();
        expect(ok, `HTTP ${status ?? 'no response'} on ${routePath}`)
          .toBeTruthy();
        expect(buildErr, `Next build error rendered on ${routePath}`).toBe(
          false,
        );
        expect(
          modNotFound,
          `module resolution error on ${routePath}`,
        ).toBeNull();
      }
    });
  }
});