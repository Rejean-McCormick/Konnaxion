import { chromium } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const frontendDir = path.resolve(here, '..')
const repoRoot = path.resolve(frontendDir, '..')
const tourDir = path.join(repoRoot, 'cinematic', 'tours', 'ethikos-v413')
const targetsPath = path.join(tourDir, 'targets.json')
const authPath = path.join(tourDir, 'auth.json')
const outputDir = path.join(tourDir, 'screenshots')

const baseURL = (process.env.ETHIKOS_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const headed = process.env.HEADED === '1'
const keepExisting = process.env.KEEP_SCREENSHOTS === '1'

if (!fs.existsSync(targetsPath)) {
  throw new Error(`targets.json introuvable: ${targetsPath}`)
}

const targetDoc = JSON.parse(fs.readFileSync(targetsPath, 'utf8'))
const targets = targetDoc.targets || {}

function selector(name) {
  const value = targets[name]
  if (!value) throw new Error(`Target inconnu: ${name}`)
  return value
}

async function checkApp() {
  try {
    const res = await fetch(baseURL, { redirect: 'manual' })
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`)
  } catch (err) {
    throw new Error(`Konnaxion n'est pas joignable sur ${baseURL}. Lance le frontend avant ce script.\n${err}`)
  }
}

async function settle(page, ms = 500) {
  await page.waitForTimeout(ms)
  await page.evaluate(() => {
    document.querySelectorAll('[data-cinematic-engine-highlight]').forEach((n) =>
      n.removeAttribute('data-cinematic-engine-highlight'),
    )
  })
  await page.mouse.move(1890, 1040)
  await page.waitForTimeout(120)
}

async function gotoReady(page, url, label) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 })
  await page.locator('body').waitFor({ state: 'visible', timeout: 20_000 })
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {})
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready.catch(() => {})
  })
  await settle(page, 650)

  const bodyText = await page.locator('body').innerText().catch(() => '')
  if (/Application error|Unhandled Runtime Error|Build Error|Module not found/i.test(bodyText)) {
    throw new Error(`${label}: erreur Next/runtime sur ${page.url()}`)
  }
  if (response && response.status() >= 500) {
    throw new Error(`${label}: HTTP ${response.status()} sur ${page.url()}`)
  }
  return response
}

function loc(page, name) {
  return page.locator(selector(name)).first()
}

async function waitVisible(page, name, timeout = 20_000) {
  await loc(page, name).waitFor({ state: 'visible', timeout })
}

async function center(page, name, timeout = 15_000) {
  const item = loc(page, name)
  await item.waitFor({ state: 'visible', timeout })
  await item.evaluate((el) => {
    const rect = el.getBoundingClientRect()
    const y = Math.max(0, window.scrollY + rect.top - (window.innerHeight - rect.height) / 2)
    window.scrollTo({ top: y, behavior: 'instant' })
  })
  await settle(page, 350)
}

async function click(page, name, timeout = 15_000) {
  const item = loc(page, name)
  await item.waitFor({ state: 'visible', timeout })
  await item.click({ timeout })
  await settle(page, 500)
}

const manifest = []
let shotNo = 0

async function shot(page, slug, label, focus = null) {
  if (focus) await center(page, focus)
  else await settle(page)

  shotNo += 1
  const filename = `${String(shotNo).padStart(2, '0')}-${slug}.png`
  const fullPath = path.join(outputDir, filename)

  await page.screenshot({
    path: fullPath,
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    scale: 'css',
  })

  manifest.push({
    order: shotNo,
    file: filename,
    label,
    url: page.url(),
    focus_target: focus,
  })
  console.log(`[${String(shotNo).padStart(2, '0')}] ${label} -> ${filename}`)
}

async function main() {
  await checkApp()

  if (!keepExisting) fs.rmSync(outputDir, { recursive: true, force: true })
  fs.mkdirSync(outputDir, { recursive: true })

  let storageState
  if (fs.existsSync(authPath)) {
    try {
      JSON.parse(fs.readFileSync(authPath, 'utf8'))
      storageState = authPath
      console.log(`Auth: ${authPath}`)
    } catch {
      console.warn(`Auth ignorée: ${authPath} n'est pas un JSON valide.`)
    }
  }

  const browser = await chromium.launch({
    headless: !headed,
    args: ['--force-device-scale-factor=1'],
  })

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    screen: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    storageState,
    colorScheme: 'light',
  })

  const page = await context.newPage()
  page.setDefaultTimeout(15_000)

  try {
    // 1 — ouverture Konnaxion. L'accueil est volontairement non bloquant:
    // son texte a changé plusieurs fois, alors on photographie l'UI rendue telle quelle.
    await gotoReady(page, `${baseURL}/`, 'Accueil Konnaxion')
    const homeFocus = await loc(page, 'konnaxion-home').isVisible().catch(() => false)
      ? 'konnaxion-home'
      : null
    await shot(page, 'konnaxion-home', 'Konnaxion — accueil', homeFocus)

    // 2 — liste des sujets Ethikos
    await gotoReady(page, `${baseURL}/ethikos/deliberate/elite?sidebar=ethikos`, 'Liste Ethikos')
    await waitVisible(page, 'deliberation-list')
    await shot(page, 'ethikos-deliberation-list', 'Ethikos — sujets prêts pour délibération', 'deliberation-list')

    // Le sujet Canada–USA se trouve sur la page suivante dans la démo actuelle.
    const canadaOpen = loc(page, 'canada-topic-open')
    if (!(await canadaOpen.isVisible().catch(() => false))) {
      await center(page, 'deliberation-next-page')
      await click(page, 'deliberation-next-page')
      await waitVisible(page, 'canada-topic-open', 12_000)
    }
    await shot(page, 'canada-us-topic-card', 'Ethikos — sujet Canada–États-Unis', 'canada-topic-open')

    // 3 — thread Canada–USA
    await click(page, 'canada-topic-open')
    await waitVisible(page, 'argument-thread', 20_000)
    await shot(page, 'canada-us-question', 'Délibération — question stratégique Canada–États-Unis', 'canada-topic-question')

    // 4 — séquence arguments / gouvernance
    await shot(page, 'king-klown-proposal', 'Argument — proposition King Klown', 'king-proposal')
    await shot(page, 'rejean-governance-reply', 'Réponse — contrainte de gouvernance de Réjean', 'rejean-reply')
    await shot(page, 'already-announced', 'Réponse — annonce déjà faite', 'already-announced')
    await shot(page, 'ai-infrastructure-announcement', 'Annonce — infrastructure IA', 'big-announcement')
    await shot(page, 'moderation-inquisitor', 'Modération — intervention de l’Inquisitor', 'moderation')

    // 5 — drawer EkoH
    await center(page, 'rejean-ekoh-button')
    await click(page, 'rejean-ekoh-button')
    await waitVisible(page, 'ekoh-drawer')
    await shot(page, 'ekoh-public-rating', 'EkoH — statut public', 'ekoh-public')
    await shot(page, 'ekoh-contextual-alignment', 'EkoH — alignement contextuel', 'ekoh-alignment')
    await shot(page, 'ekoh-domain-expertise', 'EkoH — expertise par domaine', 'ekoh-domains')
    await click(page, 'ekoh-close')

    // 6 — question émergente et conflit
    await shot(page, 'emergent-question', 'Ethikos — question émergente', 'emergent-card')
    await click(page, 'open-emergent')
    await waitVisible(page, 'trump-question', 20_000)
    await shot(page, 'strategic-ai-access-question', 'Question émergente — accès aux services IA stratégiques', 'trump-question')
    await shot(page, 'conflict-disclosure', 'Conflit — déclaration publique', 'conflict-item')

    await click(page, 'conflict-details')
    await waitVisible(page, 'background-context', 12_000)
    await shot(page, 'conflict-background-context', 'Conflit — contexte documentaire', 'background-context')

    const expand = loc(page, 'demo-fiction-expand')
    if (await expand.isVisible().catch(() => false)) {
      await click(page, 'demo-fiction-expand', 8_000)
    }
    if (await loc(page, 'demo-fiction-note').isVisible().catch(() => false)) {
      await shot(page, 'fictional-demo-context', 'Contexte — mention de démonstration fictive', 'demo-fiction-note')
    }

    // 7 — récusation et Smart Vote
    await shot(page, 'voluntary-recusal', 'Récusation volontaire', 'recusal')
    await shot(page, 'smart-vote-panel', 'Smart Vote — panneau de lecture', 'smart-panel')

    await click(page, 'view-readings')
    await waitVisible(page, 'baseline-card', 15_000)
    await shot(page, 'baseline-reading', 'Smart Vote — lecture baseline publique', 'baseline-card')
    await shot(page, 'expertise-reading', 'Smart Vote — lecture pondérée par expertise', 'expertise-card')
    await shot(page, 'expertise-follows-question', 'Smart Vote — expertise pertinente à la question', 'expertise-message')
    await shot(page, 'king-klown-recused', 'Smart Vote — King Klown récusé', 'king-recused')

    // 8 — Pulse
    await gotoReady(page, `${baseURL}/ethikos/pulse/overview?sidebar=ethikos`, 'Pulse Ethikos')
    await waitVisible(page, 'pulse-overview', 15_000)
    await shot(page, 'pulse-overview', 'Ethikos Pulse — vue d’ensemble', 'pulse-overview')

    const manifestPath = path.join(outputDir, '_manifest.json')
    fs.writeFileSync(
      manifestPath,
      JSON.stringify(
        {
          generated_at: new Date().toISOString(),
          base_url: baseURL,
          viewport: '1920x1080',
          capture_mode: 'fullPage',
          count: manifest.length,
          screenshots: manifest,
        },
        null,
        2,
      ) + '\n',
      'utf8',
    )

    console.log(`\nOK — ${manifest.length} screenshots créés dans:`)
    console.log(outputDir)
  } catch (err) {
    const errorPath = path.join(outputDir, '_ERROR.png')
    await page.screenshot({ path: errorPath, fullPage: true, animations: 'disabled', caret: 'hide', scale: 'css' }).catch(() => {})
    console.error(`\nURL au moment de l'échec: ${page.url()}`)
    console.error(`Capture diagnostic: ${errorPath}`)
    throw err
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((err) => {
  console.error('\nECHEC capture Ethikos')
  console.error(err?.stack || err)
  process.exit(1)
})
