# 数据看板组件

数据看板是图表、指标和筛选控件的展示容器，不是任务看板，也不内置数据服务。

```tsx
import '@luokui/ui/styles.css'
import '@luokui/ui/dashboard.css'
import { Card, ChartFrame } from '@luokui/ui'
import { DashboardCanvas, DashboardGrid, DashboardMetric, DashboardShell, DashboardToolbar } from '@luokui/ui/dashboard'

<DashboardShell toolbar={<DashboardToolbar heading={<h1>业务概览</h1>} actions={filters} />}>
  <DashboardCanvas id="report-view">
    <DashboardGrid>
      <DashboardMetric label="活跃用户" value={formattedUsers} detail={periodLabel} />
      <Card title="访问趋势"><ChartFrame>{existingChart}</ChartFrame></Card>
    </DashboardGrid>
  </DashboardCanvas>
</DashboardShell>
```

| 组件 | 契约 |
|---|---|
| `DashboardShell` | `toolbar` 和 `children`；没有额外内容包装层。 |
| `DashboardToolbar` | `heading` / `actions`；标题和交互控件由调用方提供。 |
| `DashboardCanvas` | 转发原生 div 属性和 `ref`；可作为滚动、测量或全屏目标。 |
| `DashboardGrid` | 默认响应式网格，用于只读展示；不负责拖拽和尺寸持久化。 |
| `DashboardMetric` | `label` / `value` / `detail` / `children`；数值单位、本地化和空态由调用方处理。 |

`className` 可替换默认类，宿主可以继续使用原主题和布局，只接入组件结构。也可以使用默认 CSS，并通过 `--lk-dashboard-tile-min` 调整只读网格的最小列宽。交互图表请复用宿主的图表引擎。

## bingsheng-ee 接入边界

管理端数据看板详情通过 `@bisheng/ui/dashboard` 使用 `DashboardShell`、`DashboardToolbar` 与 `DashboardCanvas`，保留原 DOM 层级、样式和全屏目标 `view-panne`。编辑器仍使用原 `EditorCanvas` / `react-grid-layout`；查询、权限、重命名、发布、分享和筛选不迁移。`DashboardGrid` 与 `DashboardMetric` 已开放给其他项目，未替换毕昇有专用行为的网格和指标卡。

`@bisheng/ui/dashboard` 转发到同一 workspace 的 `@luokui/ui/dashboard`。修改 `src/dashboard.ts` 后直接由应用编译，不需要再同步快照。
