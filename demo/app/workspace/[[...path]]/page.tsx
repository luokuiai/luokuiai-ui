import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AgentChat } from '@luokui/ui/components/application/agent-chat/agent-chat.tsx'
import { AiChatShell } from '@luokui/ui/components/application/ai-chat/ai-chat-shell.tsx'
import { AiProfileShell } from '@luokui/ui/components/application/ai-profile/ai-profile-shell.tsx'
import { MultiAgentChat } from '@luokui/ui/components/application/multi-agent-chat/multi-agent-chat.tsx'
import { ProjectBoardShell } from '@luokui/ui/components/application/project-board/project-board-shell.tsx'
import { DashboardShell } from '@luokui/ui/components/application/dashboard/dashboard-shell.tsx'
import { FinanceShell } from '@luokui/ui/components/application/finance/finance-shell.tsx'
import { HrShell } from '@luokui/ui/components/application/hr/hr-shell.tsx'
import { MarketingShell } from '@luokui/ui/components/application/marketing/marketing-shell.tsx'
import { MedicalShell } from '@luokui/ui/components/application/medical/medical-shell.tsx'
import { AdminScreen } from '@luokui/ui/components/workspace/admin/admin-screen.tsx'
import { adminSections } from '@luokui/ui/components/workspace/admin/admin-data.ts'
import { ComponentDirectory } from '@luokui/ui/components/workspace/component-directory.tsx'
import { TemplateFrame, WorkspaceFrame } from '@luokui/ui/components/workspace/chrome.tsx'
import { ChartGallery } from '@luokui/ui/components/workspace/charts/chart-gallery.tsx'
import { IconGallery } from '@luokui/ui/components/workspace/icons/icon-gallery.tsx'
import { IntentLink } from '@luokui/ui/components/workspace/intent-link.tsx'
import { ComponentLab } from '@luokui/ui/components/workspace/lab.tsx'
import { LibraryContent, LibraryHeading } from '@luokui/ui/components/workspace/library-layout.tsx'
import { ModelStatus } from '@luokui/ui/components/workspace/model-status.tsx'
import { WorkspaceOverview } from '@luokui/ui/components/workspace/overview.tsx'
import { WorkspaceSettings } from '@luokui/ui/components/workspace/settings-page.tsx'
import { templates } from '@luokui/ui/components/workspace/templates/catalog.ts'
import { WorkspaceDemoCopy } from '@luokui/ui/components/workspace/templates/demo-copy.tsx'

const businessTemplates = {
  dashboard: DashboardShell, finance: FinanceShell, hr: HrShell,
  marketing: MarketingShell, 'medical-profile': MedicalShell,
}

export const metadata = { title: '桌面工作台' }

export default async function WorkspacePage({ params }: { params: Promise<{ path?: string[] }> }) {
  const segments = (await params).path ?? []
  const route = segments.join('/')
  switch (route) {
    case '': return <WorkspaceOverview />
    case 'chat': return <TemplateFrame route="chat"><AgentChat contained demoOnly onLogout={null} /></TemplateFrame>
    case 'ai-chat': return <TemplateFrame route="code"><AiChatShell contained /></TemplateFrame>
    case 'ai-image-generation': return <TemplateFrame route="image"><AiChatShell contained defaultScenario="image-generation" /></TemplateFrame>
    case 'multi-agent-chat': return <TemplateFrame route="agents"><MultiAgentChat /></TemplateFrame>
    case 'ai-profile': return <TemplateFrame route="profile"><AiProfileShell contained /></TemplateFrame>
    case 'project-board': return <TemplateFrame route="project-board"><ProjectBoardShell contained /></TemplateFrame>
    case 'components': return <ComponentDirectory />
    case 'settings': return <WorkspaceFrame active="settings"><WorkspaceSettings /></WorkspaceFrame>
    case 'lab': return <WorkspaceFrame active="lab"><ComponentLab /></WorkspaceFrame>
    case 'charts': return <WorkspaceFrame active="charts"><LibraryContent><LibraryHeading title="数据图表" /><Suspense><ChartGallery /></Suspense></LibraryContent></WorkspaceFrame>
    case 'icons': return <WorkspaceFrame active="icons"><LibraryContent><LibraryHeading title="图标库" /><IconGallery /></LibraryContent></WorkspaceFrame>
    case 'model': return <WorkspaceFrame active="model"><LibraryContent><LibraryHeading title="模型连接" /><ModelStatus /></LibraryContent></WorkspaceFrame>
    case 'templates': return <WorkspaceFrame active="templates"><LibraryContent>
      <LibraryHeading title="整页模板" />
      {templates.map(template => <IntentLink key={template.slug} href={template.href}>{template.name}</IntentLink>)}
    </LibraryContent></WorkspaceFrame>
    case 'harness': return <WorkspaceFrame active="harness"><LibraryContent>
      <LibraryHeading title="任务执行台" description="任务执行服务由宿主提供。组件示例中可以查看本地运行记录。" />
      <IntentLink href="/admin/runs">查看运行记录</IntentLink>
    </LibraryContent></WorkspaceFrame>
  }
  const section = adminSections.find(entry => entry.href === '/' + route)
  if (section) return <AdminScreen section={section.id} />
  const [group, id] = segments
  if (segments.length === 2 && group === 'templates' && Object.hasOwn(businessTemplates, id)) {
    const Template = businessTemplates[id as keyof typeof businessTemplates]
    return <div data-titlebar-page="template" className="workspace-template flex h-dvh min-h-0 flex-col">
      <WorkspaceDemoCopy><Template contained /></WorkspaceDemoCopy>
    </div>
  }
  notFound()
}
