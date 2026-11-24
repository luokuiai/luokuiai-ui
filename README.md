# LUOKUI UI

`@luokui/ui` 1.x 收录 `LUOKUI-AI/components` 的基础组件、应用组件、设计基础和工作台组件。组件按原模块导出，保留原有属性、泛型、受控和非受控接口、事件回调与样式。1.x 替换了 0.x 的独立重写版本，旧的 `@luokui/ui/chat`、`/dashboard` 和 `/presentation` 等入口已退役。

## 1.0.0 变更记录

- 以 `LUOKUI-AI/components` 为组件来源。常用组件从 `@luokui/ui` 导入，其余组件通过 `@luokui/ui/components/*` 按原模块路径导入。
- `@luokui/ui/styles.css` 提供编译后的主题和组件样式。包内同时交付 CSS Modules、Inter 字体和组件资源。宿主可用 `npx luokui-ui-assets public` 准备模板依赖的图片。
- 新增 `demo/`，支持组件搜索、交互预览、可复制代码和从 TypeScript 源码生成的 API 文档。
- 从 0.x 升级时，将旧的聊天、看板和展示组件导入替换为对应的源组件入口，并按新版组件的 Props 调整调用，详见下方接入示例。

## 在应用中使用

将以下依赖加入宿主的 `package.json`，用实际提交号替换 `COMMIT_SHA`。私有仓库安装需要 Git 读取权限。组件使用 React 19，源代码需要由应用的构建器转译。

```json
{
  "dependencies": {
    "@luokui/ui": "git+https://github.com/luokuiai/luokuiai-ui.git#COMMIT_SHA"
  }
}
```

把样式入口放在应用入口。CSS 已包含主题、排版和源组件使用的 Tailwind 工具类，宿主可以直接使用，无需重新扫描组件。需要在宿主自行增加 Tailwind 工具类时，由宿主的 Tailwind 配置生成。深色使用 `<html class="dark">`，方向使用 `DirectionProvider`。引用完整模板或依赖路由、图片的组件时，请使用 Next.js 16 并设置 `transpilePackages: ['@luokui/ui']`。

```tsx
import '@luokui/ui/styles.css'
import { Button, DirectionProvider } from '@luokui/ui'
import { AreaChartCard, type AreaChartCardProps } from '@luokui/ui/components/application/charts/area-chart-card.tsx'

export function Dashboard({ chart }: { chart: AreaChartCardProps }) {
  return <DirectionProvider locale="zh-CN">
    <Button variant="secondary" size="small">查看详情</Button>
    <AreaChartCard {...chart} />
  </DirectionProvider>
}
```

根入口聚合部分常用组件。其余模块按原目录与扩展名导入，例如 `@luokui/ui/components/base/token-input/token-input.tsx`。库同时保留源文件的 TypeScript 类型和 CSS Modules。应用组件依赖的路由、权限和模型服务由宿主提供。原 `AgentChat` 使用 `/api/chat`，其中 `GET` 查询模型配置，`POST` 按 AI SDK UI Message Stream 协议返回流式内容。

需要原模板的绝对路径图片时，在应用项目内运行 `npx luokui-ui-assets public`。相同文件会跳过，已有同名文件内容不同时会提示冲突。可对专门生成的目录使用 `--overwrite`。自定义页面也可以从 `@luokui/ui/assets/*` 直接引用图片。

## 本地示例站

```sh
npm ci
npm run demo
```

打开 <http://127.0.0.1:3214>。`demo/` 是独立的 Next.js 应用，通过 npm workspace 安装本库，并通过与宿主相同的包入口调用组件。左侧可按组件名、模块路径和导出名搜索。组件页面展示导入、类型和属性。常用基础组件、图表和整页模板提供实时预览，交互示例可查看调用代码。

```sh
npm test
npm run demo:build
npm run start --workspace luokui-ui-demo
```

## 授权

包面向组织内部私有 Git 仓库。工作台组件、模板和资源沿用来源项目适用的组织席位及分发许可。[BoardUI 授权](https://www.boardui.com/license) · [Remix Icon 授权](https://github.com/Remix-Design/RemixIcon/blob/master/License)
