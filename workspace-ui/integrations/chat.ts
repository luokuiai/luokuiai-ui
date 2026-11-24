'use client'

import { createElement, forwardRef } from 'react'
import type { HTMLAttributes, ReactElement, ReactNode } from 'react'

export interface ChatShellProps extends HTMLAttributes<HTMLDivElement> {
  skin?: 'workbench'
  header?: ReactNode
  sidebar?: ReactNode
  auxiliary?: ReactNode
  composer?: ReactNode
}

/** Slots are presentation only. Keep all session and transport state in the host. */
export const ChatShell = forwardRef<HTMLDivElement, ChatShellProps>(function ChatShell(
  { skin, header, sidebar, auxiliary, composer, children, className = 'lk-chat-shell', ...props }, ref,
) {
  const split = sidebar != null || auxiliary != null
  const root = { ...props, ref, className, 'data-lk-chat-skin': skin }
  if (!split) return createElement('div', root, header, children, composer)
  return createElement('div', root, header,
    createElement('div', { className: 'lk-chat-shell__row' }, sidebar,
      createElement('div', { className: 'lk-chat-shell__main' }, children, composer), auxiliary))
})

export interface ChatRegionProps extends HTMLAttributes<HTMLDivElement> {}

export function ChatTranscript({ className = 'lk-chat-transcript', ...props }: ChatRegionProps): ReactElement {
  return createElement('div', { ...props, className })
}

export function ChatComposerSeat({ className = 'lk-chat-composer-seat', ...props }: ChatRegionProps): ReactElement {
  return createElement('div', { ...props, className })
}

export function ChatWelcome({ className = 'lk-chat-welcome', ...props }: ChatRegionProps): ReactElement {
  return createElement('div', { ...props, className })
}

export interface ChatMessageProps extends HTMLAttributes<HTMLElement> {
  author: ReactNode
  avatar?: ReactNode
  timestamp?: ReactNode
  actions?: ReactNode
  side?: 'start' | 'end'
}

export function ChatMessage({ author, avatar, timestamp, actions, side = 'start', children, className = 'lk-chat-message', ...props }: ChatMessageProps): ReactElement {
  return createElement('article', { ...props, className, 'data-lk-side': side },
    createElement('header', { className: 'lk-chat-message__meta' }, avatar,
      createElement('strong', null, author), timestamp),
    createElement('div', { className: 'lk-chat-message__body' }, children),
    actions == null ? null : createElement('footer', { className: 'lk-chat-message__actions' }, actions),
  )
}
