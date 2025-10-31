import fs from 'node:fs'
import path from 'node:path'

export default function run({ appRoot, siderWidth, siderCollapsed }) {
  const candidates = [
    path.join(appRoot, 'components/layout-components/Main.tsx'),
    path.join(appRoot, 'components/layout-components/Main.jsx')
  ]
  const target = candidates.find(f => fs.existsSync(f))
  if (!target) return

  let src = fs.readFileSync(target, 'utf8')
  let orig = src

  // Replace non-existent AntD tokens by valid ones and explicit margins
  src = src
    .replace(/var\(--ant-layout-color-bg-layout\)/g, 'var(--ant-color-bg-layout)')
    .replace(/margin-left:\s*var\(--ant-layout-sider-width\);/g, `margin-left: ${siderWidth}px;`)
    .replace(/margin-left:\s*var\(--ant-layout-sider-collapsed-width\);/g, `margin-left: ${siderCollapsed}px;`)

  // Ensure "collapsed" prop in component signature if missing
  if (!/collapsed:\s*boolean/.test(src) && /export default function Main\(/.test(src)) {
    src = src.replace(/export default function Main\(\{([\s\S]*?)\}\)/,
      "export default function Main({ children, collapsed }: { children: React.ReactNode; collapsed: boolean })")
  }

  if (src !== orig) fs.writeFileSync(target, src, 'utf8')
}