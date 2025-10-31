#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import pc from 'picocolors'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cwd = process.cwd()

const args = process.argv.slice(2)
const opts = parseArgs(args)

if (!opts.appRoot) opts.appRoot = '.'
const src = p => path.join(__dirname, '..', 'src', p)
const app = p => path.join(cwd, opts.appRoot, p)

if (args[0] !== 'run') {
  usage()
  process.exit(1)
}

try {
  log('> Phase 1: codemods Next router')
  runCodemod('router-push.js', ['**/*.{ts,tsx,js,jsx}'])
  runCodemod('link-as.js', ['**/*.{ts,tsx,js,jsx}'])
  runCodemod('use-router-query.js', ['**/*.{ts,tsx,js,jsx}'])

  log('> Phase 2: AntD v5 open={..}')
  runCodemod('antd-open-prop.js', ['**/*.{ts,tsx,js,jsx}'])

  log('> Phase 3: patch Main layout')
  await import(src('patches/patch-main-layout.js')).then(m =>
    m.default({ appRoot: app(''), siderWidth: +opts.siderWidth || 256, siderCollapsed: +opts.siderCollapsed || 80 })
  )

  log('> Phase 4: créer layout.tsx de segment')
  await import(src('patches/write-layouts.js')).then(m =>
    m.default({ appRoot: app(''), segment: opts.konnectedSegment || 'modules/konnected' })
  )

  log(pc.green('OK'))
} catch (e) {
  console.error(pc.red('Erreur:'), e.message)
  process.exit(1)
}

function runCodemod(transformFile, globs) {
  const tpath = src('codemods/' + transformFile)
  const patterns = []
  for (const g of globs) patterns.push(path.join(cwd, g))
  const jsc = require.resolve('jscodeshift/bin/jscodeshift.cjs')
  execFileSync(process.execPath, [
    jsc,
    '-t', tpath,
    ...patterns,
    '--ignore-pattern', 'node_modules|.next|dist',
    '--parser', 'tsx'
  ], { stdio: 'inherit' })
}

function parseArgs(a) {
  const o = {}
  for (let i=0; i<a.length; i++) {
    const k = a[i]
    const v = a[i+1]
    if (k?.startsWith('--')) { o[k.slice(2).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v; i++ }
  }
  return o
}

function usage() {
  console.log('Usage: konnaxion-fix run --app-root . --konnected-segment modules/konnected --sider-width 256 --sider-collapsed 80')
}

function log(s){ console.log(pc.cyan(s)) }