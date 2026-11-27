'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { DesktopWorkspaceShell } from '@luokui/ui/desktop'
import { templates } from '@luokui/ui/components/workspace/templates/catalog.ts'

const basePath = '/workspace'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname().slice(basePath.length) || '/'
  const router = useRouter()
  return <DesktopWorkspaceShell
    pathname={pathname}
    pageTitle={pathname.startsWith('/templates/') ? templates.find(template => template.href === pathname)?.name : undefined}
    basePath={basePath}
    onNavigate={href => router.push(href === '/' ? basePath : basePath + href)}
  >{children}</DesktopWorkspaceShell>
}
