# LUOKUI UI

`@luokui/ui` 1.x 收录 `LUOKUI-AI/components` 的基础组件、应用组件、设计基础和工作台组件。组件按原模块导出，保留原有属性、泛型、受控和非受控接口、事件回调与样式。

## 待发布变更

- 新增 `@luokui/ui/chat-composer` 和 `@luokui/ui/chat-composer.css`，提供基于 AI 对话输入框的布局、可替换的模型选择与技能菜单、资源标签键盘操作，以及运行光带和回复等待动效。
- 示例站「交互示例 → 公共聊天输入框」新增 AI 对话、图像生成、代码工作台和多代理协作四个调用示例。完整属性与调用说明见 [公共聊天输入框](docs/chat-composer.md)。

## 1.2.0 变更记录

- 新增 `@luokui/ui/desktop`。用 `DesktopWorkspaceShell` 包住工作区页面即可试用 B+C 标题栏，展开显示业务侧栏，收起显示紧凑导航。Next.js 示例站的「桌面工作台」入口演示完整接线。
- 代码工作台和图库支持隐藏、打开、全宽及恢复。群聊设置随当前会话切换。左右侧栏默认使用 280 ms 过渡，系统启用减少动态时立即切换。
- 收录日历、命令面板、上下文菜单、组合框、Toast 等本项目组件。原来的聊天、仪表盘、热图包入口仍然可用。原型的 Inter 字体、品牌和工单图片随包交付。

## 1.1.0 变更记录

- `@luokui/ui/chat` 提供可由宿主组合的聊天布局。消息、会话、请求、输入组件和权限由宿主管理。毕昇聊天样式单独从 `@luokui/ui/chat-bisheng.css` 导入。
- `@luokui/ui/activity-heatmap` 接收宿主提供的行列、数据及格子渲染函数。搭配 `@luokui/ui/activity-heatmap.css` 使用。
- `@luokui/ui/dashboard` 和 `@luokui/ui/presentation` 提供看板布局插槽、图表容器和原生表格构件。它们可与 1.x 源组件一起从同一依赖导入。

## 1.0.0 变更记录

- 以 `LUOKUI-AI/components` 为组件来源。常用组件从 `@luokui/ui` 导入，其余组件通过 `@luokui/ui/components/*` 按原模块路径导入。
- `@luokui/ui/styles.css` 提供编译后的主题和组件样式。包内同时交付 CSS Modules、Inter 字体和组件资源。宿主可用 `npx luokui-ui-assets public` 准备模板依赖的图片。
- 新增 `demo/`，支持组件搜索、交互预览、可复制代码和从 TypeScript 源码生成的 API 文档。

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

## 接入桌面工作台

在现有路由布局中，给 `DesktopWorkspaceShell` 传入当前工作区路径。页面可以组合 `WorkspaceFrame`、`TemplateFrame`，也可直接使用 `WorkspaceOverview`。右栏使用 `RightSidebarControl` 注册操作，按钮出现在当前窗口标题栏最右侧。按需导入 `@luokui/ui/sidebar-motion.module.css` 可在自建面板复用进退动效。

```tsx
import { DesktopWorkspaceShell, WorkspaceOverview } from '@luokui/ui/desktop'
import '@luokui/ui/styles.css'

export function Overview() {
  return <DesktopWorkspaceShell pathname="/">
    <WorkspaceOverview />
  </DesktopWorkspaceShell>
}
```

壳默认用页面链接导航。嵌入子路径时可以传 `basePath` 和路由回调 `onNavigate`。实际接线见 [示例站路由布局](demo/app/workspace/layout.tsx)。在采用 macOS 原生窗口控制按钮的宿主中，以 `windowControlsInset` 预留按钮所在宽度。

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
