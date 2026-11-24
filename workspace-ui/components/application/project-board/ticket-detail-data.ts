import { PROJECT_MEMBERS, type ProjectTicket, type TicketSubtask } from "./project-board-data";

type TicketBrief = { description: string; tasks: string[]; note: string };

/** Demo briefs belong to this template, not the shared component library. */
const BRIEFS: Record<string, TicketBrief> = {
  "DS-38": {
    description: "设计一张代理操作前的审批卡，说明拟执行动作、相关资源与可调整项。覆盖同意、要求更改和拒绝三种状态。",
    tasks: ["Explore compact and expanded approval cards", "Design approval and revision states", "Review keyboard and screen-reader behavior"],
    note: "The initial direction is a compact summary with an expandable action preview. Let’s validate the language before refining the visual states.",
  },
  "FE-86": {
    description: "允许用户将项目、负责人和优先级组合保存为视图。明确区分个人和团队视图，并为未保存及空结果提供提示。",
    tasks: ["Build the saved-view picker", "Restore filters when switching views", "Handle empty and unsaved states"],
    note: "The view model is outlined. Personal views will be the first milestone, with shared team views following the same interaction.",
  },
  "BE-23": {
    description: "为代理操作建立可靠的活动记录，记录执行者、受影响资源、结果、时间和关联编号。事件记录排除密钥和敏感负载。",
    tasks: ["Define the versioned event schema", "Add idempotent event ingestion", "Cover redaction and retry behavior"],
    note: "We have agreed on the event envelope. The next step is to check how retries are represented without producing duplicate activity.",
  },
  "DS-34": {
    description: "为卡片、菜单和浮层定义一致的语义样式。并行验证浅色与深色，记录每一层的表面、边框和阴影用法。",
    tasks: ["Audit existing floating surfaces", "Map light and dark semantic tokens", "Document usage with component examples"],
    note: "The surface audit is ready. Menus and dialogs need a little more separation in dark mode; token comparisons are the next step.",
  },
  "FE-82": {
    description: "确保每个模型都可以通过键盘选择。方向键浏览，回车确认，退出键返回触发按钮。跳过禁用选项并提供读屏提示。",
    tasks: ["Implement roving option focus", "Restore focus after selection or dismissal", "Verify search and disabled options"],
    note: "The interaction checklist is ready. We’ll use the existing selection primitives so focus behavior stays consistent with other menus.",
  },
  "BE-19": {
    description: "返回滚动使用窗口的已用量、剩余量、总量和重置时间。覆盖窗口叠加、延迟更新和额度用尽的场景。",
    tasks: ["Define the usage-window response", "Calculate reset timestamps consistently", "Test overlapping and exhausted windows"],
    note: "The response shape has been reviewed. Boundary cases around window resets will be covered before the endpoint is connected to the UI.",
  },
  "FE-79": {
    description: "让用户能读懂流式出现的任务分组。新组展开后仍可看到当前步骤，并支持减弱动效偏好。",
    tasks: ["Animate incoming nested groups", "Batch updates without layout jumps", "Verify reduced-motion and scroll behavior"],
    note: "The nested layout is working. We’re tuning the timing around rapid updates so the hierarchy stays readable while the agent is busy.",
  },
  "DS-31": {
    description: "提高深色模式下图表的读数和对比度。一起检查序列、网格、标签、悬停和重叠区。",
    tasks: ["Audit dark chart surfaces and labels", "Tune series and hover contrast", "Review all Pro chart variants"],
    note: "The first contrast pass is complete. Overlapping area fills still need a final check against the quieter grid and axis labels.",
  },
  "FE-76": {
    description: "保留已回答选项，使前后切换连续。验证长答案、校验提示和减弱动效时的布局。",
    tasks: ["Polish forward and back transitions", "Preserve answers and focus", "Review long answers and validation"],
    note: "The implementation is ready for review. Please check the backward transition and confirm that focus lands on the next question heading.",
  },
  "DS-27": {
    description: "提供可叠放的头像组，显示明确边界、稳定顺序、读屏名称和溢出数量。",
    tasks: ["Define overlap and overflow behavior", "Implement image and initials fallbacks", "Verify accessible group labels"],
    note: "Avatar groups are shipped and checked in both themes. The shared component now covers compact cards and larger team summaries.",
  },
  "FE-71": {
    description: "统一画布缩放和平移时的坐标。保持页面、边框和标签对齐，避免分数缩放时发生漂移。",
    tasks: ["Unify canvas coordinate transforms", "Keep cursor position stable during zoom", "Verify fractional zoom and large layouts"],
    note: "The coordinate fix is complete. Screens and selection outlines remain aligned across the supported zoom range.",
  },
  "BE-16": {
    description: "在打包前校验模板导入、依赖声明和发布范围，报告问题所在文件及缺失依赖。",
    tasks: ["Walk template import dependencies", "Reject missing or leaked sources", "Validate generated CLI and ZIP packages"],
    note: "Dependency validation is now part of packaging. Both the registry output and template archives pass the release checks.",
  },
  "DS-25": {
    description: "记录减弱动效时的过渡、状态变化与焦点变化，提供流式任务、拖动卡片和模态窗口的例子。",
    tasks: ["Audit motion across interactive blocks", "Write reduced-motion alternatives", "Publish examples and review guidance"],
    note: "The guidance is published with examples for the main interactive blocks. Each pattern includes a reduced-motion alternative.",
  },
};

export function ticketBrief(ticket: ProjectTicket): TicketBrief {
  return BRIEFS[ticket.code] ?? {
    description: `在「${ticket.project}」中规划并交付「${ticket.title}」。记录预期行为，完成实现后邀请团队评审。`,
    tasks: ["Confirm the scope and acceptance criteria", "Implement and review the change", "Verify the final experience"],
    note: "This ticket is ready to be scoped. Add any context the team needs before starting work.",
  };
}

export function ticketSubtasks(ticket: ProjectTicket, columnId: string): TicketSubtask[] {
  const count = { backlog: 0, todo: 0, "in-progress": 1, review: 2, done: 3 }[columnId] ?? 0;
  return ticket.subtasks ?? ticketBrief(ticket).tasks.map((title, i) => ({ id: `${ticket.id}-task-${i}`, title, done: i < count }));
}

/** Stable demo variation: opening or editing a ticket must not reshuffle its history. */
export function ticketDemoActivity(ticket: ProjectTicket) {
  let seed = Array.from(ticket.id).reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0, 2166136261);
  seed = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b) >>> 0;
  seed = (seed ^ (seed >>> 16)) >>> 0;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const members = Object.values(PROJECT_MEMBERS);
  const count = 1 + Math.floor(random() * 3);
  const firstAuthor = Math.floor(random() * members.length);
  const brief = ticketBrief(ticket);
  const messages = [
    brief.note,
    `I’ll take a look at this with the ${ticket.project} team and share feedback here.`,
    "Please check the final interaction with keyboard navigation too.",
    "The scope looks good. Let’s review the first pass together before moving ahead.",
    "I’ve added this to our next review. Let me know if anything is blocking progress.",
  ];
  const messageOffset = Math.floor(random() * messages.length);
  const comments = Array.from({ length: count }, (_, index) => ({
    id: `${ticket.id}-discussion-${index}`,
    author: members[(firstAuthor + index) % members.length].name,
    body: messages[(messageOffset + index) % messages.length],
    time: ["2 hours ago", "5 hours ago", "昨天"][index],
  }));
  const variant = random() < 0.35 ? "bar" as const : "area" as const;
  const intensity = 3 + random() * 22;
  const series = Array.from({ length: 16 }, (_, day) => ({
    label: `9月${day + 1}日`,
    value: random() < 0.2 ? 0 : Math.round(random() * intensity * 10) / 10,
  }));
  // Keep a visible two-day idle stretch in every ticket's dashed baseline.
  // Derive its position without advancing the generator used by resource links.
  const idleStart = 1 + (seed % (series.length - 3));
  series[idleStart].value = 0;
  series[idleStart + 1].value = 0;
  const total = Math.round(series.reduce((sum, point) => sum + point.value, 0) * 10) / 10;
  const previous = series.slice(0, 8).reduce((sum, point) => sum + point.value, 0);
  const recent = series.slice(8).reduce((sum, point) => sum + point.value, 0);
  const percentage = previous ? ((recent - previous) / previous) * 100 : 0;
  const resourcePool = ticket.code.startsWith("DS-") ? [
    { label: "figma.com", href: "https://www.figma.com/design/u0pDgMLRgYosD3lF19CZ3J/Board-UI" },
    { label: "tailwindcss.com", href: "https://tailwindcss.com/docs/theme" },
    { label: "remixicon.com", href: "https://remixicon.com" },
    { label: "w3.org", href: "https://www.w3.org/WAI/" },
  ] : ticket.code.startsWith("BE-") ? [
    { label: "nodejs.org", href: "https://nodejs.org/docs/latest/api/" },
    { label: "postgresql.org", href: "https://www.postgresql.org/docs/" },
    { label: "opentelemetry.io", href: "https://opentelemetry.io/docs/" },
    { label: "developer.mozilla.org", href: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
  ] : [
    { label: "react.dev", href: "https://react.dev/learn" },
    { label: "react-aria.adobe.com", href: "https://react-aria.adobe.com/" },
    { label: "developer.mozilla.org", href: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
    { label: "motion.dev", href: "https://motion.dev/docs/react" },
  ];
  const resourceOffset = Math.floor(random() * resourcePool.length);
  const resources = Array.from({ length: 1 + Math.floor(random() * 3) }, (_, index) => resourcePool[(resourceOffset + index) % resourcePool.length]);
  return { comments, resources, series, total, variant, change: `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%` };
}
