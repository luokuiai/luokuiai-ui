import Link from 'next/link'
import { modules } from '../catalog'
import Code from '../code'

export default function Home() {
  return <>
    <section className="docs-intro">
      <h1>LUOKUI UI 组件库</h1>
      <p>在自己的 React 应用中复用 LUOKUI-AI 的组件、主题和交互。浏览 {modules.length} 个模块，查看公开导出和 TypeScript 配置，或直接试用组件。</p>
      <div className="docs-actions"><Link href="/components/base/buttons/button">查看 Button</Link><Link href="/examples">打开交互示例</Link></div>
    </section>
    <h2>安装</h2>
    <p>将依赖加入宿主应用的 <code>package.json</code>，将 <code>COMMIT_SHA</code> 替换为所需版本的提交号。</p>
    <Code>{'{\n  "dependencies": {\n    "@luokui/ui": "git+https://github.com/luokuiai/luokuiai-ui.git#COMMIT_SHA"\n  }\n}'}</Code>
    <h2>使用</h2>
    <p>在应用入口加载一次全局样式。使用 Next.js 时将库加入 <code>transpilePackages</code>。带图片的组件可通过 <code>npx luokui-ui-assets public</code> 准备资源。</p>
    <Code>{'import { Button, DirectionProvider } from "@luokui/ui"\nimport "@luokui/ui/styles.css"\n\nexport function App() {\n  return <DirectionProvider locale="zh-CN">\n    <Button variant="primary" size="medium">确认</Button>\n  </DirectionProvider>\n}'}</Code>
    <div className="docs-category-grid">
      <Link href="/components/base/input/input"><strong>基础组件</strong><span>按钮、表单、数据展示与浮层</span></Link>
      <Link href="/components/application/data-grid/data-grid"><strong>应用组件</strong><span>对话输入、应用面板和图表</span></Link>
      <Link href="/components/foundations/direction/direction"><strong>设计基础</strong><span>方向、主题和滚动交互</span></Link>
      <Link href="/components/workspace/lab"><strong>工作台组件</strong><span>完整界面与业务组合示例</span></Link>
    </div>
  </>
}
