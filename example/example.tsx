import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AppShell, Button, Card, ChartFrame, IconButton, ListSection, Sparkline,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, ThemeScope } from '@luokui/ui'
import { AddIcon, DashboardIcon, SettingsIcon } from '@luokui/ui/icons'
import '@luokui/ui/styles.css'
import { ChatComposerSeat, ChatMessage, ChatShell, ChatTranscript, ChatWelcome } from '@luokui/ui/chat'
import '@luokui/ui/chat.css'
import '@luokui/ui/chat-workbench.css'
import { DashboardCanvas, DashboardGrid, DashboardMetric, DashboardShell, DashboardToolbar } from '@luokui/ui/dashboard'
import '@luokui/ui/dashboard.css'

function DashboardExample() {
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const weekly = period === 'week'
  return <DashboardShell toolbar={<DashboardToolbar heading={<h3>业务概览</h3>} actions={
    <><Button aria-pressed={weekly} onClick={() => setPeriod('week')}>近 7 天</Button>{' '}
      <Button aria-pressed={!weekly} onClick={() => setPeriod('month')}>近 30 天</Button></>
  } />}>
    <DashboardCanvas>
      <DashboardGrid>
        <DashboardMetric label="活跃用户" value={weekly ? '128' : '586'} detail="预览数据" />
        <DashboardMetric label="已完成任务" value={weekly ? '46' : '210'} detail="预览数据" />
        <Card title="访问趋势"><Sparkline label={weekly ? '近 7 天访问趋势' : '近 30 天访问趋势'} values={weekly ? [6, 10, 7, 16, 19] : [12, 18, 24, 20, 34]} /></Card>
      </DashboardGrid>
    </DashboardCanvas>
  </DashboardShell>
}

function ChatExample() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const [workbench, setWorkbench] = useState(true)
  return <ChatShell skin={workbench ? 'workbench' : undefined} header={
    <header className="toolbar"><h3>聊天布局演示</h3>
      <Button aria-pressed={workbench} onClick={() => setWorkbench(value => !value)}>工作台外观</Button>
    </header>
  } composer={
    <ChatComposerSeat>
      <form onSubmit={event => {
        event.preventDefault()
        const text = draft.trim()
        if (!text) return
        setMessages(previous => [...previous, text])
        setDraft('')
      }}>
        <label>消息 <input value={draft} onChange={event => setDraft(event.currentTarget.value)} /></label>{' '}
        <Button type="submit" variant="primary" disabled={!draft.trim()}>发送示例消息</Button>
      </form>
    </ChatComposerSeat>
  }>
    <ChatTranscript role="log" aria-label="演示消息">
      {messages.length === 0 && <ChatWelcome>这是本地演示，不会调用聊天接口。</ChatWelcome>}
      {messages.map((message, index) => <ChatMessage key={index} author="你" side="end">{message}</ChatMessage>)}
    </ChatTranscript>
  </ChatShell>
}

function Example() {
  const [dark, setDark] = useState(false)
  const [count, setCount] = useState(12)
  return <ThemeScope theme={dark ? 'dark' : 'light'}>
    <AppShell sidebarLabel="组件预览" sidebar={<div className="side">
      <strong>LUOKUI UI</strong>
      <Button variant="ghost"><DashboardIcon size={18} aria-hidden="true" />概览</Button>
    </div>} header={<header className="toolbar">
      <h1>组件预览</h1>
      <Button onClick={() => setDark(!dark)} aria-pressed={dark}><SettingsIcon size={18} aria-hidden="true" />深色模式</Button>
    </header>}>
      <main className="cards">
        <Card title="进行中的任务" description="用卡片组合标题、操作和内容" actions={
          <IconButton aria-label="新增任务" variant="primary" onClick={() => setCount(value => value + 1)}><AddIcon /></IconButton>
        } footer="任务总数随操作更新">
          <p className="metric" aria-live="polite">{count}</p>
        </Card>
        <Card title="布局与主题" description="同一组件支持浅色与深色">
          <p>缩窄窗口，侧栏和内容区会切换为上下排列。</p>
        </Card>
        <Card title="列表" description="数据和行操作由调用方提供">
          <ListSection aria-label="待办列表"><ul><li>核对表格数据</li><li>检查趋势图</li></ul></ListSection>
        </Card>
        <Card title="表格" description="原生表格语义，样式可按项目覆盖">
          <Table aria-label="项目状态"><TableHeader><TableRow><TableHead scope="col">项目</TableHead><TableHead scope="col">进度</TableHead></TableRow></TableHeader>
            <TableBody><TableRow><TableCell>组件抽离</TableCell><TableCell>完成</TableCell></TableRow></TableBody></Table>
        </Card>
        <Card title="趋势" description="缺失点不会连线">
          <ChartFrame><Sparkline label="任务趋势：4、8、缺失、6、12、14" values={[4, 8, null, 6, 12, 14]} /></ChartFrame>
        </Card>
        <Card title="聊天" description="界面组件不管理消息和发送逻辑"><ChatExample /></Card>
      </main>
      <DashboardExample />
    </AppShell>
  </ThemeScope>
}

createRoot(document.getElementById('root')!).render(<Example />)
