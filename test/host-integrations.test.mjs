import assert from 'node:assert/strict'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChatComposerSeat, ChatShell, ChatTranscript } from '@luokui/ui/chat'
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
