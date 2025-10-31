import fs from 'node:fs'
import path from 'node:path'

const layoutTpl = `import React from 'react'
import MainLayout from '@/components/layout-components/MainLayout'

export default function SegmentLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>
}
`

export default function run({ appRoot, segment }) {
  const p = path.join(appRoot, segment, 'layout.tsx')
  const dir = path.dirname(p)
  if (!fs.existsSync(dir)) return
  if (!fs.existsSync(p)) fs.writeFileSync(p, layoutTpl, 'utf8')
}