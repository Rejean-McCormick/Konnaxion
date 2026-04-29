// FILE: frontend/tests/ethikos-wave1-workflow.spec.ts
import { expect, test, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE_URL = process.env.SMOKE_BASE_URL ?? 'http://localhost:3000'
const STRICT_UI = process.env.WAVE1_STRICT_UI === '1'
const WAVE1_TOPIC_ID = process.env.WAVE1_TOPIC_ID
const PAUSE_ON_ERROR = process.env.WAVE1_PAUSE_ON_ERROR === '1'
const outDir = path.join('artifacts', 'kintsugi-wave1-workflow')

const ROUTE_DRIFT_RE =
  /\/api\/(kialo|kintsugi|korum|deliberation|deliberate)\b|\/(kialo|kintsugi|korum|deliberation)\b/i

const RUNTIME_ERROR_RE =
  /Application error|Unhandled Runtime Error|Build Error|Module not found|Cannot read properties of undefined|Cannot read properties of null|Maximum update depth exceeded/i

type Finding = {
  type: string
  message: string
}

function urlFor(route: string): string {
  return new URL(route, BASE_URL).toString()
}

function isAllowedAuthUrl(url: string): boolean {
  return (
    /\/api\/users\/me\/?$/i.test(url) ||
    /\/api\/auth\//i.test(url) ||
    /\/api\/account\//i.test(url)
  )
}

function isIgnorableConsoleError(text: string): boolean {
  return (
    /Failed to load resource: the server responded with a status of (401|403)/i.test(
      text,
    ) ||
    /Warning: \[antd: compatible\] antd v5 support React is 16 ~ 18/i.test(
      text,
    )
  )
}

function isIgnorableRequestFailure(url: string, errorText: string): boolean {
  return /favicon\.ico/i.test(url) || /net::ERR_ABORTED/i.test(errorText)
}

async function safeScreenshot(page: Page, name: string): Promise<void> {
  fs.mkdirSync(outDir, { recursive: true })

  try {
    await page.screenshot({
      path: path.join(outDir, `${name}.png`),
      fullPage: true,
    })
  } catch {
    // Screenshot is best-effort only.
  }
}

async function safeBodyText(page: Page): Promise<string> {
  try {
    return await page.evaluate(() => document.body?.innerText ?? '')
  } catch {
    return ''
  }
}

async function pauseForInspection(
  page: Page,
  route: string,
  reason: string,
  details: unknown,
): Promise<void> {
  if (!PAUSE_ON_ERROR) {
    return
  }

  console.log(`[WAVE1] Pausing on ${reason}: ${route}`)

  if (typeof details === 'string') {
    console.log(details)
  } else {
    console.log(JSON.stringify(details, null, 2))
  }

  await page.pause()
}

async function visitPage(
  page: Page,
  route: string,
  findings: Finding[],
  screenshotName: string,
): Promise<void> {
  const response = await page.goto(urlFor(route), {
    waitUntil: 'domcontentloaded',
    timeout: 45_000,
  })

  expect(response, `No response for ${route}`).not.toBeNull()
  expect(response?.ok(), `HTTP ${response?.status()} on ${route}`).toBeTruthy()

  try {
    await page.waitForLoadState('networkidle', { timeout: 8_000 })
  } catch {
    // Some pages poll or keep requests open.
  }

  const bodyText = await safeBodyText(page)

  if (RUNTIME_ERROR_RE.test(bodyText)) {
    await safeScreenshot(page, `${screenshotName}-runtime-error`)
    await pauseForInspection(page, route, 'runtime/build error', bodyText)

    throw new Error(`Runtime/build error rendered on ${route}`)
  }

  await safeScreenshot(page, screenshotName)

  if (findings.length > 0) {
    await safeScreenshot(page, `${screenshotName}-runtime-findings`)
    await pauseForInspection(page, route, 'runtime findings', findings)
  }

  expect(findings, `Runtime findings on ${route}`).toHaveLength(0)
}

async function clickIfVisible(
  page: Page,
  label: RegExp,
  stepName: string,
  required = false,
): Promise<boolean> {
  const buttons = page.getByRole('button', { name: label })
  const buttonCount = await buttons.count()
  let disabledButtonSeen = false

  for (let index = 0; index < buttonCount; index += 1) {
    const target = buttons.nth(index)

    if (!(await target.isVisible().catch(() => false))) {
      continue
    }

    if (!(await target.isEnabled().catch(() => false))) {
      disabledButtonSeen = true
      continue
    }

    await target.click()
    await page.waitForTimeout(500)
    await safeScreenshot(page, stepName)
    return true
  }

  const links = page.getByRole('link', { name: label })
  const linkCount = await links.count()

  for (let index = 0; index < linkCount; index += 1) {
    const link = links.nth(index)

    if (!(await link.isVisible().catch(() => false))) {
      continue
    }

    await link.click()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(500)
    await safeScreenshot(page, stepName)
    return true
  }

  if (disabledButtonSeen) {
    if (required) {
      throw new Error(`Required UI control is disabled: ${label}`)
    }

    test.info().annotations.push({
      type: 'optional-ui-disabled',
      description: `${stepName}: ${label}`,
    })

    return false
  }

  if (required) {
    throw new Error(`Required UI control not found: ${label}`)
  }

  test.info().annotations.push({
    type: 'optional-ui-missing',
    description: `${stepName}: ${label}`,
  })

  return false
}

async function expectTextVisible(
  page: Page,
  label: RegExp,
  stepName: string,
): Promise<void> {
  await expect(
    page.getByText(label).first(),
    `Expected visible UI text for ${stepName}`,
  ).toBeVisible({ timeout: 5_000 })

  await safeScreenshot(page, stepName)
}

async function findFirstTopicPath(page: Page): Promise<string | null> {
  const links = await page
    .locator('a[href^="/ethikos/deliberate/"], a[href*="/ethikos/deliberate/"]')
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) => {
          const href = anchor.getAttribute('href') ?? ''

          try {
            return new URL(href, window.location.origin).pathname
          } catch {
            return href
          }
        })
        .filter(
          (href) =>
            href.startsWith('/ethikos/deliberate/') &&
            href !== '/ethikos/deliberate/elite' &&
            href !== '/ethikos/deliberate/guidelines' &&
            !href.includes('[topic') &&
            !href.endsWith('/elite') &&
            !href.endsWith('/guidelines'),
        ),
    )

  return links[0] ?? null
}

function configuredTopicPath(): string | null {
  if (!WAVE1_TOPIC_ID) {
    return null
  }

  return `/ethikos/deliberate/${WAVE1_TOPIC_ID}?sidebar=ethikos`
}

test.describe.serial('Kintsugi Wave 1 real UI workflow', () => {
  let findings: Finding[]

  test.beforeEach(async ({ page }) => {
    findings = []

    page.on('console', (message) => {
      if (['error', 'assert'].includes(message.type())) {
        const text = message.text()

        if (/favicon\.ico/i.test(text) || isIgnorableConsoleError(text)) {
          return
        }

        findings.push({
          type: `console:${message.type()}`,
          message: text,
        })
      }
    })

    page.on('pageerror', (error) => {
      findings.push({
        type: 'pageerror',
        message: String(error),
      })
    })

    page.on('requestfailed', (request) => {
      const url = request.url()
      const errorText = request.failure()?.errorText ?? 'unknown failure'

      if (isIgnorableRequestFailure(url, errorText)) {
        return
      }

      findings.push({
        type: 'requestfailed',
        message: `${request.method()} ${url} :: ${errorText}`,
      })
    })

    page.on('response', (response) => {
      const url = response.url()
      const status = response.status()

      if (ROUTE_DRIFT_RE.test(url)) {
        findings.push({
          type: 'route-drift',
          message: `Forbidden Kintsugi route drift: ${url}`,
        })
      }

      if (status >= 500) {
        findings.push({
          type: 'server-error',
          message: `HTTP ${status}: ${url}`,
        })
      }

      if ((status === 401 || status === 403) && !isAllowedAuthUrl(url)) {
        findings.push({
          type: 'unexpected-auth-block',
          message: `HTTP ${status}: ${url}`,
        })
      }
    })
  })

  test('walks the Wave 1 demo interfaces through real UI', async ({ page }) => {
    await visitPage(
      page,
      '/ethikos/deliberate/elite?sidebar=ethikos',
      findings,
      '01-deliberate-elite',
    )

    const topicPath = configuredTopicPath() ?? (await findFirstTopicPath(page))

    if (topicPath) {
      await visitPage(page, topicPath, findings, '02-deliberate-topic')

      await expectTextVisible(
        page,
        /arguments and replies/i,
        '03-topic-argument-thread',
      )

      await clickIfVisible(
        page,
        /view details|viewing details/i,
        '04-topic-select-argument',
        true,
      )

      await expectTextVisible(
        page,
        /selected argument details/i,
        '05-topic-selected-argument-details',
      )

      await expectTextVisible(page, /sources/i, '06-topic-sources-panel')
      await expectTextVisible(page, /impact votes/i, '07-topic-impact-panel')
      await expectTextVisible(page, /suggestions/i, '08-topic-suggestions-panel')
      await expectTextVisible(
        page,
        /discussion visibility/i,
        '09-topic-visibility-panel',
      )
      await expectTextVisible(
        page,
        /participant roles/i,
        '10-topic-participant-roles-panel',
      )

      await clickIfVisible(page, /add/i, '11-topic-sources-open-add-form')
    } else {
      test.info().annotations.push({
        type: 'demo-data-missing',
        description:
          'No real topic link found on /ethikos/deliberate/elite. Topic-specific UI panels were skipped.',
      })

      if (STRICT_UI) {
        throw new Error(
          'WAVE1_STRICT_UI=1 requires at least one real deliberate topic.',
        )
      }
    }

    await visitPage(
      page,
      '/ethikos/decide/public?sidebar=ethikos',
      findings,
      '12-decide-public',
    )

    await clickIfVisible(
      page,
      /submit|vote|participate|decision|continue|review|cast vote/i,
      '13-decide-public-interaction',
    )

    await visitPage(
      page,
      '/ethikos/decide/results?sidebar=ethikos',
      findings,
      '14-decide-results',
    )

    await visitPage(
      page,
      '/ethikos/impact/tracker?sidebar=ethikos',
      findings,
      '15-impact-tracker',
    )

    await clickIfVisible(
      page,
      /details|view|open|feedback|outcome|tracker/i,
      '16-impact-interaction',
    )

    await visitPage(
      page,
      '/ethikos/pulse/live?sidebar=ethikos',
      findings,
      '17-pulse-live',
    )

    await clickIfVisible(
      page,
      /refresh|trend|live|overview|health/i,
      '18-pulse-interaction',
    )

    await visitPage(
      page,
      '/ethikos/trust/profile?sidebar=ethikos',
      findings,
      '19-trust-profile',
    )

    await clickIfVisible(
      page,
      /badge|credential|profile|reputation|trust/i,
      '20-trust-interaction',
    )

    await visitPage(
      page,
      '/ethikos/insights?sidebar=ethikos',
      findings,
      '21-insights',
    )

    await clickIfVisible(
      page,
      /overview|refresh|pulse|impact|results|guides/i,
      '22-insights-interaction',
    )

    expect(findings, 'Workflow runtime findings').toHaveLength(0)
  })
})