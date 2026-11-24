#!/usr/bin/env node
import { mkdir, readdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(new URL('../workspace-ui/public/', import.meta.url))

export async function copyAssets(destination, { overwrite = false } = {}) {
  const files = await readdir(source, { recursive: true, withFileTypes: true })
  for (const entry of files) {
    if (!entry.isFile()) continue
    const original = join(entry.parentPath, entry.name)
    const target = join(destination, relative(source, original))
    const contents = await readFile(original)
    await mkdir(dirname(target), { recursive: true })
    try {
      await writeFile(target, contents, { flag: overwrite ? 'w' : 'wx' })
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      if (!(await readFile(target)).equals(contents)) throw new Error(`Asset already exists with different contents: ${target}`)
    }
  }
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  await copyAssets(resolve(args.find(arg => arg !== '--overwrite') ?? 'public'), { overwrite: args.includes('--overwrite') })
}
