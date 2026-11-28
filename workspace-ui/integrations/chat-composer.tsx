'use client'

import { useRef, useState, type KeyboardEvent, type KeyboardEventHandler, type ReactNode, type Ref } from 'react'

export interface ChatComposerFrameProps {
  /** Caller-owned editor, such as a textarea or the Harness session editor. */
  editor: ReactNode
  toolbarAbove?: ReactNode
  attachments?: ReactNode
  leadingActions?: ReactNode
  trailingActions?: ReactNode
  footerStart?: ReactNode
  modelPicker?: ReactNode
  compact?: boolean
  running?: boolean
  animateLoading?: boolean
  /** Override the default animated perimeter. Rendered only while running. */
  loadingIndicator?: ReactNode
  boardUi?: boolean
  elevated?: boolean
  className?: string
  leadingRef?: Ref<HTMLDivElement>
  onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>
}

/** Input layout with an editor, actions and model control supplied by its host. */
export function ChatComposerFrame({ editor, toolbarAbove, attachments, leadingActions, trailingActions, footerStart,
  modelPicker, compact, running = false, animateLoading = true, loadingIndicator, boardUi, elevated, className,
  leadingRef, onKeyDownCapture }: ChatComposerFrameProps) {
  return <div className={['lk-composer-frame', className].filter(Boolean).join(' ')}>
    {toolbarAbove != null && <div className="lk-composer-above">{toolbarAbove}</div>}
    <div className="lk-composer-card" data-compact={compact || undefined} data-elevated={elevated || undefined}
      data-ui-library={boardUi ? 'boardui' : undefined} onKeyDownCapture={onKeyDownCapture}>
      {running && animateLoading && <div className="lk-composer-loading" aria-hidden="true">
        {loadingIndicator ?? <span className="lk-composer-light" />}
      </div>}
      {attachments != null && <div className="lk-composer-attachments">{attachments}</div>}
      <div className="lk-composer-editor">{editor}</div>
      {leadingActions != null && <div className="lk-composer-leading" ref={leadingRef}>{leadingActions}</div>}
      {trailingActions != null && <div className="lk-composer-trailing">{trailingActions}</div>}
    </div>
    {(footerStart != null || modelPicker != null) && <div className="lk-composer-footer">
      {footerStart}
      {modelPicker != null && <div className="lk-composer-model">{modelPicker}</div>}
    </div>}
  </div>
}

export interface ChatComposerTag {
  id: string
  label: string
  icon?: ReactNode
}

export interface ChatComposerProps extends Omit<ChatComposerFrameProps, 'editor' | 'leadingActions' | 'trailingActions' | 'compact'> {
  value: string
  onChange: (value: string) => void
  onSend: (draft: { text: string; modelId?: string; tags: readonly ChatComposerTag[] }) => void
  onStop?: () => void
  placeholder?: string
  inputLabel: string
  sendLabel: string
  stopLabel?: string
  leadingActions?: ReactNode
  /** Caller-rendered skill or resource menu, including its trigger. */
  skillMenu?: ReactNode
  trailingActions?: ReactNode
  tags?: readonly ChatComposerTag[]
  onRemoveTag?: (id: string) => void
  removeTagLabel?: (tag: ChatComposerTag) => string
  disabled?: boolean
  sendDisabled?: boolean
  compact?: boolean
  models?: readonly { id: string; name: string }[]
  modelValue?: string
  defaultModel?: string
  modelLabel?: string
  onModelChange?: (id: string) => void
}

/** Controlled textarea variant. Host owns selected resources and transport. */
export function ChatComposer({ value, onChange, onSend, onStop, placeholder, inputLabel, sendLabel, stopLabel = 'Stop',
  tags = [], onRemoveTag, removeTagLabel, disabled = false, sendDisabled = false, compact = !value.includes('\n'),
  leadingActions, skillMenu, trailingActions, running, attachments, models = [], modelValue, defaultModel,
  modelLabel = 'Model', onModelChange, modelPicker, ...frame }: ChatComposerProps) {
  const [chosenModel, setChosenModel] = useState<string>()
  const requestedModel = modelValue ?? chosenModel ?? defaultModel
  const model = models.find(option => option.id === requestedModel)?.id ?? models[0]?.id ?? requestedModel
  const composing = useRef(false)
  const canSend = !disabled && !sendDisabled && !running && !!value.trim()
  const submit = () => { if (canSend) onSend({ text: value, modelId: model, tags }) }
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.defaultPrevented || composing.current || event.nativeEvent.isComposing || event.keyCode === 229 || disabled) return
    const lastTag = tags.at(-1)
    if (event.key === 'Backspace' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey &&
      event.currentTarget.selectionStart === 0 && event.currentTarget.selectionEnd === 0 && lastTag && onRemoveTag) {
      event.preventDefault()
      onRemoveTag(lastTag.id)
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      if (!event.repeat) submit()
    }
  }
  return <ChatComposerFrame {...frame} compact={compact && attachments == null} running={running} attachments={attachments}
    modelPicker={modelPicker ?? (models.length > 0 ? <select aria-label={modelLabel} value={model} disabled={disabled}
      onChange={event => {
        const id = event.currentTarget.value
        if (modelValue === undefined) setChosenModel(id)
        onModelChange?.(id)
      }}>
        {models.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select> : undefined)}
    editor={<textarea className="lk-composer-textarea" rows={1} value={value} placeholder={placeholder} aria-label={inputLabel}
      disabled={disabled} onChange={event => onChange(event.currentTarget.value)} onKeyDown={onKeyDown}
      onCompositionStart={() => { composing.current = true }} onCompositionEnd={() => { composing.current = false }}
      onBlur={() => { composing.current = false }} />}
    leadingActions={<>{leadingActions}{skillMenu}{tags.length > 0 && <div className="lk-composer-tags">
      {tags.map(tag => onRemoveTag ? <button key={tag.id} type="button" className="lk-composer-tag"
        disabled={disabled} aria-label={removeTagLabel?.(tag) ?? `Remove ${tag.label}`} onClick={() => onRemoveTag(tag.id)}
        onKeyDown={event => {
          if (event.key !== 'Backspace' && event.key !== 'Delete') return
          event.preventDefault()
          event.currentTarget.closest('.lk-composer-card')?.querySelector('textarea')?.focus()
          onRemoveTag(tag.id)
        }}>{tag.icon}{tag.label}</button> : <span key={tag.id} className="lk-composer-tag">{tag.icon}{tag.label}</span>)}
    </div>}</>}
    trailingActions={<>{trailingActions}{running && onStop
      ? <button className="lk-composer-submit" type="button" aria-label={stopLabel} onClick={onStop}><span aria-hidden="true">■</span></button>
      : <button className="lk-composer-submit" type="button" aria-label={sendLabel} disabled={!canSend} onClick={submit}><span aria-hidden="true">↑</span></button>}</>}
  />
}

/** Announce the waiting state once while presenting the shared reply motion. */
export function ChatReplyLoading({ label }: { label: string }) {
  return <span className="lk-composer-reply" role="status"><span className="lk-composer-reply-dots" aria-hidden="true"><i /><i /><i /></span>{label}</span>
}
