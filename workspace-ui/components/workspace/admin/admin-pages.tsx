"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { RiAddLine, RiArrowRightUpLine, RiDownloadLine, RiPlayLine, RiSearchLine, RiSettings3Line } from "@remixicon/react";
import { AreaChartCard } from "../../application/charts/area-chart-card";
import { BarListCard } from "../../application/charts/bar-list-card";
import { Button } from "../../base/buttons/button";
import { Input } from "../../base/input/input";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../base/modal/modal";
import { Switch } from "../../base/switch/switch";
import { addAgent, addRun, changeBudget, chooseModel, toggleAgent, toggleModel, transitionRun } from "./admin-actions";
import { AdminFeedback, AdminFilter, AdminMetrics, AdminTable, EnabledStatus, RunStatus, type Column } from "./admin-controls";
import { displayModelName, displayProviderName, formatCost, formatInteger, formatTime, getUsageWindow, runStatuses, summarizeRuns, type AdminSection, type AdminState, type AuditEntry, type Run } from "./admin-data";
import { updateAdminWorkspace, useAdminWorkspace } from "./admin-store";

const links = "inline-flex w-fit items-center gap-1.5 rounded-lg text-body-medium text-accent-600 hover:underline focus-visible:outline-2 focus-visible:outline-border-focus-ring";

export function AdminPages({ section }: { section: AdminSection }) {
  const state = useAdminWorkspace();
  switch (section) {
    case "overview": return <Overview state={state} />;
    case "models": return <Models state={state} />;
    case "agents": return <Agents state={state} />;
    case "runs": return <Runs state={state} />;
    case "usage": return <Usage state={state} />;
    case "audit": return <Audit state={state} />;
  }
}

const statusSeries = [{ key: "completed", label: "已完成" }, { key: "other", label: "其他状态" }];
const costSeries = [{ key: "cost", label: "费用" }];

function Overview({ state }: { state: AdminState }) {
  const { daily, runs } = getUsageWindow(state.runs, 14);
  const summary = summarizeRuns(runs);
  const finished = summary.completed + summary.failed;
  return (
    <>
      <AdminMetrics items={[
        { label: "近 14 日运行", value: runs.length, detail: summary.pending + " 项排队或运行中" },
        { label: "运行成功率", value: finished ? (100 * summary.completed / finished).toFixed(1) + "%" : "—", detail: summary.failed + " 项失败" },
        { label: "启用代理", value: state.agents.filter((agent) => agent.enabled).length, detail: "共 " + state.agents.length + " 个" },
        { label: "近 14 日费用", value: formatCost(summary.cost), detail: formatInteger(summary.tokens) + " 词元" },
      ]} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <AreaChartCard title="运行趋势" data={daily} series={statusSeries} range="最近 14 天" tiles />
        <div className="grid gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-5">
          <h2 className="text-title-3-semibold">工作区配置</h2>
          <dl className="grid gap-3 text-body-regular">
            <div className="flex justify-between gap-3"><dt className="text-text-secondary">默认模型</dt><dd>{displayModelName(state.models.find((model) => model.id === state.defaultModel)?.name ?? "待配置")}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-text-secondary">工作区预算</dt><dd>{formatCost(state.budgetCents)}</dd></div>
          </dl>
          <Link href="/admin/models" className={links}>管理模型 <RiArrowRightUpLine className="size-4" aria-hidden="true" /></Link>
          <Link href="/harness" className={links}>打开已有任务执行台 <RiArrowRightUpLine className="size-4" aria-hidden="true" /></Link>
        </div>
      </div>
      <section className="grid gap-3" aria-label="最近运行">
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-title-3-semibold">最近运行</h2><Link href="/admin/runs" className={links}>查看运行记录</Link></div>
        <AdminTable label="最近运行" items={state.runs.slice(0, 5)} columns={runColumns()} />
      </section>
    </>
  );
}

function Models({ state }: { state: AdminState }) {
  const [feedback, setFeedback] = useState("");
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title-3-semibold">工作区模型</h2>
        <Link href="/model" className={links}><RiSettings3Line className="size-4" aria-hidden="true" />打开实际模型连接设置</Link>
      </div>
      <AdminFeedback message={feedback} />
      <AdminTable label="工作区模型" items={state.models} columns={[
        { id: "name", label: "模型", render: (model) => <strong>{displayModelName(model.name)}</strong> },
        { id: "provider", label: "供应商", render: (model) => displayProviderName(model.provider) },
        { id: "status", label: "状态", render: (model) => <EnabledStatus enabled={model.enabled} /> },
        { id: "availability", label: "可用性", render: (model) => <Switch aria-label={displayModelName(model.name) + "可用性"} isSelected={model.enabled} isDisabled={model.id === state.defaultModel} onChange={(enabled) => setFeedback(updateAdminWorkspace((current) => toggleModel(current, model.id, enabled)))} size="sm" /> },
        { id: "default", label: "默认模型", render: (model) => model.id === state.defaultModel ? <span className="text-text-secondary">当前默认</span> : <Button size="small" variant="secondary" disabled={!model.enabled} aria-label={"设 " + displayModelName(model.name) + " 为默认"} onClick={() => setFeedback(updateAdminWorkspace((current) => chooseModel(current, model.id)))}>设为默认</Button> },
      ]} />
    </>
  );
}

function Agents({ state }: { state: AdminState }) {
  const [feedback, setFeedback] = useState("");
  const [formFeedback, setFormFeedback] = useState("");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [task, setTask] = useState("");
  const needle = query.trim().toLowerCase();
  const agents = state.agents.filter((agent) => (agent.name + " " + agent.team).toLowerCase().includes(needle));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const agent = { id: crypto.randomUUID(), name: name.trim(), team: team.trim(), task: task.trim(), enabled: true };
    const message = updateAdminWorkspace((current) => addAgent(current, agent));
    if (message.startsWith("创建代理成功")) {
      setOpen(false);
      setFeedback(message);
    } else {
      setFormFeedback(message);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input className="w-full sm:max-w-xs" value={query} onChange={setQuery} aria-label="搜索代理" placeholder="代理名称或团队" leadingIcon={RiSearchLine} />
        <Button leadingIcon={RiAddLine} onClick={() => { setName(""); setTeam(""); setTask(""); setFormFeedback(""); setOpen(true); }}>创建代理</Button>
      </div>
      <AdminFeedback message={feedback} />
      <AdminTable label="代理列表" items={agents} columns={[
        { id: "name", label: "代理", render: (agent) => <strong>{agent.name}</strong> },
        { id: "team", label: "团队", render: (agent) => agent.team },
        { id: "task", label: "职责", render: (agent) => <span className="text-text-secondary">{agent.task}</span> },
        { id: "status", label: "状态", render: (agent) => <EnabledStatus enabled={agent.enabled} /> },
        { id: "toggle", label: "可用性", render: (agent) => <Switch size="sm" aria-label={agent.name + "可用性"} isSelected={agent.enabled} onChange={(enabled) => setFeedback(updateAdminWorkspace((current) => toggleAgent(current, agent.id, enabled)))} /> },
      ]} />
      <Modal isOpen={open} onOpenChange={setOpen} isDismissable>
        <ModalHeader title="创建代理" description="为示例工作区添加一个可分配的代理。" closeLabel="关闭" />
        <ModalBody>
          <form id="admin-agent-form" className="grid gap-4" onSubmit={submit}>
            <Input label="代理名称" value={name} onChange={setName} maxLength={42} isRequired />
            <Input label="归属团队" value={team} onChange={setTeam} maxLength={42} isRequired />
            <Input label="职责说明" value={task} onChange={setTask} maxLength={150} isRequired />
            <AdminFeedback message={formFeedback} />
          </form>
        </ModalBody>
        <ModalFooter><Button type="submit" form="admin-agent-form">保存代理</Button></ModalFooter>
      </Modal>
    </>
  );
}

function runColumns(open?: (id: string) => void): Column<Run>[] {
  const columns: Column<Run>[] = [
    { id: "name", label: "运行", render: (run) => <span className="block text-body-medium">{run.name}</span> },
    { id: "model", label: "模型", render: (run) => displayModelName(run.model) },
    { id: "status", label: "状态", render: (run) => <RunStatus status={run.status} /> },
    { id: "started", label: "提交时间", render: (run) => formatTime(run.startedAt) },
    { id: "cost", label: "费用", render: (run) => formatCost(run.costCents) },
  ];
  if (open) columns.push({ id: "detail", label: "操作", render: (run) => <Button variant="ghost" size="small" aria-label={"查看 " + run.name + " 详情"} onClick={() => open(run.id)}>详情</Button> });
  return columns;
}

const statusOptions = [["all", "全部状态"], ...Object.entries(runStatuses)] as const;

function Runs({ state }: { state: AdminState }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [id, setId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const found = state.runs.find((run) => run.id === id);
  const needle = query.trim().toLowerCase();
  const runs = state.runs.filter((run) => (status === "all" || run.status === status) && [run.id, run.name, run.model, displayModelName(run.model), run.agent].join(" ").toLowerCase().includes(needle));

  function enqueue(previous?: Run) {
    const nextId = crypto.randomUUID();
    const message = updateAdminWorkspace((current) => addRun(current, nextId, new Date().toISOString(), previous));
    if (message.includes("成功")) setId(nextId);
    setFeedback(message);
  }

  function transition(run: Run, next: Run["status"]) {
    setFeedback(updateAdminWorkspace((current) => transitionRun(current, run.id, next)));
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Input className="w-full sm:w-64" aria-label="搜索运行" placeholder="搜索任务、模型或代理" value={query} onChange={setQuery} leadingIcon={RiSearchLine} />
          <AdminFilter label="运行状态" value={status} onChange={setStatus} options={statusOptions} />
        </div>
        <Button leadingIcon={RiPlayLine} onClick={() => enqueue()}>提交演示运行</Button>
      </div>
      <AdminFeedback message={feedback} />
      <AdminTable label="运行记录" items={runs} columns={runColumns(setId)} />
      <Modal isOpen={!!found} onOpenChange={(open) => { if (!open) setId(null); }} isDismissable>
        {found && <>
          <ModalHeader title={found.name} description="运行详情" closeLabel="关闭" />
          <ModalBody>
            <dl className="grid grid-cols-2 gap-4 text-body-regular">
              <div><dt className="text-text-secondary">状态</dt><dd className="pt-1"><RunStatus status={found.status} /></dd></div>
              <div><dt className="text-text-secondary">模型</dt><dd>{displayModelName(found.model)}</dd></div>
              <div><dt className="text-text-secondary">代理</dt><dd>{found.agent}</dd></div>
              <div><dt className="text-text-secondary">提交时间</dt><dd>{formatTime(found.startedAt)}</dd></div>
              <div><dt className="text-text-secondary">词元 / 费用</dt><dd>{formatInteger(found.tokens)} / {formatCost(found.costCents)}</dd></div>
              <div><dt className="text-text-secondary">运行耗时</dt><dd>{found.duration ? found.duration + " 秒" : "—"}</dd></div>
            </dl>
            {found.status === "failed" && <p className="rounded-xl bg-background-secondary-default p-3 text-body-regular text-text-secondary">示例失败原因：模型调用超时。重新排队会创建一条新的演示记录。</p>}
            <AdminFeedback message={feedback} />
          </ModalBody>
          <ModalFooter>
            {found.status === "failed" && <Button onClick={() => enqueue(found)}>重新排队</Button>}
            {(found.status === "queued" || found.status === "running") && <>
              <Button variant="secondary" onClick={() => transition(found, "canceled")}>取消运行</Button>
              <Button onClick={() => transition(found, found.status === "queued" ? "running" : "succeeded")}>{found.status === "queued" ? "开始演示运行" : "完成演示运行"}</Button>
            </>}
          </ModalFooter>
        </>}
      </Modal>
    </>
  );
}

function csvCell(value: string | number) {
  const text = String(value);
  return '"' + (/^[=+\-@\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
}

function downloadUsage(runs: Run[]) {
  const header = ["任务", "模型", "代理", "状态", "提交时间（北京时间）", "词元", "费用（元）"];
  const rows = runs.map((run) => [run.name, displayModelName(run.model), run.agent, runStatuses[run.status], formatTime(run.startedAt), run.tokens, (run.costCents / 100).toFixed(2)]);
  const data = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", data], { type: "text/csv;charset=utf-8" }));
  const download = document.createElement("a");
  download.href = url;
  download.download = "LUOKUI-AI-用量记录.csv";
  download.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

function Usage({ state }: { state: AdminState }) {
  const [windowSize, setWindowSize] = useState("14");
  const [budget, setBudget] = useState("");
  const [feedback, setFeedback] = useState("");
  const { runs, daily } = getUsageWindow(state.runs, Number(windowSize));
  const usage = summarizeRuns(runs);
  const total = summarizeRuns(state.runs).cost;
  const remaining = state.budgetCents - total;
  const byModel = new Map<string, number>();
  for (const run of runs) byModel.set(run.model, (byModel.get(run.model) ?? 0) + run.costCents);
  const items = [...byModel].map(([model, value]) => ({ label: displayModelName(model), value })).sort((a, b) => b.value - a.value);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = updateAdminWorkspace((current) => changeBudget(current, budget));
    if (message.startsWith("更新预算成功")) setBudget("");
    setFeedback(message);
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminFilter label="用量时间范围" value={windowSize} onChange={setWindowSize} options={[["7", "最近 7 天"], ["14", "最近 14 天"], ["30", "最近 30 天"]]} />
        <Button variant="secondary" leadingIcon={RiDownloadLine} onClick={() => downloadUsage(runs)}>导出用量表</Button>
      </div>
      <AdminMetrics items={[
        { label: "所选周期费用", value: formatCost(usage.cost) }, { label: "所选周期词元", value: usage.tokens },
        { label: "工作区预算", value: formatCost(state.budgetCents) }, { label: "剩余预算", value: formatCost(remaining), detail: "累计费用 " + formatCost(total) },
      ]} />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <AreaChartCard title="用量费用趋势" data={daily} series={costSeries} range={"最近 " + windowSize + " 天"} format={formatCost} />
        {items.length > 0 && <BarListCard title="模型费用分布" metricLabel="费用" items={items} metric="value" format={formatCost} />}
      </div>
      <form className="grid gap-3 rounded-2xl border border-border-button-default bg-background-primary-default p-5" onSubmit={submit}>
        <h2 className="text-title-3-semibold">设置工作区预算</h2>
        <div className="flex flex-wrap items-end gap-2">
          <Input label="预算金额（元）" placeholder={(state.budgetCents / 100).toFixed(2)} inputMode="decimal" value={budget} onChange={setBudget} isRequired className="w-full sm:max-w-xs" maxLength={8} />
          <Button type="submit">保存预算</Button>
        </div>
        <AdminFeedback message={feedback} />
      </form>
    </>
  );
}

const auditOptions = [["all", "全部类型"], ["模型", "模型"], ["代理", "代理"], ["运行", "运行"], ["预算", "预算"]] as const;
const displayAuditTarget = (entry: AuditEntry) => entry.group === "模型" ? displayModelName(entry.target) : entry.target;

function Audit({ state }: { state: AdminState }) {
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const entries = state.audit.filter((entry) => (group === "all" || entry.group === group) && [entry.action, entry.target, displayAuditTarget(entry)].join(" ").toLowerCase().includes(needle));
  const columns: Column<AuditEntry>[] = [
    { id: "action", label: "操作", render: (entry) => <strong>{entry.action}</strong> },
    { id: "group", label: "类型", render: (entry) => entry.group },
    { id: "target", label: "对象", render: displayAuditTarget },
    { id: "at", label: "时间（北京时间）", render: (entry) => formatTime(entry.at) },
  ];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-full sm:max-w-xs" placeholder="搜索操作或对象" aria-label="搜索审计日志" leadingIcon={RiSearchLine} value={query} onChange={setQuery} />
        <AdminFilter label="审计类型" value={group} onChange={setGroup} options={auditOptions} />
      </div>
      <AdminTable label="审计日志" items={entries} columns={columns} />
    </>
  );
}
