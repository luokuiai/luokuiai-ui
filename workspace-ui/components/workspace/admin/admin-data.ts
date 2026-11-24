import { z } from "zod";
import { formatYuanFixed } from "../../../lib/currency.ts";

const modelSchema = z.object({ id: z.string(), name: z.string(), provider: z.string(), enabled: z.boolean() });
const agentSchema = z.object({ id: z.string(), name: z.string(), team: z.string(), task: z.string(), enabled: z.boolean() });
const runSchema = z.object({
  id: z.string(), name: z.string(), model: z.string(), agent: z.string(), startedAt: z.string(),
  status: z.enum(["queued", "running", "succeeded", "failed", "canceled"]),
  tokens: z.number().nonnegative(), costCents: z.number().nonnegative(), duration: z.number().nonnegative(),
});
const logSchema = z.object({
  id: z.string(), group: z.enum(["模型", "代理", "运行", "预算"]), action: z.string(), target: z.string(), at: z.string(),
});
export const adminSchema = z.object({
  models: z.array(modelSchema), agents: z.array(agentSchema), runs: z.array(runSchema), audit: z.array(logSchema),
  defaultModel: z.string(), budgetCents: z.number().int().nonnegative(),
});

export type AdminState = z.infer<typeof adminSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type Run = z.infer<typeof runSchema>;
export type AuditEntry = z.infer<typeof logSchema>;

export const adminSections = [
  { id: "overview", label: "运行总览", href: "/admin" },
  { id: "models", label: "模型管理", href: "/admin/models" },
  { id: "agents", label: "代理管理", href: "/admin/agents" },
  { id: "runs", label: "运行记录", href: "/admin/runs" },
  { id: "usage", label: "用量与预算", href: "/admin/usage" },
  { id: "audit", label: "审计日志", href: "/admin/audit" },
] as const;
export type AdminSection = (typeof adminSections)[number]["id"];

export const runStatuses: Record<Run["status"], string> = {
  queued: "排队中", running: "运行中", succeeded: "已完成", failed: "失败", canceled: "已取消",
};

const modelNames = new Map([
  ["GPT-5.6 Mini", "GPT-5.6 轻量版"],
  ["Claude Sonnet", "克劳德·十四行诗"],
  ["DeepSeek V4", "深度求索 V4"],
  ["Gemini Flash", "双子星闪速版"],
]);
const providerNames = new Map([
  ["OpenAI", "开放人工智能"], ["Anthropic", "安索罗匹克"], ["DeepSeek", "深度求索"], ["Google", "谷歌"],
]);
export const displayModelName = (name: string) => modelNames.get(name) ?? name;
export const displayProviderName = (name: string) => providerNames.get(name) ?? name;

const models = [
  { id: "openai-mini", name: "GPT-5.6 Mini", provider: "OpenAI", enabled: true },
  { id: "claude", name: "Claude Sonnet", provider: "Anthropic", enabled: true },
  { id: "deepseek", name: "DeepSeek V4", provider: "DeepSeek", enabled: true },
  { id: "gemini", name: "Gemini Flash", provider: "Google", enabled: false },
];
const agents = [
  { id: "research", name: "资料检索代理", team: "研究团队", task: "检索来源、清点证据和整理引用。", enabled: true },
  { id: "analyst", name: "数据分析代理", team: "数据团队", task: "校验业务指标并生成分析摘要。", enabled: true },
  { id: "review", name: "质量审核代理", team: "运营团队", task: "按审核清单检查报告与交付物。", enabled: true },
  { id: "draft", name: "报告撰写代理", team: "运营团队", task: "将研究材料整理为结构化报告。", enabled: false },
];

const demoTasks = ["渠道策略分析", "月度运营报告", "客户反馈归类", "知识库条目复核", "市场情报汇总", "销售数据复核", "发布材料完整性检查", "预算偏差说明"];
const demoDate = new Date("2026-11-19T05:20:00.000Z").getTime();
const seededRuns: Run[] = Array.from({ length: 28 }, (_, index) => {
  const succeeded = index !== 1 && index % 9 !== 3;
  const tokens = 2250 + ((index * 4727) % 26000);
  return {
    id: "示例-" + (1080 - index), name: demoTasks[index % demoTasks.length],
    agent: agents[index % 3].name, model: models[index % 3].name,
    startedAt: new Date(demoDate - Math.floor(index / 2) * 86_400_000 - (index % 2) * 5_400_000).toISOString(),
    status: succeeded ? "succeeded" : "failed", tokens, costCents: 12 + Math.round(tokens / 220),
    duration: 16 + (index * 11) % 57,
  };
});

export const initialAdminState: AdminState = {
  models, agents, runs: seededRuns,
  defaultModel: models[0].id, budgetCents: 12_000,
  audit: [
    { id: "初始-3", group: "运行", action: "运行失败", target: seededRuns[1].name, at: seededRuns[1].startedAt },
    { id: "初始-2", group: "预算", action: "设定预算", target: "¥120.00", at: "2026-11-18T06:10:00.000Z" },
    { id: "初始-1", group: "模型", action: "设为默认", target: models[0].name, at: "2026-11-18T04:25:00.000Z" },
  ],
};

const integer = new Intl.NumberFormat("zh-CN");
const dateTime = new Intl.DateTimeFormat("zh-CN", { timeZone: "Asia/Shanghai", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export const formatCost = (cents: number) => formatYuanFixed(cents / 100);
export const formatInteger = (value: number) => integer.format(value);
export const formatTime = (at: string) => dateTime.format(new Date(at));

export function summarizeRuns(runs: Run[]) {
  return runs.reduce((summary, run) => {
    summary.tokens += run.tokens;
    summary.cost += run.costCents;
    summary.completed += Number(run.status === "succeeded");
    summary.failed += Number(run.status === "failed");
    summary.pending += Number(run.status === "queued" || run.status === "running");
    return summary;
  }, { tokens: 0, cost: 0, completed: 0, failed: 0, pending: 0 });
}

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" });
export function getUsageWindow(runs: Run[], days: number) {
  const last = runs.reduce((time, run) => Math.max(time, new Date(run.startedAt).getTime()), demoDate);
  const dates = Array.from({ length: days }, (_, index) => dayKey.format(new Date(last - (days - index - 1) * 86_400_000)));
  const range = new Set(dates);
  const selection = runs.filter((run) => range.has(dayKey.format(new Date(run.startedAt))));
  const daily = dates.map((date) => {
    const records = selection.filter((run) => dayKey.format(new Date(run.startedAt)) === date);
    const completed = records.filter((run) => run.status === "succeeded").length;
    const cost = records.reduce((total, run) => total + run.costCents, 0);
    return { label: date.slice(5).replace("-", "/"), completed, other: records.length - completed, cost };
  });
  return { runs: selection, daily };
}
