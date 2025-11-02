import { promises as fs } from 'fs'
import { join, relative } from 'path'

const APP = join(process.cwd(), 'app')

async function walk(dir, acc = []) {
  const ents = await fs.readdir(dir, { withFileTypes: true })
  for (const e of ents) {
    const p = join(dir, e.name)
    if (e.isDirectory()) await walk(p, acc)
    if (e.isFile() && e.name === 'page.tsx' && p.includes(join('index.test', 'page.tsx'))) {
      acc.push(p)
    }
  }
  return acc
}

const files = await walk(APP)
const urls = Array.from(new Set(files.map(f => {
  const rel = relative(APP, f).replace(/\\/g, '/')
  if (rel === 'page.tsx') return '/'                       // par cohérence
  return '/' + rel.replace(/\/page\.tsx$/, '')
})
  .filter(u => !/\[.+\]/.test(u))                          // exclut dynamiques
)).sort()

await fs.writeFile('routes-tests.json', JSON.stringify(urls, null, 2))
console.log(`found ${urls.length} test routes`)
