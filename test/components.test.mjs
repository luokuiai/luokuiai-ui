import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { AppShell, Button, Card, ChartFrame, IconButton, ListSection, Sparkline,
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, ThemeScope } from '../dist/index.js'
import { AddIcon } from '../dist/icons.js'

test('composes a dark shell with caller-provided sidebar, header and card slots', () => {
  const markup = renderToStaticMarkup(h(ThemeScope, { theme: 'dark' },
    h(AppShell, { sidebar: 'Navigation', sidebarLabel: 'Main', header: 'Toolbar' },
      h(Card, { title: 'Usage', headingLevel: 3, actions: 'Refresh', footer: 'Details' }, '12 tasks'))))
  assert.match(markup, /data-lk-theme="dark"/)
  assert.match(markup, /<aside aria-label="Main"[^>]*>Navigation<\/aside>/)
  assert.match(markup, /<h3[^>]*>Usage<\/h3>/)
  assert.match(markup, /lk-card__actions">Refresh/)
  assert.match(markup, /<footer[^>]*>Details<\/footer>/)
  assert.doesNotMatch(renderToStaticMarkup(h(AppShell, null, 'Content')), /<aside|data-lk-sidebar/)
})

test('buttons default to non-submit and expose a labelled decorative glyph', () => {
  assert.match(renderToStaticMarkup(h(Button, { disabled: true }, 'Save')), /<button disabled="" type="button"/)
  const markup = renderToStaticMarkup(h(IconButton, { 'aria-label': 'Add' }, h(AddIcon)))
  assert.match(markup, /<button aria-label="Add"/)
  assert.match(markup, /aria-hidden="true"><svg/)
})

test('consumer CSS uses scoped selectors and does not need a Tailwind pass', async () => {
  const css = await readFile(new URL(import.meta.resolve('@luokui/ui/styles.css')), 'utf8')
  assert.match(css, /prefers-color-scheme: dark/)
  assert.match(css, /max-width: 48rem/)
  assert.match(css, /:focus-visible/)
  assert.doesNotMatch(css, /@theme|@tailwind|@import|:root|(^|\n)body\s*\{/)
})

test('projects a list heading, provided row order and trailing controls without extra wrappers', () => {
  const markup = renderToStaticMarkup(h(ListSection, { 'aria-label': 'History', heading: 'Recent', after: h('button', null, 'More') },
    [h('div', { key: 'b' }, 'B'), h('div', { key: 'a' }, 'A')]))
  assert.equal(markup, '<section aria-label="History"><div>Recent</div><div>B</div><div>A</div><button>More</button></section>')
})

test('renders native table semantics and keeps caller-owned selection metadata', () => {
  const markup = renderToStaticMarkup(h(Table, { wrapperClassName: 'custom' }, h(TableCaption, null, 'Projects'),
    h(TableHeader, null, h(TableRow, null, h(TableHead, { scope: 'col' }, 'Name'))),
    h(TableBody, null, h(TableRow, { 'data-state': 'selected' }, h(TableCell, null, 'Demo')))))
  assert.match(markup, /lk-table-scroll custom.*<caption>Projects<\/caption>.*<th scope="col">Name<\/th>/)
  assert.match(markup, /<tr data-state="selected"><td>Demo<\/td>/)
})

test('chart frame renders a supplied placeholder; sparkline keeps gaps and treats non-finite values as missing', () => {
  assert.equal(renderToStaticMarkup(h(ChartFrame, { placeholder: 'No data' }, 'Chart')), '<div>No data</div>')
  const markup = renderToStaticMarkup(h(Sparkline, { label: 'Trend', values: [1, null, 2, 3, Infinity] }))
  assert.match(markup, /role="img" aria-label="Trend"/)
  assert.match(markup, /d="M[^M]* M[^L]* L/)
  const empty = renderToStaticMarkup(h(Sparkline, { label: 'No trend', values: [null, NaN] }))
  assert.doesNotMatch(empty, /NaN|Infinity|<circle/)
})
