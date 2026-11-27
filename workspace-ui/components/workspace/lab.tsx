"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { RiArrowRightUpLine, RiPlayLine, RiRestartLine } from "@remixicon/react";
import { ContributionsCard } from "../application/dashboard/contributions-card";
import { AgentAvatar } from "../application/agent-avatar/agent-avatar";
import { AgentLimitsCard } from "../application/agent-limits/agent-limits-card";
import { LogRow, useLogMotion, useRevealTicker, WorkingRow } from "../application/agent-log/agent-log";
import { AgentProgress } from "../application/agent-progress/agent-progress";
import { AgentThinking } from "../application/agent-thinking/agent-thinking";
import { Composer } from "../application/ai-chat/ai-chat-composer";
import { ComposerLoader } from "../application/composer-loader/composer-loader";
import { ComposerWithAttachments } from "../application/composer-panel/composer-attachments";
import { ComposerPanel } from "../application/composer-panel/composer-panel";
import { AgentCreator } from "../application/multi-agent-chat/agent-editor";
import { INITIAL_AGENTS } from "../application/multi-agent-chat/data";
import { Questionnaire, type QuestionnaireAnswers } from "../application/questionnaire/questionnaire";
import { TaskList } from "../application/task-list/task-list";
import { WebSearch } from "../application/web-search/web-search";
import { Button } from "../base/buttons/button";
import { TokenInput, toLabel } from "../base/token-input/token-input";
import { cx } from "../../utils/cx";
import { logEntries, progressSteps, questions, sampleAttachments, searchSteps, tasks, triggers } from "./lab-data";

const sections = [
  { id: "compose", title: "输入与附件" },
  { id: "execution", title: "执行与检索" },
  { id: "planning", title: "澄清与用量" },
  { id: "agents", title: "代理形象" },
] as const;

const SelectedDemo = createContext<string | null>(null);

function DemoCard({ id, title, description, wide, children }: {
  id: string;
  title: string;
  description: string;
  wide?: boolean;
  children: ReactNode;
}) {
  const selected = useContext(SelectedDemo);
  if (selected) return selected === id ? <div className="grid min-w-0 gap-4">{children}</div> : null;
  return (
    <article id={id} className={cx("flex min-w-0 scroll-mt-5 flex-col gap-4 rounded-3xl border border-border-button-default bg-background-primary-default p-4 sm:p-5", wide && "xl:col-span-2")}>
      <div className="flex flex-col gap-1">
        <h3 className="text-title-3-semibold">{title}</h3>
        <p className="text-body-regular text-text-secondary">{description}</p>
        <code className="text-caption-1-medium text-text-tertiary">{id}</code>
      </div>
      {children}
    </article>
  );
}

function ResultLine({ text }: { text: string }) {
  return <p role="status" className="min-h-5 break-words text-caption-1-medium text-text-secondary">{text}</p>;
}

function ComposerDemos() {
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [panelMessage, setPanelMessage] = useState("");
  const [attachmentMessage, setAttachmentMessage] = useState("");
  const [tokenMessage, setTokenMessage] = useState("");
  const [uploads, setUploads] = useState(sampleAttachments);
  const [uploadRun, setUploadRun] = useState(0);
  const [loading, setLoading] = useState(true);

  function replayUploads() {
    setUploads(sampleAttachments);
    setUploadRun((value) => value + 1);
    setAttachmentMessage("正在加入示例附件");
  }

  return (
    <>
      <DemoCard id="composer" title="对话输入器" description="打开模型、推理强度和附件菜单，或输入文字并提交。" wide>
        <Composer value={draft} onValueChange={setDraft} onSubmit={(value) => {
          if (!value.trim()) return;
          setMessage(value.trim());
          setDraft("");
        }} />
        <ResultLine text={message ? `已提交：${message}` : ""} />
      </DemoCard>
      <DemoCard id="composer-panel" title="多行输入面板" description="切换权限和模型，输入多行内容或试用 @ 和 /。"
        wide>
        <ComposerPanel placeholder="输入任务，或输入 @ 引用文件" triggers={triggers} onSubmit={(value) => setPanelMessage(value.trim())} />
        <ResultLine text={panelMessage ? `已提交：${panelMessage}` : ""} />
      </DemoCard>
      <DemoCard id="composer-attachments" title="附件队列" description="重播示例文件的上传动画，或者移除已经加入的附件。" wide>
        <div><Button variant="secondary" size="small" leadingIcon={RiRestartLine} onClick={replayUploads}>重播附件动画</Button></div>
        <ComposerWithAttachments
          key={uploadRun}
          attachments={uploads}
          onAttachmentsChange={setUploads}
          onAllUploaded={() => setAttachmentMessage("示例附件已就绪")}
          onSubmit={(value) => setAttachmentMessage(value.trim() ? `已提交：${value.trim()}` : "")}
          placeholder="输入一条附带文件的消息"
        />
        <ResultLine text={attachmentMessage} />
      </DemoCard>
      <DemoCard id="token-input" title="引用与命令" description="输入 @ 选择文件，或在行首输入 / 选择命令。按 Enter 提交。">
        <TokenInput
          aria-label="引用与命令输入"
          placeholder="试试 @brief 或 /plan"
          triggers={triggers}
          onSubmit={(value) => setTokenMessage(toLabel(value))}
          className="min-h-16 rounded-xl border border-border-button-default bg-background-secondary-default p-3"
        />
        <ResultLine text={tokenMessage ? `已提交：${tokenMessage}` : ""} />
      </DemoCard>
      <DemoCard id="composer-loader" title="输入器加载光效" description="在等待回应时，沿输入器边缘显示加载状态。">
        <ComposerLoader active={loading}>
          <div className="px-4 py-4 text-body-regular text-text-secondary">{loading ? "正在等待代理回复…" : "输入器已就绪"}</div>
        </ComposerLoader>
        <div><Button variant="secondary" size="small" onClick={() => setLoading(!loading)}>{loading ? "暂停光效" : "显示光效"}</Button></div>
      </DemoCard>
    </>
  );
}

function AgentLogDemo({ playing }: { playing: boolean }) {
  const reduce = useLogMotion();
  const revealed = useRevealTicker({ total: logEntries.length, run: playing, stepInterval: 650, startDelay: 180 });
  return (
    <div>
      <ol className="flex flex-col gap-1" aria-label="代理日志">
        {logEntries.slice(0, revealed).map((entry, index) => (
          <LogRow key={entry} first={index === 0} last={index === logEntries.length - 1} reduce={reduce}>
            <div className="py-1 text-body-regular text-text-secondary">{entry}</div>
          </LogRow>
        ))}
      </ol>
      {revealed < logEntries.length && <WorkingRow reduce={reduce} label={playing ? "正在追加日志" : "日志已暂停"} />}
    </div>
  );
}

function ExecutionDemos() {
  const selected = useContext(SelectedDemo);
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState(true);
  function replay() {
    setRun((value) => value + 1);
    setPlaying(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="small" leadingIcon={RiRestartLine} onClick={replay}>重播执行演示</Button>
        <Button variant="secondary" size="small" leadingIcon={playing ? undefined : RiPlayLine} onClick={() => setPlaying(!playing)}>{playing ? "暂停执行演示" : "继续执行演示"}</Button>
      </div>
      <div className={cx("grid items-start gap-3", !selected && "xl:grid-cols-2")}>
        <DemoCard id="agent-thinking" title="代理思考状态" description="四种指示动效带有独立的计时显示。">
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-background-secondary-default p-4">
            <AgentThinking key={`wave-${run}`} variant="wave" label="波动" />
            <AgentThinking key={`spin-${run}`} variant="spin" label="旋转" />
            <AgentThinking key={`stars-${run}`} variant="stars" label="星光" />
            <AgentThinking key={`infinity-${run}`} variant="infinity" label="循环" />
          </div>
        </DemoCard>
        <DemoCard id="agent-progress" title="多步进度" description="展开进度卡查看当前步骤、已完成事项和剩余工作。">
          <AgentProgress key={run} steps={progressSteps} stepDuration={1500} paused={!playing} />
        </DemoCard>
        <DemoCard id="task-list" title="任务列表" description="观察任务标题和工作记录逐条出现。">
          <TaskList key={run} tasks={tasks} run={playing} stepInterval={500} working="正在整理任务" />
        </DemoCard>
        <DemoCard id="web-search" title="检索轨迹" description="使用示例事件展示查询、来源和引用链接。">
          <WebSearch key={run} steps={searchSteps} run={playing} stepInterval={550} working="正在核对来源" />
        </DemoCard>
        <DemoCard id="agent-log" title="流式事件日志" description="使用官方日志基础组件展示逐条揭示与树形连接。">
          <AgentLogDemo key={run} playing={playing} />
        </DemoCard>
      </div>
    </div>
  );
}

function PlanningDemos() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null);
  const [questionRun, setQuestionRun] = useState(0);

  return (
    <>
      <DemoCard id="questionnaire" title="澄清问卷" description="试用单选、多选或自定义回答，完成后查看结果。">
        <Questionnaire
          key={questionRun}
          questions={questions}
          labels={{ previous: "上一步", next: "下一步", complete: "提交答案", other: "其他", otherPlaceholder: "输入自定义回答" }}
          onComplete={setAnswers}
        />
        {answers && (
          <div className="flex flex-col items-start gap-2 rounded-xl bg-background-secondary-default p-3 text-body-regular text-text-secondary" role="status">
            {questions.map((question) => {
              const answer = answers[question.id];
              const selected = question.options.filter((option) => answer?.values.includes(option.value)).map((option) => option.label);
              return <p key={question.id}>{question.question} {([...selected, answer?.other].filter(Boolean)).join("、")}</p>;
            })}
            <Button variant="secondary" size="small" onClick={() => { setQuestionRun((value) => value + 1); setAnswers(null); }}>重新作答</Button>
          </div>
        )}
      </DemoCard>
      <DemoCard id="agent-limits-card" title="上下文与配额" description="展开上下文窗口、工具分组和计划用量。以下为示例用量。">
        <AgentLimitsCard plan="工作台示例" limits={[
          { label: "当前会话", used: 0.57, resets: "约 2 小时后重置" },
          { label: "本周用量", used: 0.31, resets: "下周一重置" },
        ]} />
      </DemoCard>
      <DemoCard id="contributions-card" title="贡献热力图" description="查看每日贡献，切换活动周期。" wide>
        <ContributionsCard />
      </DemoCard>
    </>
  );
}

function AgentDemos() {
  const [agent, setAgent] = useState(INITIAL_AGENTS[3]);
  return (
    <>
      <DemoCard id="agent-avatar" title="动态代理头像" description="移动指针观察角色，在旁边的编辑器里修改形状或配色。">
        <div className="grid min-h-52 place-items-center rounded-2xl bg-background-secondary-default">
          <AgentAvatar config={agent.avatar} size={174} />
        </div>
        <p className="text-center text-body-medium text-text-secondary">{agent.name}</p>
      </DemoCard>
      <DemoCard id="agent-creator" title="代理创建器" description="编辑身份、头像、表情和偏好，改动会同步到左侧头像。">
        <div className="h-[740px] min-w-0 overflow-hidden rounded-2xl border border-separator-border">
          <AgentCreator agent={agent} onChange={setAgent} />
        </div>
        <a href="/multi-agent-chat" className="inline-flex w-fit items-center gap-1 text-body-medium text-accent-600 hover:underline">打开多代理协作 <RiArrowRightUpLine className="size-4" aria-hidden="true" /></a>
      </DemoCard>
    </>
  );
}

const standaloneDemos = [
  { ids: ["composer", "composer-panel", "composer-attachments", "composer-loader", "token-input"], Demo: ComposerDemos },
  { ids: ["agent-thinking", "agent-progress", "task-list", "web-search", "agent-log"], Demo: ExecutionDemos },
  { ids: ["questionnaire", "agent-limits-card"], Demo: PlanningDemos },
  { ids: ["agent-avatar", "agent-creator"], Demo: AgentDemos },
];

export const standaloneDemoIds = standaloneDemos.flatMap(({ ids }) => ids);

export function LabPreview({ id }: { id: string }) {
  const match = standaloneDemos.find(({ ids }) => ids.includes(id));
  if (!match) throw new Error("组件演示缺失：" + id);
  const { Demo } = match;
  return <SelectedDemo.Provider value={id}><Demo /></SelectedDemo.Provider>;
}

export function ComponentLab() {
  return (
    <main className="mx-auto flex w-full max-w-[1336px] flex-col gap-7 px-5 py-7 sm:px-8 lg:px-9 lg:py-9">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-4-semibold">组件实验室</h1>
        <p className="text-headline-regular text-text-secondary">试用 LUOKUI-AI 的组件。这里的上传、检索和执行事件使用示例数据。</p>
      </div>
      <nav aria-label="组件分类" className="flex flex-wrap gap-2">
        {sections.map(({ id, title }) => <a key={id} href={`#${id}`} className="rounded-xl border border-border-button-default px-3 py-2 text-body-medium text-text-secondary transition-colors duration-150 hover:bg-background-secondary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring">{title}</a>)}
      </nav>
      {sections.map(({ id, title }) => (
        <section key={id} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-5 border-t border-separator-border pt-5">
          <h2 id={`${id}-title`} className="mb-4 text-title-1-semibold">{title}</h2>
          {id === "execution" ? <ExecutionDemos /> : (
            <div className="grid items-start gap-3 xl:grid-cols-2">
              {id === "compose" && <ComposerDemos />}
              {id === "planning" && <PlanningDemos />}
              {id === "agents" && <AgentDemos />}
            </div>
          )}
        </section>
      ))}
    </main>
  );
}
