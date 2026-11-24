# 数据展示组件

组件只负责渲染。数据请求、权限、文案、排序、分页、筛选、虚拟化、路由和选择状态由业务侧保留。普通应用导入 `@luokui/ui/styles.css`；已有设计系统的应用可保留原样式，不导入该 CSS。

## 列表：`ListSection`

| 参数 | 用途 |
|---|---|
| `heading` / `headingClassName` | 标题内容及容器类名。需要文档标题时，传入合适层级的标题元素。 |
| `before` / `after` | 列表前后的独立区域，例如筛选框、加载状态、分页按钮。 |
| `children` | 调用方排序、分组后的行。行有稳定的 `key`；语义列表由调用方传入 `ul` / `ol`。 |

```tsx
<ListSection aria-label="项目" heading={<h2>项目</h2>} after={<Button onClick={loadMore}>更多</Button>}>
  <ul>{items.map(item => <li key={item.id}>{item.title}</li>)}</ul>
</ListSection>
```

## 表格：`Table` 和子组件

`Table` 包含滚动容器；`wrapperClassName` 定制容器，`className` 定制 `table`。可组合 `TableCaption`、`TableHeader`、`TableBody`、`TableFooter`、`TableRow`、`TableHead`、`TableCell`；转发原生属性和 ref。表头用 `scope` 表达关联关系，可排序时由调用方负责 `aria-sort`、按钮和状态。不要在单元格之外嵌套交互控件。

```tsx
<Table>
  <TableCaption>项目状态</TableCaption>
  <TableHeader><TableRow><TableHead scope="col">项目</TableHead></TableRow></TableHeader>
  <TableBody>{rows.map(row => <TableRow key={row.id}><TableCell>{row.name}</TableCell></TableRow>)}</TableBody>
</Table>
```

已有 Tailwind 表格的应用可以用 `createTablePrimitives(React, { classes, mergeClasses })` 保留原样式、class 合并行为和滚动容器，避免影响粘性表头和列控件。复杂表格继续用原来的 TanStack 等引擎。

## 图表：`ChartFrame`、`Sparkline`

`ChartFrame` 是图表容器，接收原生 `div` 属性及可选 `placeholder`。由调用方决定何时展示空态、错误或加载；使用 Recharts 等尺寸敏感引擎时，调用方需提供有效高度。`Sparkline` 是轻量 SVG 趋势图，接受 `values: (number | null)[]` 和可访问的 `label`；空值断线。需要坐标轴、图例、悬浮提示、复杂数据或缩放时，继续传入原图表引擎，不用 Sparkline 替代。

```tsx
<Card title="趋势">
  <ChartFrame placeholder={values.length ? undefined : '暂无数据'}>
    <Sparkline label="任务趋势：4、8、缺失、6、12" values={values} />
  </ChartFrame>
</Card>
```

## 两仓接入与更新

- `bingsheng-ee`：聊天端原 `Table.tsx` 导出路径不变，改用共享表格工厂；管理端看板图表接入共享外框。数据查询、表格排序/分页/选择、图表引擎、样式和字典由原项目管理。
- `bisheng-desktop`：聊天/Work 最近会话使用共享 `ListSection`。会话合并、排序、搜索、归档、删除、分页及宿主主题保留在原插件；共享片段使用 Harness 内已有的 React，不新增一份 React 或加载入口。
- `bingsheng-ee` 通过 `@bisheng/ui/presentation` 直接引用 workspace 源码，不再保留快照。只有独立的桌面仓库继续保留可复现的列表快照，干净检出不依赖开发机绝对路径或公开 npm 仓库。不要手改消费端的同步块。

```powershell
pnpm --filter @luokui/ui sync:desktop 'D:\Work\Workspace\AI\bisheng-desktop'
pnpm --filter @luokui/ui sync:desktop --check 'D:\Work\Workspace\AI\bisheng-desktop'
```

范围：这是第一轮覆盖公共基础能力，不包含原项目的完整 Pro 模板或专有组件，也尚未把两个项目所有定制表格/业务图表替换掉。
