import { notFound, redirect } from 'next/navigation'

const shortcuts = new Map([
  ['chat', '/components/application/agent-chat/agent-chat'],
  ['ai-chat', '/components/application/ai-chat/ai-chat-shell'],
  ['ai-image-generation', '/components/application/ai-chat/ai-chat-shell?scenario=image-generation'],
  ['ai-profile', '/components/application/ai-profile/ai-profile-shell'],
  ['multi-agent-chat', '/components/application/multi-agent-chat/multi-agent-chat'],
  ['project-board', '/components/application/project-board/project-board-shell'],
  ['settings', '/components/application/settings/settings-modal'],
  ['icons', '/components/workspace/icons/icon-gallery'],
  ['charts', '/components/workspace/charts/chart-gallery'],
  ['lab', '/examples'],
  ['model', '/components/workspace/model-status'],
  ['templates/dashboard', '/components/application/dashboard/dashboard-shell'],
  ['templates/finance', '/components/application/finance/finance-shell'],
  ['templates/hr', '/components/application/hr/hr-shell'],
  ['templates/marketing', '/components/application/marketing/marketing-shell'],
  ['templates/medical-profile', '/components/application/medical/medical-shell']
])

export default async function Shortcut({ params }: { params: Promise<{ shortcut: string[] }> }) {
  const target = shortcuts.get((await params).shortcut.join('/'))
  if (!target) notFound()
  redirect(target)
}
