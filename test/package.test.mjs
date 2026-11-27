import assert from 'node:assert/strict'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { copyAssets } from '../scripts/copy-assets.mjs'

test('package entry points expose original source modules and built styles', async () => {
  const cssFile = fileURLToPath(import.meta.resolve('@luokui/ui/styles.css'))
  const css = await readFile(cssFile, 'utf8')
  for (const rule of ['--color-background-full', '.dark', '.button-press-motion', 'Inter Variable', '--sidebar-motion-duration', '.sidebar-tool-button']) {
    assert.ok(css.includes(rule), rule)
  }
  for (const url of css.matchAll(/url\(["']?(\.\/files\/[^)'"\s]+)/g)) {
    await access(new URL(url[1], import.meta.resolve('@luokui/ui/styles.css')))
  }
  for (const path of [
    'base/buttons/button.tsx',
    'application/charts/area-chart-card.tsx',
    'application/project-board/ticket-detail-modal.module.css',
    'foundations/direction/direction.tsx',
    'workspace/chrome.tsx',
    'workspace/desktop-shell.tsx',
    'application/multi-agent-chat/group-settings.tsx',
    'base/command-palette/command-palette.tsx'
  ]) {
    await access(new URL(import.meta.resolve(`@luokui/ui/components/${path}`)))
  }
  for (const name of ['desktop', 'sidebar-motion.module.css', 'chat', 'chat-bisheng.css', 'dashboard', 'presentation', 'activity-heatmap', 'activity-heatmap.css']) {
    await access(new URL(import.meta.resolve(`@luokui/ui/${name}`)))
  }
})

test('asset copying preserves host files and supports explicit updates', async () => {
  const output = await mkdtemp(join(tmpdir(), 'luokui-assets-'))
  try {
    await copyAssets(output)
    const image = join(output, 'luokui-ai-logo.png')
    const original = await readFile(new URL(import.meta.resolve('@luokui/ui/assets/luokui-ai-logo.png')))
    assert.deepEqual(await readFile(image), original)
    await copyAssets(output)
    await writeFile(image, 'host file')
    await assert.rejects(copyAssets(output), /Asset already exists/)
    assert.equal(await readFile(image, 'utf8'), 'host file')
    await copyAssets(output, { overwrite: true })
    assert.deepEqual(await readFile(image), original)
  } finally {
    await rm(output, { recursive: true, force: true })
  }
})
