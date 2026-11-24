import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { test } from 'node:test'
import { DashboardCanvas, DashboardGrid, DashboardMetric, DashboardShell, DashboardToolbar } from '../dist/dashboard.js'

test('existing host toolbar and fullscreen canvas keep their element structure and attributes', () => {
  const html = renderToStaticMarkup(h(DashboardShell, { className: 'host-shell', toolbar:
    h(DashboardToolbar, { className: 'host-toolbar', heading: h('h1', null, 'Overview'), actions: h('button', { disabled: true }, 'Publish') }) },
    h(DashboardCanvas, { id: 'view-panne', className: 'host-canvas' }, 'Existing editor')))
  assert.equal(html, '<div class="host-shell"><div class="host-toolbar"><h1>Overview</h1><button disabled="">Publish</button></div><div id="view-panne" class="host-canvas">Existing editor</div></div>')
})

test('standalone grid preserves caller formatting, zero metrics and extra chart content', () => {
  const html = renderToStaticMarkup(h(DashboardGrid, null,
    h(DashboardMetric, { label: 'Processed', value: 0, detail: 'This week' }, h('svg', { 'aria-label': 'Trend' })),
    h(DashboardMetric, { label: 'Latency', value: '24 ms' })))
  assert.match(html, /lk-dashboard-grid.*Processed.*>0<.*This week.*aria-label="Trend".*Latency.*24 ms/)
  assert.equal(html.match(/class="lk-dashboard-metric__detail"/g).length, 1)
})
