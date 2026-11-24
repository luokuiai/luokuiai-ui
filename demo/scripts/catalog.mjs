import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve, sep } from 'node:path'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const root = join(dirname(require.resolve('@luokui/ui/package.json')), 'workspace-ui')
const components = join(root, 'components')
const files = (await readdir(components, { recursive: true }))
  .filter(file => /\.tsx?$/.test(file)).sort()
const program = ts.createProgram([join(root, 'assets.d.ts'), ...files.map(file => join(components, file))], {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX, strict: true, skipLibCheck: true, allowImportingTsExtensions: true
})
const checker = program.getTypeChecker()
const format = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.WriteArrowStyleSignature
const text = type => checker.typeToString(type, undefined, format)
const docs = symbol => ts.displayPartsToString(symbol.getDocumentationComment(checker))

function componentOptions(type, fallback) {
  const variants = type.isUnion() ? type.types : [type]
  const groups = new Map()
  for (const variant of variants) {
    for (const prop of checker.getPropertiesOfType(variant)) {
      const option = groups.get(prop.name) ?? { name: prop.name, optional: false, descriptions: new Set(), types: new Set(), variants: 0 }
      option.optional ||= Boolean(prop.flags & ts.SymbolFlags.Optional)
      option.types.add(text(checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration ?? fallback)))
      if (docs(prop)) option.descriptions.add(docs(prop))
      option.variants++
      groups.set(prop.name, option)
    }
  }
  return [...groups.values()].map(option => ({ name: option.name, optional: option.optional || option.variants < variants.length,
    type: [...option.types].join(' | '), description: [...option.descriptions].join('\n') }))
}

const modules = files.flatMap(file => {
  const source = program.getSourceFile(join(components, file))
  const symbol = checker.getSymbolAtLocation(source)
  if (!symbol) return []
  const exports = checker.getExportsOfModule(symbol).map(symbol => {
    const target = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
    const declaration = target.valueDeclaration ?? target.declarations?.[0]
    if (!declaration) return null
    const isType = !(target.flags & ts.SymbolFlags.Value)
    const type = isType ? checker.getDeclaredTypeOfSymbol(target) : checker.getTypeOfSymbolAtLocation(target, declaration)
    const signature = type.getCallSignatures()[0]
    const result = signature && checker.typeToString(signature.getReturnType())
    const name = symbol.name
    const component = !isType && Boolean(signature && /^[A-Z]/.test(name) && /\b(Element|ReactNode|ReactElement)\b/.test(result))
    const props = component && signature.parameters[0]
    const options = props ? componentOptions(checker.getTypeOfSymbolAtLocation(props, declaration), declaration) : []
    const definition = isType && (ts.isInterfaceDeclaration(declaration) || ts.isTypeAliasDeclaration(declaration))
      ? declaration.getText() : undefined
    return { name, kind: component ? 'component' : isType ? 'type' : 'value', description: docs(target), options, definition,
      signature: signature ? checker.signatureToString(signature) : undefined,
      valueType: !isType && !signature ? checker.typeToString(type) : undefined }
  }).filter(Boolean)
  if (!exports.length) return []
  const path = relative(components, source.fileName).split(/[/\\]/).join('/')
  return [{ id: path.replace(/\.tsx?$/, ''), path, exports }]
})

const destination = resolve('.generated')
await mkdir(destination, { recursive: true })
await writeFile(join(destination, 'catalog.json'), JSON.stringify(modules))

const previewPath = join(components, 'application', 'docs', 'component-previews-free.tsx')
const preview = program.getSourceFile(previewPath)
const registry = preview.statements.filter(ts.isVariableStatement)
  .flatMap(statement => [...statement.declarationList.declarations])
  .find(declaration => declaration.name.getText(preview) === 'FREE_COMPONENT_PREVIEWS')

function previewSource(property) {
  const imports = new Set()
  const declarations = new Set()
  function visit(node) {
    if (ts.isIdentifier(node)) {
      const symbol = checker.getSymbolAtLocation(node)
      const declaration = symbol?.declarations?.[0]
      if (declaration?.getSourceFile() === preview) {
        let top = declaration
        while (top.parent && top.parent !== preview) top = top.parent
        if (ts.isImportDeclaration(top)) imports.add(top)
        else if (top !== registry.parent.parent && !declarations.has(top)) {
          declarations.add(top)
          ts.forEachChild(top, visit)
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(property.initializer)
  const importText = [...imports].sort((a, b) => a.pos - b.pos).map(statement => {
    const specifier = statement.moduleSpecifier.text
    if (!specifier.startsWith('.')) return statement.getText(preview)
    const resolved = ts.resolveModuleName(specifier, previewPath, program.getCompilerOptions(), ts.sys).resolvedModule?.resolvedFileName
    if (!resolved?.startsWith(root + sep)) return statement.getText(preview)
    const path = relative(root, resolved).split(sep).join('/')
    return statement.getText(preview).replace(JSON.stringify(specifier), `'@luokui/ui/${path}'`)
  })
  const lines = [...declarations].sort((a, b) => a.pos - b.pos).map(node => node.getText(preview).replace(/^export /, ''))
  return ['"use client"', 'import "@luokui/ui/styles.css"', ...importText, ...lines,
    `const Preview = ${property.initializer.getText(preview)}`,
    'export default function Example() {\n  return <div style={{ position: "relative", minHeight: 256, containerType: "inline-size" }}><Preview /></div>\n}'].join('\n\n')
}

const examples = Object.fromEntries(registry.initializer.properties.filter(ts.isPropertyAssignment)
  .map(property => [property.name.text, previewSource(property)]))
await writeFile(join(destination, 'examples.json'), JSON.stringify(examples))
console.log(`${modules.length} modules, ${modules.flatMap(module => module.exports).filter(item => item.kind === 'component').length} component exports`)
