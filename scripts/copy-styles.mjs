import { copyFile, readdir } from 'node:fs/promises'

const source = new URL('../src/', import.meta.url)
const output = new URL('../dist/', import.meta.url)

for (const file of await readdir(source)) {
  if (file.endsWith('.css')) {
    await copyFile(new URL(file, source), new URL(file, output))
  }
}
