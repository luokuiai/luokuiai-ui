import { notFound } from 'next/navigation'
import { groups, modules, moduleTitle } from '../../../catalog'
import Code from '../../../code'
import { ModulePreview } from '../../../previews'
import examples from '../../../../.generated/examples.json'

type Props = { params: Promise<{ id: string[] }>; searchParams: Promise<{ scenario?: string }> }

export async function generateMetadata({ params }: Props) {
  const id = (await params).id.join('/')
  const entry = modules.find(item => item.id === id)
  return { title: entry ? moduleTitle(entry) : '组件' }
}

export default async function ComponentPage({ params, searchParams }: Props) {
  const id = (await params).id.join('/')
  const item = modules.find(item => item.id === id)
  if (!item) notFound()
  const title = moduleTitle(item)
  const description = item.exports.find(entry => entry.name === title)?.description?.split('\n\n')[0]
  const group = groups[id.split('/')[0] as keyof typeof groups]
  const source = `@luokui/ui/components/${item.path}`
  const valueNames = item.exports.filter(entry => entry.kind !== 'type').map(entry => entry.name)
  const typeNames = item.exports.filter(entry => entry.kind === 'type').map(entry => entry.name)
  const uses = [valueNames.length && `import { ${valueNames.join(', ')} } from '${source}'`, typeNames.length && `import type { ${typeNames.join(', ')} } from '${source}'`].filter(Boolean).join('\n')
  return <>
    <div className="docs-breadcrumb">组件文档 / {group}</div>
    <h1>{title}</h1>
    {description && <p>{description}</p>}
    <ModulePreview id={item.id} imageScenario={(await searchParams).scenario === 'image-generation'} examples={examplesFor(id)} />
    <h2>导入</h2>
    <Code>{uses}</Code>
    <h2>API</h2>
    {item.exports.map(entry => <section className="docs-api" key={entry.name}>
      <h3 id={entry.name}>{entry.name} <small>{entry.kind === 'type' ? '类型' : entry.kind === 'component' ? '组件' : '函数或数据'}</small></h3>
      {entry.description && <p className="docs-description">{entry.description}</p>}
      {!!entry.options.length && <div className="docs-table-wrap"><table><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody>
        {entry.options.map(prop => <tr key={prop.name}><td><code>{prop.name}</code></td><td><code>{prop.type}</code></td><td>{prop.optional ? '否' : '是'}</td><td>{prop.description || '—'}</td></tr>)}
      </tbody></table></div>}
      {!entry.options.length && (entry.definition || entry.signature || entry.valueType) && <Code>{entry.definition ?? entry.signature ?? entry.valueType ?? ''}</Code>}
    </section>)}
  </>
}

function examplesFor(id: string) {
  const previews: Record<string, string> = examples
  const key = `/components/${id === 'application/dashboard/dashboard-sidebar' ? 'sidebar' : id.split('/').at(-1)}`
  return previews[key] ? { [key]: previews[key] } : {}
}
