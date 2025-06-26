# Test info

- Name: has title
- Location: C:\MonCode\KonnaxionV14\next-enterprise\e2e\example.spec.ts:3:5

# Error details

```
Error: browserType.launch: Executable doesn't exist at C:\Users\kingk\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
╔═════════════════════════════════════════════════════════════════════════╗
║ Looks like Playwright Test or Playwright was just installed or updated. ║
║ Please run the following command to download new browsers:              ║
║                                                                         ║
║     pnpm exec playwright install                                        ║
║                                                                         ║
║ <3 Playwright Team                                                      ║
╚═════════════════════════════════════════════════════════════════════════╝
```

# Test source

```ts
  1 | import { expect, test } from "@playwright/test"
  2 |
> 3 | test("has title", async ({ page }) => {
    |     ^ Error: browserType.launch: Executable doesn't exist at C:\Users\kingk\AppData\Local\ms-playwright\webkit-2158\Playwright.exe
  4 |   await page.goto("./")
  5 |
  6 |   await expect(page).toHaveTitle(/Next.js Enterprise Boilerplate/)
  7 | })
  8 |
```