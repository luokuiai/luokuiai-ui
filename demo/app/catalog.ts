import catalog from '../.generated/catalog.json'

type ComponentExport = {
  name: string
  kind: string
  description: string
  definition?: string
  signature?: string
  valueType?: string
  options: { name: string; optional: boolean; type: string; description: string }[]
}

export type ComponentModule = { id: string; path: string; exports: ComponentExport[] }
export const modules: ComponentModule[] = catalog
export const groups = { base: '基础组件', application: '应用组件', foundations: '设计基础', workspace: '工作台组件' } as const

export function moduleTitle(item: ComponentModule) {
  return item.exports.find(entry => entry.kind === 'component')?.name ?? item.path.split('/').at(-1)!
}
