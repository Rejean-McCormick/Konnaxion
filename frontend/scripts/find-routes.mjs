import { promises as fs } from 'fs'
import { join, relative } from 'path'

const APP = join(process.cwd(), 'app')
const isGroup = s => /^\(.*\)$/.test(s)
const isDyn = s => /\[.+\]/.test(s)
const isTestSeg = s => s === 'index.test' || s.endsWith('.test')

async function walk(dir, acc = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true })
  for (const e of ents) {
    const p = join(dir, e.name)
    if (e.isDirectory()) await walk(p, acc)
    if (e.isFile() && e.name === 'page.tsx') acc.push(p)
  }
  return acc
}

const files = await walk(APP)
const urls = Array.from(new Set(files.map(f => {
  const rel = relative(APP, f).replace(/\\/g, '/')
  if (rel === 'page.tsx') return '/'                       // corrige /page.tsx → /
  return '/' + rel.replace(/\/page\.tsx$/, '')
})
  .filter(u => !u.includes('/api/'))
  .filter(u => !u.split('/').some(isGroup))
  .filter(u => !u.split('/').some(isDyn))
  .filter(u => !u.split('/').some(isTestSeg))              // exclut index.test
)).sort()

await fs.writeFile('routes.json', JSON.stringify(urls, null, 2))
console.log(`found ${urls.length} routes`)
