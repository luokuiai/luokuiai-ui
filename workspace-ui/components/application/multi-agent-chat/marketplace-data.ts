import { FOLD_CONFIG, type AvatarConfig } from "../agent-avatar/model";
import { conversationFor, type Workspace } from "./data";

export type MarketplaceItem = {
  id: string;
  name: string;
  kind: "plugin" | "bot";
  category: string;
  description: string;
  detail: string;
  developer: string;
  website: string;
  logo?: "notion" | "figma" | "github" | "slack" | "gmail" | "drive" | "calendar" | "appwrite" | "linear" | "aws";
  avatar?: AvatarConfig;
  apps: string[];
  skills: { name: string; description: string }[];
};

const plugin = (id: NonNullable<MarketplaceItem["logo"]>, name: string, category: string, description: string, detail: string, developer: string, website: string, skill: string): MarketplaceItem => ({
  id, name, kind: "plugin", category, description, detail, developer, website, logo: id,
  apps: [name], skills: [{ name: skill, description }],
});
const bot = (id: string, name: string, category: string, description: string, detail: string, avatar: Partial<AvatarConfig>, skills: MarketplaceItem["skills"]): MarketplaceItem => ({
  id, name, kind: "bot", category, description, detail, developer: "LUOKUI-AI", website: "/", avatar: { ...FOLD_CONFIG, ...avatar }, apps: [], skills,
});

/** A local demo catalog. Adding a plugin does not authenticate a third-party account. */
export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  plugin("notion", "Notion", "效率", "把笔记、文档和项目集中管理。", "从工作区查找项目背景、整理笔记，并把想法变成可共享文档。", "Notion", "https://www.notion.so", "工作区知识"),
  plugin("figma", "Figma", "设计", "在对话中讨论设计方案。", "引用设计背景，探索页面和组件，整理反馈与下一步。", "Figma", "https://www.figma.com", "设计协作"),
  plugin("linear", "Linear", "项目管理", "把下一步工作转成工单。", "汇总项目和工单信息，帮助团队组织跟进事项。", "Linear", "https://linear.app", "工单规划"),
  plugin("appwrite", "Appwrite", "开发", "协助规划应用后端。", "整理身份认证、数据库、存储与后端函数的实现方案。", "Appwrite", "https://appwrite.io", "后端开发"),
  plugin("gmail", "Gmail", "沟通", "从收件箱找到关键信息。", "查找对话、总结邮件往来并起草回复。", "Google", "https://mail.google.com", "邮件协助"),
  plugin("calendar", "Google 日历", "效率", "整理日程与会议安排。", "查看日程背景、准备会议，并找出可用时间。", "Google", "https://calendar.google.com", "日程规划"),
  plugin("drive", "Google 云端硬盘", "效率", "在工作流中查找文件。", "发现共享的相关文档，并把资料带入会话。", "Google", "https://drive.google.com", "文件检索"),
  plugin("slack", "Slack", "沟通", "梳理团队对话。", "汇总讨论背景、决策内容与待办，方便团队同步。", "Slack", "https://slack.com", "团队更新"),
  plugin("github", "GitHub", "开发", "浏览代码、工单与合并请求。", "为代理提供仓库信息，辅助代码解释、变更审阅与实现规划。", "GitHub", "https://github.com", "代码审阅"),
  plugin("aws", "Amazon 位置服务", "基础设施", "为应用加入地图和路线。", "探索地图、地点检索、地理编码和路线集成。", "Amazon Web Services", "https://aws.amazon.com/location/", "位置服务"),
  bot("pitch-partner", "提案搭档", "写作", "把想法讲清楚。", "围绕提案、开场介绍与产品故事探索几种方向，再把关键信息讲得更准确。", { foldShape: "petal", hue: 24, saturation: 72, eyes: "happy", seed: 117 }, [{ name: "叙事构思", description: "为你的想法组织清晰、易记的叙事。" }]),
  bot("meeting-notes", "会议纪要助手", "效率", "把会议信息转成可跟进事项。", "从会议笔记中提取决策、待解决问题和行动项。", { foldShape: "pocket", hue: 157, saturation: 39, eyes: "curious", seed: 143 }, [{ name: "会议总结", description: "整理决策、负责人和跟进事项。" }]),
  bot("launch-planner", "发布策划", "营销", "将初步想法整理成发布计划。", "聚焦受众、信息与里程碑，逐步完善发布清单。", { foldShape: "star", hue: 252, saturation: 64, eyes: "excited", seed: 179 }, [{ name: "发布规划", description: "整理发布日程和推广纲要。" }]),
  bot("code-reviewer", "代码审阅助手", "开发", "审阅代码变更。", "从清晰度、边界情况与可维护性给出可执行的反馈。", { foldShape: "flower", hue: 204, saturation: 65, eyes: "thinking", seed: 211 }, [{ name: "代码反馈", description: "核对实现方案与易漏场景。" }]),
  bot("design-partner", "设计搭档", "设计", "把点子整理成可用界面。", "改进布局、视觉层次和交互细节。", { foldShape: "heart", hue: 329, saturation: 62, eyes: "happy", seed: 239 }, [{ name: "界面反馈", description: "优化布局、交互与视觉层次。" }]),
  bot("research-scout", "调研助手", "调研", "发现调研中的关键线索。", "整理文章、访谈和调研发现，区分证据与假设。", { foldShape: "diamond", hue: 46, saturation: 73, eyes: "curious", seed: 263 }, [{ name: "调研综合", description: "找出共性与证据缺口。" }]),
  bot("data-analyst", "数据分析师", "数据分析", "把数据整理成容易理解的结论。", "比较指标趋势、核对异常，从数据中提炼可解释的发现。", { foldShape: "shield", hue: 185, saturation: 53, eyes: "focused", seed: 293 }, [{ name: "数据解读", description: "说明趋势和差异，建议合适的图表。" }]),
  bot("support-guide", "用户支持助手", "沟通", "帮你准备清楚易执行的客户回复。", "根据产品背景和客户问题草拟回复，把排查拆成简单步骤。", { foldShape: "cloud", hue: 112, saturation: 42, eyes: "calm", seed: 317 }, [{ name: "客户回复", description: "准备回复与故障排查步骤。" }]),
];

export const DEFAULT_PLUGINS = ["gmail", "calendar", "drive", "slack"];
export const marketplaceAgentId = (id: string) => `marketplace-${id}`;
export function filterMarketplace(query: string, kind: "all" | "plugin" | "bot" = "all") {
  const terms = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return MARKETPLACE_ITEMS.filter(item => (kind === "all" || item.kind === kind) && terms.every(term => `${item.name} ${item.description} ${item.category} ${item.developer}`.toLocaleLowerCase().includes(term)));
}
export function addMarketplaceBot(workspace: Workspace, item: MarketplaceItem): Workspace {
  const id = marketplaceAgentId(item.id);
  if (item.kind !== "bot" || !item.avatar || workspace.agents.some(agent => agent.id === id)) return workspace;
  const agent = { id, name: item.name, label: item.category, description: item.description, avatar: { ...item.avatar } };
  const chat = conversationFor([agent], [id], `chat-${id}`);
  return { ...workspace, agents: [...workspace.agents, agent], chats: [chat, ...workspace.chats] };
}
