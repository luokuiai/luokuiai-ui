import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChatComposerSeat, ChatShell, ChatTranscript } from '@luokui/ui/chat'
import { ChatComposer, ChatReplyLoading } from '@luokui/ui/chat-composer'
import { ActivityHeatmap } from '@luokui/ui/activity-heatmap'
import { DashboardCanvas, DashboardShell, DashboardToolbar } from '@luokui/ui/dashboard'

test('chat and dashboard preserve host content and layout attributes', () => {
  const chat = renderToStaticMarkup(createElement(ChatShell, { header: 'Heading', className: 'custom-shell' },
    createElement(ChatTranscript, null, 'Host message'), createElement(ChatComposerSeat, null, 'Host composer')))
  assert.match(chat, /class="custom-shell">Heading.*lk-chat-transcript">Host message.*lk-chat-composer-seat">Host composer/)
  const toolbar = createElement(DashboardToolbar, { heading: 'Report', actions: 'Filters' })
  const dashboard = renderToStaticMarkup(createElement(DashboardShell, { toolbar },
    createElement(DashboardCanvas, { id: 'view-panne' }, 'Host chart')))
  assert.match(dashboard, /ReportFilters.*id="view-panne"[^>]*>Host chart/)
})

test('activity heatmap uses the caller’s labels, data and cell renderer', () => {
  const markup = renderToStaticMarkup(createElement(ActivityHeatmap, {
    rows: 2, columns: 2, cells: [{ row: 1, column: 0, messages: 7 }],
    rowLabels: [{ row: 1, label: 'Sunday' }], columnLabels: [{ column: 0, label: 'November' }],
    gridProps: { 'aria-label': 'Message activity' }, getCellKey: cell => String(cell.messages),
    renderCell: cell => createElement('button', { 'data-heat-level': 3 }, cell.messages)
  }))
  assert.match(markup, /November.*Sunday.*aria-label="Message activity".*data-rows="2" data-columns="2"/)
  assert.match(markup, /<li style="grid-row:2;grid-column:1"><button data-heat-level="3">7<\/button>/)
})

test('chat composer renders caller controls and selects a valid default model', () => {
  const props = {
    value: 'Draft', onChange() {}, onSend() {}, inputLabel: 'Prompt', sendLabel: 'Send', placeholder: 'Ask a question',
    models: [{ id: 'first', name: 'First' }, { id: 'second', name: 'Second' }], defaultModel: 'missing',
    skillMenu: createElement('button', { type: 'button' }, 'Skills')
  }
  const idle = renderToStaticMarkup(createElement(ChatComposer, props))
  assert.match(idle, /placeholder="Ask a question"[^>]*>Draft<\/textarea>/)
  assert.match(idle, />Skills<\/button>/)
  assert.match(idle, /<option value="first" selected="">First<\/option>/)
  assert.doesNotMatch(idle, /lk-composer-loading/)

  const running = renderToStaticMarkup(createElement(ChatComposer, {
    ...props, running: true, onStop() {}, modelValue: 'second', modelPicker: createElement('button', null, 'Custom model')
  }))
  assert.match(running, /lk-composer-loading.*lk-composer-light/)
  assert.match(running, /aria-label="Stop".*>Custom model<\/button>/)
  assert.doesNotMatch(running, /<select/)
  assert.match(renderToStaticMarkup(createElement(ChatReplyLoading, { label: 'Thinking' })), /role="status".*Thinking/)
})
