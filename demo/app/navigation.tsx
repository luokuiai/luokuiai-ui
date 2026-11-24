'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { RiArrowDownSLine, RiSearchLine } from '@remixicon/react'
import { Input } from '@luokui/ui'

export type NavigationItem = { id: string; title: string; terms: string }
export type NavigationGroup = { label: string; entries: NavigationItem[] }

export default function Navigation({ sections }: { sections: NavigationGroup[] }) {
  const path = usePathname()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  return <aside className="docs-rail">
    <div className="docs-search"><Input aria-label="搜索组件" placeholder="搜索组件、导出名…" value={query} onChange={setQuery} leadingIcon={RiSearchLine} /></div>
    <nav aria-label="组件目录" className="docs-nav">
      <Link href="/" aria-current={path === '/' ? 'page' : undefined}>开始使用</Link>
      <Link href="/examples" aria-current={path === '/examples' ? 'page' : undefined}>交互示例</Link>
      {sections.map(({ label, entries }) => {
        const visible = needle ? entries.filter(item => item.terms.includes(needle)) : entries
        if (!visible.length) return null
        return <details key={`${label}:${Boolean(needle)}`} open={Boolean(needle) || visible.some(item => path === `/components/${item.id}`) || label === '基础组件'}>
          <summary>{label}<RiArrowDownSLine size={16} aria-hidden /></summary>
          {visible.map(item => <Link key={item.id} href={`/components/${item.id}`} aria-current={path === `/components/${item.id}` ? 'page' : undefined} prefetch={false}>{item.title}</Link>)}
        </details>
      })}
      {needle && !sections.some(group => group.entries.some(item => item.terms.includes(needle))) && <p role="status">没有匹配的组件。</p>}
    </nav>
  </aside>
}
