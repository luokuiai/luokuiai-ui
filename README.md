# LUOKUI UI

从 `LUOKUI-AI` 的使用场景提取出的独立 React 组件库。首版保留浅／深色主题、侧栏＋内容卡片、标题与操作区等设计思路；实现独立，不携带原站模板、资源、路由、业务状态或 API，也不依赖 Next.js 或 Tailwind。

## 本地开发

需要 Node.js 22。以下命令在组件库根目录运行：

```sh
npm install
npm test
npm run typecheck:workspace
npm run preview -- --port 3214
```

打开 <http://127.0.0.1:3214>，查看布局、聊天与数据看板示例。不带 `--port` 时默认端口为 `3211`。

组件库通过 `package.json` 的 `exports` 提供编译后的 JavaScript、类型声明和独立的 CSS 入口。Git 安装时由 `prepare` 生成 `dist`。`dist` 也供本库的 Node 测试和桌面端快照使用。

## 从私有 Git 仓库安装

在应用的 `package.json` 中声明 `@luokui/ui`，并将 `COMMIT_SHA` 替换为要使用的完整提交号：

```json
{
  "dependencies": {
    "@luokui/ui": "git+https://github.com/luokuiai/luokuiai-ui.git#COMMIT_SHA"
  }
}
```

安装机器需要使用有仓库读取权限的 GitHub 凭据。应用原有的 `@luokui/ui/chat`、`@luokui/ui/dashboard`、`@luokui/ui/activity-heatmap` 等导入路径继续可用。

## LUOKUI-AI 工作台组件

`workspace-ui/components/` 收录原工作台的基础组件、应用组件、设计基础设施和工作台界面，可按路径导入。例如：

```tsx
import { ContributionsGrid } from '@luokui/ui/components/application/dashboard/contributions-card.tsx'
import '@luokui/ui/workspace.css'
```

工作台组件以 TypeScript 源码交付。原工作台级入口沿用 Next.js 和 React 19，Next.js 宿主可将 `@luokui/ui` 加入 `transpilePackages`。基础组件可独立导入。工作台样式与宿主的全局主题一同生效，请在使用工作台组件的入口加载它。

需要原工作台图片的应用，应将包中的 `workspace-ui/public/` 相应目录复制到宿主的公开资源目录，沿用组件中的资源路径。模型接口、服务端路由和业务权限由宿主提供。

```tsx
import '@luokui/ui/styles.css'
import { AppShell, Button, Card, IconButton, ThemeScope } from '@luokui/ui'
import { AddIcon } from '@luokui/ui/icons'

export function Dashboard() {
  return <ThemeScope theme="system">
    <AppShell sidebar={<nav aria-label="主导航">概览</nav>} header={<h1>工作台</h1>}>
      <Card
        title="项目"
        description="本周活动"
        actions={<IconButton aria-label="新增项目"><AddIcon /></IconButton>}
        footer={<Button>查看全部</Button>}
      >
        12 个进行中的项目
      </Card>
    </AppShell>
  </ThemeScope>
}
```

- `ThemeScope`：`light` / `dark` / `system`，可在同一页面放多个主题区域。
- `AppShell`：`sidebar`、`header`、`children` 插槽；窄屏上下排列。路由、导航状态和移动端抽屉由调用方决定。
- `Card`：`title`、`description`、`actions`、`footer` 插槽，`headingLevel` 控制标题层级。
- `Button` / `IconButton`：支持原生按钮属性、禁用、键盘焦点；`IconButton` 要求提供可访问名称。
- `@luokui/ui/icons`：提供常用 Remix Icon 组件别名，图标按需导入。独立展示且传达含义的图标请附上可访问名称，装饰图标用 `aria-hidden`。
- `ListSection`、`Table`、`ChartFrame`、`Sparkline`：[API、示例与两仓接入说明](docs/data-display.md)。
- `@luokui/ui/chat`：[聊天组件 API 与毕昇接入说明](docs/chat.md)。
- `@luokui/ui/dashboard`：[数据看板 API 与毕昇接入说明](docs/dashboard.md)。
- `@luokui/ui/activity-heatmap`：活动热力图网格，配合 `@luokui/ui/activity-heatmap.css` 使用。调用方传入行列、标签和数据单元，通过 `getCellKey` 提供稳定键、通过 `renderCell` 渲染 `.lk-heatmap__cell` 并设置 `data-heat-level`（0–5）。宽屏下方格随容器伸缩，空间不足时横向滚动。

宿主可覆盖 `--lk-page`、`--lk-surface`、`--lk-text`、`--lk-accent`、`--lk-card-radius`、`--lk-sidebar-width` 等 CSS 变量。以 `LUOKUI-AI` 为例，可以在其项目的样式中将 `--lk-surface` 映射到 `--color-background-primary-default`、`--lk-page` 映射到 `--color-background-full`；本库不会读写宿主的全局主题或重置样式。

## 授权边界

本包从组织内部私有 Git 仓库安装。`workspace-ui/` 沿用 `LUOKUI-AI` 中的 BoardUI 组件、授权模板和界面资源，须按原项目的组织席位和分发许可使用。图标遵循 Remix Icon 授权。[BoardUI 授权](https://www.boardui.com/license) · [Remix Icon 授权](https://github.com/Remix-Design/RemixIcon/blob/master/License)
