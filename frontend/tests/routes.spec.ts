import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { normalizeError } from "../shared/errors";

const routes: string[] = JSON.parse(fs.readFileSync('routes.json', 'utf8'))
const GATE = process.env.SMOKE_GATE === '1'
const NAV_TMO = Number(process.env.NAV_TMO ?? 45_000)
const outDir = 'playwright-report'
const toSafe = (s: string) => s.replace(/[^a-z0-9-_]+/gi, '_')

test.describe('Smoke all pages', () => {
  for (const p of routes) {
    test(`GET ${p}`, async ({ page }) => {
      page.setDefaultTimeout(NAV_TMO)
      page.setDefaultNavigationTimeout(NAV_TMO)

      const logs: { type: string; text: string }[] = []
      page.on('console', m => logs.push({ type: m.type(), text: m.text() }))
      page.on('pageerror', e => logs.push({ type: 'pageerror', text: String(e) }))

      let resp: any = null
      let navErr: string | null = null
      try {
        resp = await page.goto(`http://localhost:3000${p}`, { waitUntil: 'domcontentloaded', timeout: NAV_TMO })
      } catch (e: any) {
        const { message, statusCode } = normalizeError(e);
        navErr = String(message ?? e)
      }
      const status = resp?.status()
      const ok = !!resp?.ok()

      const severe = logs.filter(l =>
        ['error', 'assert', 'pageerror'].includes(l.type) && !/favicon\.ico/i.test(l.text)
      )

      fs.mkdirSync(outDir, { recursive: true })
      if (navErr || !ok || severe.length) {
        const base = toSafe(p)
        try { await page.screenshot({ path: path.join(outDir, `smoke_${base}.png`), fullPage: true }) } catch {}
      }
      fs.appendFileSync(path.join(outDir, 'smoke.ndjson'),
        JSON.stringify({ path: p, status, ok, navErr, severe }) + '\n'
      )

      if (GATE) {
        expect(ok, `HTTP ${status} on ${p}`).toBeTruthy()
        expect(severe, `client errors on ${p}`).toHaveLength(0)
      }
    })
  }
})
