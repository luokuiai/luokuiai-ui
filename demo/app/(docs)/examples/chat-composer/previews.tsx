'use client'

import { useEffect, useRef, useState } from 'react'
import { ChatComposer, ChatComposerFrame, ChatReplyLoading, type ChatComposerTag } from '@luokui/ui/chat-composer'
import { ComposerLoader } from '@luokui/ui/components/application/composer-loader/composer-loader.tsx'
import { AgentThinking } from '@luokui/ui/components/application/agent-thinking/agent-thinking.tsx'
import { ModelPicker, type ModelProvider } from '@luokui/ui/components/application/composer-panel/model-picker.tsx'
import { Button } from '@luokui/ui'
import { RiFileLine, RiHammerLine, RiSparklingLine } from '@remixicon/react'

const chatModels = [
  { id: 'deepseek-v4-pro', name: 'DeepSeek V4 Pro' },
  { id: 'qwen4-max', name: 'Qwen4 Max' },
]
const imageModels = [{ id: 'qwen-image', name: 'Qwen 生图' }, { id: 'image-draft', name: '图片草稿' }]
const providers: ModelProvider[] = [
  { id: 'deepseek', name: 'DeepSeek', logo: '/composer-panel/models/deepseek.svg', models: [chatModels[0]] },
  { id: 'qwen', name: 'Qwen', logo: '/composer-panel/models/qwen.svg', models: [chatModels[1]] },
]
const skill: ChatComposerTag = { id: 'skill:report', label: '报告写作', icon: <RiSparklingLine size={15} aria-hidden /> }
const tool: ChatComposerTag = { id: 'tool:search', label: '联网搜索', icon: <RiHammerLine size={15} aria-hidden /> }

function useExampleTurn() {
  const [running, setRunning] = useState(false)
  const [reply, setReply] = useState('')
  const [submitted, setSubmitted] = useState('')
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => {
      setReply(`示例回复已完成。${submitted}`)
      setRunning(false)
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [running, submitted])
  return { running, reply,
    send: ({ text, modelId, tags = [] }: { text: string; modelId?: string; tags?: readonly ChatComposerTag[] }) => {
      setSubmitted([text, modelId, ...tags.map(tag => tag.label)].filter(Boolean).join(' · '))
      setReply('')
      setRunning(true)
    },
    stop: () => { setRunning(false); setReply('已停止。') },
  }
}

function WebChatExample() {
  const [draft, setDraft] = useState('')
  const [tags, setTags] = useState([tool])
  const [model, setModel] = useState(chatModels[0].id)
  const turn = useExampleTurn()
  return <>
    {turn.running ? <ChatReplyLoading label="正在思考" /> : turn.reply && <p>{turn.reply}</p>}
    <ChatComposer value={draft} onChange={setDraft} onSend={turn.send} onStop={turn.stop}
      running={turn.running} placeholder="发消息，或添加工具与技能" inputLabel="聊天消息" sendLabel="发送消息" stopLabel="停止回复"
      tags={tags} onRemoveTag={id => setTags(items => items.filter(item => item.id !== id))}
      removeTagLabel={tag => `移除 ${tag.label}`}
      skillMenu={<details className="docs-composer-skill"><summary aria-label="添加技能">＋</summary><div>
        <Button size="small" onClick={() => setTags(items => items.some(item => item.id === skill.id) ? items : [...items, skill])}>添加报告写作技能</Button>
      </div></details>}
      modelValue={model} modelPicker={<ModelPicker providers={providers} value={model} onChange={setModel} />} />
  </>
}

function ImageExample() {
  const [draft, setDraft] = useState('')
  const [image, setImage] = useState(false)
  const [canvas, setCanvas] = useState('default')
  const turn = useExampleTurn()
  return <>
    {turn.running ? <ChatReplyLoading label="正在生成图像" /> : turn.reply && <p>{turn.reply}</p>}
    <ChatComposer value={draft} onChange={setDraft} onSend={turn.send} onStop={turn.stop} running={turn.running}
      placeholder="描述你想生成的画面" inputLabel="图像提示词" sendLabel="生成图像" stopLabel="停止生成"
      models={imageModels} defaultModel="image-draft" modelLabel="图像模型"
      toolbarAbove={<Button size="small" variant="secondary" onClick={() => setImage(on => !on)}>{image ? '移除参考图' : '添加参考图'}</Button>}
      attachments={image ? <span><RiFileLine size={14} aria-hidden /> reference.png</span> : undefined}
      footerStart={<select aria-label="画板" value={canvas} onChange={event => setCanvas(event.currentTarget.value)}>
        <option value="default">默认画板</option><option value="design">设计画板</option>
      </select>} />
  </>
}

function CodeExample() {
  const [draft, setDraft] = useState('')
  const [readOnly, setReadOnly] = useState(false)
  const turn = useExampleTurn()
  const actionsRef = useRef<HTMLDivElement>(null)
  const send = () => turn.send({ text: draft, modelId: 'workspace' })
  return <>
    {turn.running ? <AgentThinking label="正在准备代码变更" showTimer={false} /> : turn.reply && <p>{turn.reply}</p>}
    <ChatComposerFrame compact running={turn.running} elevated boardUi leadingRef={actionsRef}
      onKeyDownCapture={event => {
        if (event.key !== 'Escape' || !turn.running) return
        turn.stop()
        actionsRef.current?.querySelector('button')?.focus()
      }}
      loadingIndicator={<ComposerLoader active surface={false} radius={24} className="docs-composer-glow">{null}</ComposerLoader>}
      toolbarAbove={<strong>代码仓库 / 当前会话</strong>}
      editor={<textarea className="lk-composer-textarea" rows={1} aria-label="代码任务" placeholder="描述要修改的代码，或输入 @ 引用文件"
        value={draft} onChange={event => setDraft(event.currentTarget.value)} />}
      leadingActions={<Button size="small" variant="secondary" onClick={() => setDraft(text => `${text}@src/main.ts `)}>引用文件</Button>}
      trailingActions={<Button size="small" disabled={!turn.running && !draft.trim()} onClick={turn.running ? turn.stop : send}>{turn.running ? '停止' : '发送'}</Button>}
      footerStart={<label><input type="checkbox" checked={readOnly} onChange={event => setReadOnly(event.currentTarget.checked)} /> 只读权限</label>}
      modelPicker={<span>仓库指定模型</span>} />
  </>
}

function AgentExample() {
  const [draft, setDraft] = useState('')
  const [agent, setAgent] = useState('chief')
  const [model, setModel] = useState(chatModels[0].id)
  const [voice, setVoice] = useState(false)
  const [locked, setLocked] = useState(false)
  const [allowSend, setAllowSend] = useState(true)
  const [animateLoading, setAnimateLoading] = useState(true)
  const [tags, setTags] = useState([skill])
  const turn = useExampleTurn()
  return <>
    {turn.running ? <ChatReplyLoading label="代理正在回复" /> : turn.reply && <p>{turn.reply}</p>}
    <ChatComposer value={draft} onChange={setDraft} onSend={turn.send} onStop={turn.stop} running={turn.running}
      disabled={locked} sendDisabled={!allowSend} animateLoading={animateLoading} className="docs-agent-composer"
      placeholder="给当前代理发消息" inputLabel="代理消息" sendLabel="发送给代理" stopLabel="停止代理"
      toolbarAbove={<div className="docs-actions"><select aria-label="协作代理" value={agent} onChange={event => setAgent(event.currentTarget.value)}>
        <option value="chief">Chief</option><option value="reviewer">Review Agent</option>
      </select>
        <label><input type="checkbox" checked={locked} onChange={event => setLocked(event.currentTarget.checked)} /> 锁定输入</label>
        <label><input type="checkbox" checked={allowSend} onChange={event => setAllowSend(event.currentTarget.checked)} /> 允许发送</label>
        <label><input type="checkbox" checked={animateLoading} onChange={event => setAnimateLoading(event.currentTarget.checked)} /> 运行光带</label>
      </div>}
      models={chatModels} modelValue={model} onModelChange={setModel} modelLabel="代理模型"
      tags={tags} onRemoveTag={id => setTags(items => items.filter(item => item.id !== id))}
      trailingActions={<Button size="small" variant="secondary" disabled={locked} aria-pressed={voice} onClick={() => setVoice(on => !on)}>{voice ? '关闭语音' : '语音'}</Button>}
      footerStart={<span>当前代理：{agent === 'chief' ? 'Chief' : 'Review Agent'}</span>} />
  </>
}

export function ComposerExamples() {
  return <div className="docs-composer-examples">
    <section><h2>AI 对话</h2><WebChatExample /></section>
    <section><h2>图像生成</h2><ImageExample /></section>
    <section><h2>代码工作台</h2><CodeExample /></section>
    <section><h2>多代理协作</h2><AgentExample /></section>
  </div>
}
