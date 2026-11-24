import { formatCost, summarizeRuns, type AdminState, type Agent, type AuditEntry, type Run } from "./admin-data.ts";

export type AdminChange = { state: AdminState; log: Pick<AuditEntry, "group" | "action" | "target"> } | string;

export function toggleModel(state: AdminState, id: string, enabled: boolean): AdminChange {
  const model = state.models.find((item) => item.id === id);
  if (!model || model.enabled === enabled) return "模型状态没有变化。";
  if (!enabled && state.defaultModel === id) return "请先将其他启用的模型设为默认。";
  return {
    state: { ...state, models: state.models.map((item) => item.id === id ? { ...item, enabled } : item) },
    log: { group: "模型", action: enabled ? "启用模型" : "暂停模型", target: model.name },
  };
}

export function chooseModel(state: AdminState, id: string): AdminChange {
  const model = state.models.find((item) => item.id === id && item.enabled);
  if (!model) return "只能选择已启用的模型。";
  if (state.defaultModel === id) return "此模型已经设为默认。";
  return { state: { ...state, defaultModel: id }, log: { group: "模型", action: "设为默认", target: model.name } };
}

export function addAgent(state: AdminState, agent: Agent): AdminChange {
  if (!agent.name || !agent.team || !agent.task) return "请填写名称、团队与职责。";
  if (state.agents.some((item) => item.name.toLowerCase() === agent.name.toLowerCase())) return "已有同名代理。";
  return { state: { ...state, agents: [...state.agents, agent] }, log: { group: "代理", action: "创建代理", target: agent.name } };
}

export function toggleAgent(state: AdminState, id: string, enabled: boolean): AdminChange {
  const agent = state.agents.find((item) => item.id === id);
  if (!agent || agent.enabled === enabled) return "代理状态没有变化。";
  return {
    state: { ...state, agents: state.agents.map((item) => item.id === id ? { ...item, enabled } : item) },
    log: { group: "代理", action: enabled ? "启用代理" : "暂停代理", target: agent.name },
  };
}

export function addRun(state: AdminState, id: string, now: string, previous?: Run): AdminChange {
  const model = state.models.find((item) => item.id === state.defaultModel && item.enabled);
  const agent = state.agents.find((item) => item.name === previous?.agent && item.enabled)
    ?? state.agents.find((item) => item.enabled);
  if (!model || !agent) return "请先启用至少一个代理和默认模型。";
  if (summarizeRuns(state.runs).cost >= state.budgetCents) return "当前已达到预算上限，请先调整预算。";
  const run: Run = {
    id, name: previous?.name ?? "资料分析演示", model: model.name, agent: agent.name,
    startedAt: now, status: "queued", tokens: 0, costCents: 0, duration: 0,
  };
  return {
    state: { ...state, runs: [run, ...state.runs] },
    log: { group: "运行", action: previous ? "重新排队" : "提交演示运行", target: run.name },
  };
}

const transitions = {
  queued: ["running", "canceled"],
  running: ["succeeded", "canceled"],
  succeeded: [],
  failed: [],
  canceled: [],
} satisfies Record<Run["status"], Run["status"][]>;

export function transitionRun(state: AdminState, id: string, status: Run["status"]): AdminChange {
  const run = state.runs.find((item) => item.id === id);
  if (!run || !(transitions[run.status] as Run["status"][]).includes(status)) return "运行已发生变化，请重新打开详情。";
  const completed = status === "succeeded";
  const operation = completed ? "完成演示运行" : status === "running" ? "开始演示运行" : "取消演示运行";
  const nextRun = completed ? { ...run, status, costCents: 72, tokens: 12_480, duration: 42 } : { ...run, status };
  if (completed && summarizeRuns(state.runs).cost + nextRun.costCents > state.budgetCents) return "余额不足，请先调整预算。";
  return {
    state: { ...state, runs: state.runs.map((item) => item.id === id ? nextRun : item) },
    log: { group: "运行", action: operation, target: run.name },
  };
}

export function changeBudget(state: AdminState, amount: string): AdminChange {
  const value = amount.trim();
  if (!/^\d{1,5}(?:\.\d{1,2})?$/.test(value)) return "请输入 0 至 99,999.99 元，最多保留两位小数。";
  const cents = Math.round(Number(value) * 100);
  if (cents === state.budgetCents) return "预算金额没有变化。";
  return { state: { ...state, budgetCents: cents }, log: { group: "预算", action: "更新预算", target: formatCost(cents) } };
}
