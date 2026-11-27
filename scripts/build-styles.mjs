import { spawnSync } from 'node:child_process'
import { copyFile, cp, mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const cliRoot = dirname(require.resolve('@tailwindcss/cli/package.json'))
const { bin } = require('@tailwindcss/cli/package.json')
await mkdir('dist', { recursive: true })
const result = spawnSync(process.execPath, [join(cliRoot, bin.tailwindcss), '-i', 'workspace-ui/styles/package.css', '-o', 'dist/workspace.css', '--minify'], { stdio: 'inherit' })
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status ?? 1)

const fontRoot = dirname(require.resolve('@fontsource-variable/inter/package.json'))
await cp(join(fontRoot, 'files'), 'dist/files', { recursive: true })

await cp('workspace-ui/public/fonts', 'dist/files', { recursive: true })

await mkdir('dist/integrations', { recursive: true })
await Promise.all(['activity-heatmap.css', 'chat-bisheng.css'].map(file =>
  copyFile(join('workspace-ui/integrations', file), join('dist/integrations', file))))
