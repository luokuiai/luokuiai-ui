import Link from 'next/link'
import { ThemeToggle } from '@luokui/ui/components/application/theme/theme-toggle.tsx'
import { groups, modules, moduleTitle } from '../catalog'
import Navigation from '../navigation'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const sections = Object.entries(groups).map(([group, label]) => ({
    label,
    entries: modules.filter(item => item.id.startsWith(`${group}/`)).map(item => ({
      id: item.id, title: moduleTitle(item), terms: `${item.id} ${item.exports.map(entry => entry.name).join(' ')}`.toLowerCase()
    }))
  }))
  return <>
    <header className="docs-header">
      <Link href="/" className="docs-brand"><img src="/luokui-ai-logo.png" alt="" width={26} height={26} /> LUOKUI UI</Link>
      <nav aria-label="主要导航"><Link href="/">组件文档</Link><Link href="/examples">交互示例</Link></nav>
      <ThemeToggle appearance="segmented" size="small" />
    </header>
    <div className="docs-layout"><Navigation sections={sections} /><main className="docs-content">{children}</main></div>
  </>
}
