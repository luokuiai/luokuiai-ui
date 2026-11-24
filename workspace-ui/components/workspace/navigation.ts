import {
  RiBarChartBoxLine,
  RiChatAiLine,
  RiCodeSSlashLine,
  RiFlaskLine,
  RiGroupLine,
  RiImageAiLine,
  RiKanbanView2,
  RiLayoutGridLine,
  RiLayoutMasonryLine,
  RiShapesLine,
  RiShieldUserLine,
  RiSettings3Line,
} from "@remixicon/react";

export const workspaceRoutes = [
  {
    id: "chat", href: "/chat", label: "AI 对话", icon: RiChatAiLine,
    description: "与助手进行流式对话，管理会话历史，随时暂停回复。",
    category: "对话", tone: "bg-accent-500/10 text-accent-500",
  },
  {
    id: "agents", href: "/multi-agent-chat", label: "多代理协作", icon: RiGroupLine,
    description: "创建专属代理、编辑动态头像，在单聊或群组中协作。",
    category: "协作", tone: "bg-chart-1/15 text-chart-1-active",
  },
  {
    id: "code", href: "/ai-chat", label: "代码工作台", icon: RiCodeSSlashLine,
    description: "体验编码代理的会话、变更审阅和可调宽度的代码面板。",
    category: "模板", tone: "bg-chart-5/15 text-chart-5-active",
  },
  {
    id: "image", href: "/ai-image-generation", label: "图像生成", icon: RiImageAiLine,
    description: "体验示例图像从提示词到生成、反馈与作品画廊的流程。",
    category: "模板", tone: "bg-chart-3/15 text-chart-3-active",
  },
  {
    id: "profile", href: "/ai-profile", label: "AI 活动档案", icon: RiBarChartBoxLine,
    description: "浏览贡献热力图、代理活动及 词元使用趋势。",
    category: "用量", tone: "bg-chart-4/15 text-chart-4-active",
  },
  {
    id: "project-board", href: "/project-board", label: "任务看板", icon: RiKanbanView2,
    description: "跟踪代理相关工单，拖动流转状态，查看工单的 词元用量。",
    category: "协作", tone: "bg-chart-2/15 text-chart-2-active",
  },
  {
    id: "lab", href: "/lab", label: "组件实验室", icon: RiFlaskLine,
    description: "试用输入器、附件、任务进度、检索轨迹和澄清问卷。",
    category: "组件", tone: "bg-accent-500/10 text-accent-500",
  },
] as const;

export type WorkspaceRoute = (typeof workspaceRoutes)[number];

export const workspaceLibrary = [
  { id: "charts", href: "/charts", label: "数据图表", icon: RiBarChartBoxLine, description: "查看趋势、分布、转化、流向和活动等交互图表。", category: "组件", tone: "bg-chart-1/15 text-chart-1-active" },
  { id: "icons", href: "/icons", label: "图标库", icon: RiShapesLine, description: "按场景查找线框和实心图标，预览并复制 React 用法。", category: "资源", tone: "bg-chart-4/15 text-chart-4-active" },
  { id: "templates", href: "/templates", label: "整页模板", icon: RiLayoutMasonryLine, description: "打开业务仪表盘和 AI 工作空间的完整页面。", category: "模板", tone: "bg-chart-5/15 text-chart-5-active" },
  { id: "admin", href: "/admin", label: "AI 管理后台", icon: RiShieldUserLine, description: "在示例工作区管理模型、代理、运行、预算与审计。", category: "管理", tone: "bg-accent-500/10 text-accent-500" },
] as const;

export const workspaceTools = [
  { id: "components", href: "/components", label: "AI 组件目录", icon: RiLayoutGridLine },
  { id: "settings", href: "/settings", label: "设置", icon: RiSettings3Line },
] as const;
