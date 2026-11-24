import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { test } from 'node:test'
import { ChatComposerSeat, ChatMessage, ChatShell, ChatTranscript, ChatWelcome } from '../dist/chat.js'

test('host classes and attributes preserve the flat conversation layout and caller-owned input', () => {
  const html = renderToStaticMarkup(h(ChatShell, { className: 'host-shell', composer: h(ChatComposerSeat, { className: 'host-input' }, h('textarea', { defaultValue: 'draft' })) },
    h(ChatTranscript, { className: 'host-scroll', 'aria-hidden': true }, 'Messages')))
  assert.equal(html, '<div class="host-shell"><div aria-hidden="true" class="host-scroll">Messages</div><div class="host-input"><textarea>draft</textarea></div></div>')
})

test('optional slots preserve ordering and render caller-supplied message and welcome content', () => {
  const html = renderToStaticMarkup(h(ChatShell, { header: 'Header', sidebar: 'History', auxiliary: 'Citations' },
    h(ChatWelcome, null, 'Welcome'),
    h(ChatMessage, { author: 'Assistant', side: 'end', actions: h('button', null, 'Retry') }, h('code', null, 'payload'))))
  assert.match(html, /Header.*History.*Welcome.*data-lk-side="end".*Assistant.*<code>payload<\/code>.*Retry.*Citations/)
})

test('workbench skin is opt-in and portable', async () => {
  assert.match(renderToStaticMarkup(h(ChatShell, { skin: 'workbench' })), /data-lk-chat-skin="workbench"/)
  assert.doesNotMatch(renderToStaticMarkup(h(ChatShell)), /data-lk-chat-skin/)
  const css = await readFile(new URL(import.meta.resolve('@luokui/ui/chat-workbench.css')), 'utf8')
  assert.match(css, /data-lk-chat-skin='workbench'/)
  assert.match(css, /prefers-color-scheme: dark/)
  assert.doesNotMatch(css, /\.dsh-|--dsh-|--luokui-chat-/)
})
