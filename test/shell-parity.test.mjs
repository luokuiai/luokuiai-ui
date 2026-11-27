import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { compileFunction } from 'node:vm'
import ts from 'typescript'

// The library ships TypeScript sources. Exercise those same helpers on all supported Node 22 releases.
const file = new URL('../workspace-ui/components/workspace/desktop-navigation.ts', import.meta.url)
const source = readFileSync(file, 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } })
const routing = {}
compileFunction(outputText, ['exports', 'require'], { filename: file.pathname })(routing, createRequire(import.meta.url))
const { logicalHref, workspaceHref } = routing

test('the visible and native link targets round trip with nested pages, queries and fragments', () => {
  for (const [logical, visible] of [
    ['/', '/desk'],
    ['/#stats', '/desk#stats'],
    ['/?theme=dark', '/desk?theme=dark'],
    ['/chat', '/desk/chat'],
    ['/admin/runs?filter=open#row', '/desk/admin/runs?filter=open#row'],
    ['/lab#composer', '/desk/lab#composer'],
    ['/desk-tools', '/desk/desk-tools'],
  ]) {
    assert.equal(workspaceHref(logical, '/desk/'), visible)
    assert.equal(workspaceHref(visible, '/desk/'), visible)
    assert.equal(logicalHref(visible, '/desk/'), logical)
  }
})

test('relative fragments, origin-external links, downloads by URL scheme and unmounted pages keep their targets', () => {
  for (const href of ['#details', '?filter=open', '//example.com/a', 'https://example.com/b', 'mailto:hello@example.com', 'blob:fixture']) {
    assert.equal(workspaceHref(href, '/desk'), href)
  }
  assert.equal(workspaceHref('/components', ''), '/components')
  assert.equal(logicalHref('/desktop-other', '/desk'), '/desktop-other')
})
