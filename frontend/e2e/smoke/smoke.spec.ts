// e2e/smoke/smoke.spec.ts
import { test, expect } from '@playwright/test'
import routes from '../../routes.json' assert { type: 'json' }

for (const path of routes as string[]) {
  test(`GET ${path}`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', msg => {
      const t = msg.type()
      if (t === 'error') consoleErrors.push(msg.text())
    })
    const res = await page.goto(path, { waitUntil: 'networkidle' })
    expect(res?.ok(), `HTTP KO ${path} → ${res?.status()}`).toBeTruthy()
    if (process.env.SMOKE_GATE) {
      expect(consoleErrors, `Console errors on ${path}:\n${consoleErrors.join('\n')}`).toHaveLength(0)
    }
  })
}
