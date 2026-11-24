import { RiFileTextLine, RiFlowChart, RiFolderLine, RiGlobalLine, RiSearchLine } from "@remixicon/react";
import type { ComposerAttachment } from "../application/composer-panel/composer-panel";
import type { QuestionnaireQuestion } from "../application/questionnaire/questionnaire";
import type { TaskListTask } from "../application/task-list/task-list";
import type { WebSearchStep } from "../application/web-search/web-search";
import type { TokenTrigger } from "../base/token-input/token-input";

export const triggers: TokenTrigger[] = [
  {
    char: "@",
    type: "file",
    title: "项目文件",
    items: [
      { id: "brief.md", label: "brief.md", description: "需求简报", icon: RiFileTextLine },
      { id: "notes.md", label: "notes.md", description: "访谈记录", icon: RiFolderLine },
    ],
  },
  {
    char: "/",
    type: "command",
    title: "快捷命令",
    boundary: "start",
    tone: "accent",
    items: [
      { id: "research", label: "/research", description: "开始调研", icon: RiSearchLine },
      { id: "plan", label: "/plan", description: "制定计划", icon: RiFlowChart },
    ],
  },
];

export const sampleAttachments: ComposerAttachment[] = [
  { id: "brief", name: "brief.pdf", kind: "document", progress: 0 },
  { id: "cover", name: "cover.png", kind: "image", src: "/templates/ai-profile-cover.png", progress: 0 },
  { id: "feedback", name: "feedback.xlsx", kind: "spreadsheet", progress: 0 },
];

export const progressSteps = ["读取发布简报", "核对官方文档", "整理发布清单"];
export const logEntries = ["收到调研任务", "读取项目简报", "收集两条官方来源", "整理发布清单"];

export const tasks: TaskListTask[] = [
  {
    title: "项目简报已读取",
    runningTitle: "正在核对项目文件",
    icon: RiFolderLine,
    steps: [
      { label: "读取文件", chips: [{ label: "brief.md" }] },
      { label: "归纳发布范围与交付目标" },
    ],
  },
  {
    title: "发布清单已整理",
    runningTitle: "正在整理交付清单",
    icon: RiFlowChart,
    steps: [{ label: "汇总验收项与风险" }, { label: "生成待确认事项" }],
  },
];

export const searchSteps: WebSearchStep[] = [
  { label: "查询官方组件文档", heading: true, icon: RiGlobalLine },
  {
    label: "检索",
    query: "代理组件与接入文档",
    icon: RiSearchLine,
    meta: "2 个来源",
    sources: [
      { title: "组件原始目录", domain: "boardui.com", href: "https://www.boardui.com/components" },
      { title: "官方 MCP 接入文档", domain: "boardui.com", href: "https://www.boardui.com/mcp" },
    ],
  },
  { label: "整理引用来源", icon: RiFileTextLine },
];

export const questions: QuestionnaireQuestion[] = [
  {
    id: "audience",
    question: "这份发布计划主要给谁看？",
    select: "single",
    options: [
      { value: "team", label: "项目团队", description: "包含实施细节和负责人" },
      { value: "stakeholders", label: "业务负责人", description: "聚焦目标、风险和决策点" },
    ],
    other: true,
  },
  {
    id: "deliverables",
    question: "计划需要包含哪些交付物？",
    select: "multiple",
    options: [
      { value: "timeline", label: "时间线" },
      { value: "checklist", label: "验收清单" },
      { value: "risks", label: "风险与回滚方案" },
    ],
    other: true,
  },
];
