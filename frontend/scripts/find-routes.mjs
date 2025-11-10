// scripts/find-routes.mjs
import { promises as fs } from 'fs'
import path from 'path'

const APP = path.resolve('app')
const out = path.resolve('routes.json')

const isGroup = s => s.startsWith('(') && s.endsWith(')')
const isDyn = s => s.startsWith('[') && s.endsWith(']')
const isTest = s => /(^|\.)(test|spec)(\.|$)/i.test(s)

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return walk(p)
    return p
  }))
  return files.flat()
}

const all = await walk(APP)
const pages = all.filter(f => /[\\/](page\.(tsx|ts|jsx|js))$/.test(f))

const urls = Array.from(new Set(
  pages
    .map(f => {
      const rel = path.relative(APP, f).replace(/\\/g, '/')
      return rel === 'page.tsx' || rel === 'page.ts' ? '/' : '/' + rel.replace(/\/page\.(tsx|ts|jsx|js)$/,'')
    })
    .filter(u => !u.includes('/api/'))
    .filter(u => !u.split('/').some(isGroup))
    .filter(u => !u.split('/').some(isDyn))
    .filter(u => !u.split('/').some(isTest))
)).sort()

await fs.writeFile(out, JSON.stringify(urls, null, 2))
console.log(`found ${urls.length} routes -> routes.json`)
