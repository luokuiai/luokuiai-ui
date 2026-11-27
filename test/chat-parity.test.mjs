import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

test('chat template public props accept previous host calls and desktop controls', () => {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const fixture = fileURLToPath(new URL('./chat-parity-types.tsx', import.meta.url))
  const config = ts.readConfigFile(root + 'tsconfig.workspace.json', ts.sys.readFile)
  assert.equal(config.error, undefined)
  const { options } = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
  const program = ts.createProgram([fixture, root + 'workspace-ui/assets.d.ts'], options)
  const source = program.getSourceFile(fixture)
  assert.ok(source)
  const diagnostics = [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source)]
  assert.deepEqual(diagnostics.map(error => ts.flattenDiagnosticMessageText(error.messageText, '\n')), [])
})
