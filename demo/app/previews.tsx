'use client'

import { useState, type ComponentType } from 'react'
import { RiAddLine } from '@remixicon/react'
import { Button, Checkbox, Input, Modal, ModalBody, ModalFooter, ModalHeader, Switch } from '@luokui/ui'
import { FREE_COMPONENT_PREVIEWS } from '@luokui/ui/components/application/docs/component-previews-free.tsx'
import type { PreviewHref } from '@luokui/ui/components/application/docs/component-preview-hrefs.ts'
import { AreaChartCard } from '@luokui/ui/components/application/charts/area-chart-card.tsx'
import { BarListCard } from '@luokui/ui/components/application/charts/bar-list-card.tsx'
import { ComboChartCard } from '@luokui/ui/components/application/charts/combo-chart-card.tsx'
import { FunnelChartCard } from '@luokui/ui/components/application/charts/funnel-chart-card.tsx'
import { HeatmapChartCard } from '@luokui/ui/components/application/charts/heatmap-chart-card.tsx'
import { RadarChartCard } from '@luokui/ui/components/application/charts/radar-chart-card.tsx'
import { RadialChartCard } from '@luokui/ui/components/application/charts/radial-chart-card.tsx'
import { SankeyChartCard } from '@luokui/ui/components/application/charts/sankey-chart-card.tsx'
import { ScatterChartCard } from '@luokui/ui/components/application/charts/scatter-chart-card.tsx'
import { StageBarsCard } from '@luokui/ui/components/application/charts/stage-bars-card.tsx'
import { EarningsChartCard } from '@luokui/ui/components/application/dashboard/earnings-chart-card.tsx'
import { LineChartCard } from '@luokui/ui/components/application/dashboard/line-chart-card.tsx'
import { AgentChat } from '@luokui/ui/components/application/agent-chat/agent-chat.tsx'
import { AiChatShell } from '@luokui/ui/components/application/ai-chat/ai-chat-shell.tsx'
import { AiProfileShell } from '@luokui/ui/components/application/ai-profile/ai-profile-shell.tsx'
import { DashboardShell } from '@luokui/ui/components/application/dashboard/dashboard-shell.tsx'
import { FinanceShell } from '@luokui/ui/components/application/finance/finance-shell.tsx'
import { HrShell } from '@luokui/ui/components/application/hr/hr-shell.tsx'
import { MarketingShell } from '@luokui/ui/components/application/marketing/marketing-shell.tsx'
import { MedicalShell } from '@luokui/ui/components/application/medical/medical-shell.tsx'
import { MultiAgentChat } from '@luokui/ui/components/application/multi-agent-chat/multi-agent-chat.tsx'
import { ProjectBoardShell } from '@luokui/ui/components/application/project-board/project-board-shell.tsx'
import { ComponentLab } from '@luokui/ui/components/workspace/lab.tsx'
import { IconGallery } from '@luokui/ui/components/workspace/icons/icon-gallery.tsx'
import { ChartGallery } from '@luokui/ui/components/workspace/charts/chart-gallery.tsx'
import { ModelStatus } from '@luokui/ui/components/workspace/model-status.tsx'
import Code from './code'

function ButtonExample() {
  const [disabled, setDisabled] = useState(false)
  const [count, setCount] = useState(0)
  return <div className="docs-controls">
    <div>{(['primary', 'secondary', 'ghost', 'danger'] as const).map(variant =>
      <Button key={variant} variant={variant} disabled={disabled} onClick={() => setCount(count + 1)}>{variant}</Button>)}</div>
    <div><Button size="small" leadingIcon={RiAddLine} disabled={disabled}>添加</Button><Button size="xs" disabled={disabled}>XS</Button></div>
    <Switch isSelected={disabled} onChange={setDisabled}>禁用按钮</Switch>
    <p role="status">点击次数 {count}</p>
  </div>
}

function InputExample() {
  const [value, setValue] = useState('')
  const invalid = value.length > 0 && value.length < 3
  return <div className="docs-controls">
    <Input label="项目名称" placeholder="输入至少三个字符" value={value} onChange={setValue} isInvalid={invalid} />
    <p role="status">{invalid ? '名称至少需要三个字符。' : value ? `当前值 ${value}` : '等待输入'}</p>
  </div>
}

function ModalExample() {
  const [open, setOpen] = useState(false)
  return <><Button onClick={() => setOpen(true)}>打开对话框</Button>
    <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
      <ModalHeader title="编辑项目" closeLabel="关闭" />
      <ModalBody><Input label="名称" defaultValue="工作台" /></ModalBody>
      <ModalFooter><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button><Button onClick={() => setOpen(false)}>保存</Button></ModalFooter>
    </Modal>
  </>
}

function ImageScenario() {
  return <AiChatShell contained defaultScenario="image-generation" />
}

type Example = { title: string; render: ComponentType; code: string; layout?: 'panel' | 'full' | 'source' }
const practical: Record<string, Example> = {
  'base/buttons/button': { title: '按钮变体和事件', render: ButtonExample, code: `import { useState } from 'react'
import { Button, Switch } from '@luokui/ui'

export function Example() {
  const [disabled, setDisabled] = useState(false)
  const [count, setCount] = useState(0)
  return <>
    <Button disabled={disabled} onClick={() => setCount(n => n + 1)}>
      已点击 {count} 次
    </Button>
    <Switch isSelected={disabled} onChange={setDisabled}>禁用按钮</Switch>
  </>
}` },
  'base/input/input': { title: '受控输入和校验', render: InputExample, code: `import { useState } from 'react'
import { Input } from '@luokui/ui'

export function Example() {
  const [value, setValue] = useState('')
  return <Input label="项目名称" value={value} onChange={setValue}
    isInvalid={value.length > 0 && value.length < 3} />
}` },
  'base/checkbox/checkbox': { title: '默认选中', render: () => <Checkbox defaultSelected>启用通知</Checkbox>, code: `import { Checkbox } from '@luokui/ui'\n\n<Checkbox defaultSelected>启用通知</Checkbox>` },
  'base/modal/modal': { title: '受控对话框', render: ModalExample, code: `import { useState } from 'react'
import { Button, Modal, ModalHeader, ModalBody } from '@luokui/ui'

export function Example() {
  const [open, setOpen] = useState(false)
  return <>
    <Button onClick={() => setOpen(true)}>打开</Button>
    <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
      <ModalHeader title="编辑项目" closeLabel="关闭" />
      <ModalBody>对话框内容</ModalBody>
    </Modal>
  </>
}` }
}

const charts = {
  'application/charts/area-chart-card': ['AreaChartCard', AreaChartCard],
  'application/charts/bar-list-card': ['BarListCard', BarListCard],
  'application/charts/combo-chart-card': ['ComboChartCard', ComboChartCard],
  'application/charts/funnel-chart-card': ['FunnelChartCard', FunnelChartCard],
  'application/charts/heatmap-chart-card': ['HeatmapChartCard', HeatmapChartCard],
  'application/charts/radar-chart-card': ['RadarChartCard', RadarChartCard],
  'application/charts/radial-chart-card': ['RadialChartCard', RadialChartCard],
  'application/charts/sankey-chart-card': ['SankeyChartCard', SankeyChartCard],
  'application/charts/scatter-chart-card': ['ScatterChartCard', ScatterChartCard],
  'application/charts/stage-bars-card': ['StageBarsCard', StageBarsCard],
  'application/dashboard/earnings-chart-card': ['EarningsChartCard', EarningsChartCard],
  'application/dashboard/line-chart-card': ['LineChartCard', LineChartCard]
} satisfies Record<string, [string, ComponentType]>

const templates: Record<string, { name: string; render: ComponentType; attributes?: string }> = {
  'application/agent-chat/agent-chat': { name: 'AgentChat', render: () => <AgentChat contained />, attributes: ' contained' },
  'application/ai-chat/ai-chat-shell': { name: 'AiChatShell', render: () => <AiChatShell contained />, attributes: ' contained' },
  'application/ai-profile/ai-profile-shell': { name: 'AiProfileShell', render: () => <AiProfileShell contained />, attributes: ' contained' },
  'application/dashboard/dashboard-shell': { name: 'DashboardShell', render: () => <DashboardShell contained />, attributes: ' contained' },
  'application/finance/finance-shell': { name: 'FinanceShell', render: () => <FinanceShell contained />, attributes: ' contained' },
  'application/hr/hr-shell': { name: 'HrShell', render: () => <HrShell contained />, attributes: ' contained' },
  'application/marketing/marketing-shell': { name: 'MarketingShell', render: () => <MarketingShell contained />, attributes: ' contained' },
  'application/medical/medical-shell': { name: 'MedicalShell', render: () => <MedicalShell contained />, attributes: ' contained' },
  'application/multi-agent-chat/multi-agent-chat': { name: 'MultiAgentChat', render: MultiAgentChat },
  'application/project-board/project-board-shell': { name: 'ProjectBoardShell', render: () => <ProjectBoardShell contained />, attributes: ' contained' },
  'workspace/lab': { name: 'ComponentLab', render: ComponentLab },
  'workspace/icons/icon-gallery': { name: 'IconGallery', render: IconGallery },
  'workspace/charts/chart-gallery': { name: 'ChartGallery', render: ChartGallery },
  'workspace/model-status': { name: 'ModelStatus', render: ModelStatus }
}

const labDemos: Record<string, string> = {
  'agent-avatar': 'agent-avatar', 'agent-editor': 'agent-creator', 'agent-limits-card': 'agent-limits-card',
  'agent-log': 'agent-log', 'agent-progress': 'agent-progress', 'ai-chat-composer': 'composer',
  'composer-attachments': 'composer-attachments', 'composer-loader': 'composer-loader', 'composer-panel': 'composer-panel',
  'contributions-card': 'contributions-card', 'questionnaire': 'questionnaire', 'task-list': 'task-list', 'web-search': 'web-search'
}

function DemoPanel({ example }: { example: Example }) {
  const [showCode, setShowCode] = useState(false)
  const Preview = example.render
  return <section className="docs-example">
    <div className="docs-example-heading"><h3>{example.title}</h3><Button size="small" variant="ghost" aria-expanded={showCode} onClick={() => setShowCode(!showCode)}>{showCode ? '收起代码' : '查看代码'}</Button></div>
    <div className={example.layout === 'source' ? 'docs-original-preview' : `docs-example-body ${example.layout === 'full' ? 'docs-example-full' : ''}`}><Preview /></div>
    {showCode && <Code>{example.code}</Code>}
  </section>
}

export function ModulePreview({ id, examples, imageScenario }: { id: string; examples: Record<string, string>; imageScenario: boolean }) {
  const slug = id.split('/').at(-1) ?? ''
  const example = practical[id]
  const chart = charts[id as keyof typeof charts]
  const template = id === 'application/ai-chat/ai-chat-shell' && imageScenario
    ? { name: 'AiChatShell', render: ImageScenario, attributes: ' contained defaultScenario="image-generation"' }
    : templates[id]
  const originalKey = `/components/${id === 'application/dashboard/dashboard-sidebar' ? 'sidebar' : slug}` as PreviewHref
  const Original = FREE_COMPONENT_PREVIEWS[originalKey]
  if (example) return <DemoPanel example={example} />
  if (chart || template) {
    const [name, render] = chart ?? [template.name, template.render]
    const attributes = template?.attributes ?? ''
    return <DemoPanel example={{ title: '交互预览', render, layout: template && !id.startsWith('workspace/') ? 'full' : 'panel', code: `import { ${name} } from '@luokui/ui/components/${id}.tsx'\n\n<${name}${attributes} />` }} />
  }
  if (Original && examples[originalKey]) return <DemoPanel example={{ title: '交互预览', render: Original, layout: 'source', code: examples[originalKey] }} />
  if (labDemos[slug]) return <p><a href={`/examples#${labDemos[slug]}`}>在交互示例中试用此组件</a></p>
  return null
}

export function FeaturedExamples() {
  return <>{Object.entries(practical).map(([id, example]) => <DemoPanel key={id} example={example} />)}</>
}
