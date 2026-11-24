import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const args = process.argv.slice(2)
const check = args[0] === '--check'
if (check) args.shift()
if (args.length !== 1) throw new Error('Usage: pnpm --filter @luokui/ui sync:desktop [--check] <bisheng-desktop>')
const client = resolve(args[0], 'packages/dsh-desktop-client-ui/client.js')
const source = await readFile(client, 'utf8')
const newline = source.includes('\r\n') ? '\r\n' : '\n'
const start = '    // luokui-ui:list-section:start'
const end = '    // luokui-ui:list-section:end'
const block = new RegExp(`${start}\\r?\\n[\\s\\S]*?${end}`, 'g')
if ([...source.matchAll(block)].length !== 1) throw new Error('Expected one desktop list-section seam')
const list = (await readFile(new URL('../dist/list-section.js', import.meta.url), 'utf8'))
  .replace(/^export /mu, '').trimEnd().split('\n').map(line => `    ${line}`).join(newline)
const next = source.replace(block, () => [start, list, end].join(newline))
if (check) {
  if (source !== next) throw new Error(`Out of sync: ${client}`)
} else if (source !== next) {
  await writeFile(client, next)
}
console.log(check ? 'Desktop list snapshot matches LUOKUI UI.' : 'Desktop list snapshot is up to date.')
