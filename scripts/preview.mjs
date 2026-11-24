import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { build } from 'esbuild'

const root = new URL('../', import.meta.url)
const { outputFiles } = await build({
  absWorkingDir: import.meta.dirname + '/..',
  entryPoints: ['example/example.tsx'],
  outdir: 'preview-dist',
  jsx: 'automatic',
  format: 'esm',
  bundle: true,
  write: false,
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
})
const files = new Map([['/', [await readFile(new URL('example/index.html', root)), 'text/html']]])
for (const file of outputFiles) {
  const name = file.path.split(/[/\\]/).at(-1)
  files.set(`/${name}`, [file.contents, name.endsWith('.css') ? 'text/css' : 'text/javascript'])
}

const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--port')) throw new Error('Usage: preview.mjs [--port <port>]')
const port = Number(args[1] ?? 3211)
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port')
const server = createServer((req, res) => {
  const match = files.get(req.url?.split('?')[0])
  if (!match) { res.writeHead(404).end(); return }
  res.writeHead(200, { 'Content-Type': `${match[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff' })
  res.end(match[0])
})
server.listen(port, '127.0.0.1', () => console.log(`LUOKUI UI preview: http://127.0.0.1:${server.address().port}`))
