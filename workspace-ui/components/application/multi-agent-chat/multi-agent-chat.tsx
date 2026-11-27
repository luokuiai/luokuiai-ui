"use client";

import { readWorkspaceStorage } from "../../../utils/workspace-storage";
import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useDirection } from "../../foundations/direction/direction";
import { LiquidGlassChip, LIQUID_GLASS_RESET } from "../landing/liquid-glass";

import { useCallback, useEffect, useId, useReducer, useRef, useState, useSyncExternalStore, type ReactNode, type Ref } from "react";
import { Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RiAddLine, RiCheckLine, RiCustomerService2Line, RiEditLine, RiFileCopyLine, RiGroupLine, RiMenuLine, RiMoreFill, RiPushpinLine, RiSearchLine, RiSettings3Line, RiShare2Line, RiStore2Line, RiThumbDownLine, RiThumbUpLine } from "@remixicon/react";
import { AgentAvatar } from "../agent-avatar/agent-avatar";
import { StreamedText } from "../agent-chat/agent-chat-message";
import { FOLD_CONFIG } from "../agent-avatar/model";
import { ComposerPanel } from "../composer-panel/composer-panel";
import { DashboardTeamMenu } from "../dashboard/dashboard-team-menu";
import { focusNavigationDialog, SlidingMobilePanel } from "../dashboard/mobile-navigation";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { Button } from "../../base/buttons/button";
import { CloseButton } from "../../base/buttons/close-button";
import { IconButton } from "../../base/buttons/icon-button";
import { Dropdown, DropdownGroup, DropdownItem, DropdownPopover, DropdownTrigger } from "../../base/dropdown/dropdown";
import { Input } from "../../base/input/input";
import { cx } from "../../../utils/cx";
import { RightSidebarButton, RightSidebarControl } from "../../workspace/right-sidebar-control";
import { AgentEditor } from "./agent-editor";
import { GroupSettings } from "./group-settings";
import { ChatContextMenu, type ChatMenuTarget } from "./chat-context-menu";
import { FirstMessageHandoff, REPLY_ARRIVAL_MS, type FirstMessageHandoffState } from "./first-message-handoff";
import { captureGroupAvatars, GroupAvatarHandoff, type AvatarHandoff } from "./group-avatar-handoff";
import { conversationFor, updateConversationAgents, removeConversation, nextAgentIdentity, demoReply, formatDemoReply, INITIAL_WORKSPACE, restoreWorkspace, type Agent, type Conversation, type Message, type Workspace } from "./data";
import { ScrollSurface } from "./scroll-surface";
import { Marketplace } from "./marketplace";
import { addMarketplaceBot, DEFAULT_PLUGINS, MARKETPLACE_ITEMS } from "./marketplace-data";
import { ReplyHeader } from "./reply-header";
import { WORKING_SECONDS } from "../agent-avatar/working";
import { streamReply, waitForReply } from "./stream-reply";

const subscribeCompact = (listener: () => void) => { const m = window.matchMedia("(max-width: 1099px)"); m.addEventListener("change", listener); return () => m.removeEventListener("change", listener); };
const compactSnapshot = () => window.matchMedia("(max-width: 1099px)").matches;
const serverSnapshot = () => false;
const MotionModalOverlay = motion.create(ModalOverlay);
const avatarEase = [0.22, 1, 0.36, 1] as const;
const NEW_BOT_AVATAR = { ...FOLD_CONFIG, hue: 254, saturation: 66 };
const focusClass = "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring";

type EditorSelection = { chatId: string; agentId: string };
export type MultiAgentChatProps = {
  /** Optional host integration. Without it, this template returns labeled sample replies. */
  onRespond?: (agent: Agent, messages: Message[], signal: AbortSignal) => Promise<string>;
  /** Starting content for embedded previews or a host-provided workspace. */
  initialWorkspace?: Workspace;
  /** By default the rail shows settings for the active agent or group. Pass null to start closed. */
  defaultEditorId?: string | null;
  /** Pass null to disable browser persistence. */
  storageKey?: string | null;
};

function AgentStack({ agents, size = 40 }: { agents: Agent[]; size?: number }) {
  const localize = useTemplateCopy();
  if (agents.length === 1) return localize(<AgentAvatar config={agents[0].avatar} size={size} label={agents[0].name} />);
  return localize(<div className="relative shrink-0" style={{ width: size, height: size }} aria-label={agents.map(a => a.name).join(", ")}>
    {agents.slice(0, 3).map((a, i) => <div key={a.id} className="absolute" style={{ left: i === 1 ? size * .4 : i === 2 ? size * .2 : 0, top: i === 2 ? size * .4 : 0 }}><AgentAvatar config={a.avatar} size={size * .65} label={a.name} /></div>)}
  </div>);
}

/** Keep the preview stable while each selected teammate joins the cluster. */
function SelectedAgentPreview({ agents, showCaption = true, previewRef, hiddenAvatars = [] }: { agents: Agent[]; showCaption?: boolean; previewRef?: Ref<HTMLDivElement>; hiddenAvatars?: string[] }) {
  const localize = useTemplateCopy();
  const reduced = useReducedMotion();
  const count = agents.length;
  const avatarSize = count === 1 ? 80 : count <= 3 ? 62 : 48;
  return localize(<div ref={previewRef} className={cx("flex shrink-0 flex-col items-center gap-2", showCaption && "pb-5")}>
    <div className="relative h-28 w-40" role="img" aria-label={count ? `已选代理：${agents.map(a => a.name).join("、")}` : "选择团队成员"}>
      {!count && <div className="flex h-full items-center justify-center"><RiGroupLine className="size-12 text-foreground-icon-tertiary" aria-hidden /></div>}
      <AnimatePresence initial={false}>
        {agents.map((agent, index) => {
          const angle = index * Math.PI * 2 / count - Math.PI / 2;
          const x = count === 1 ? 40 : count <= 3 ? (index === 1 ? 76 : index === 2 ? 49 : 22) : 56 + Math.cos(angle) * 38;
          const y = count === 1 ? 16 : count <= 3 ? (count === 3 && index === 2 ? 46 : 8) : 32 + Math.sin(angle) * 30;
          return <motion.div key={agent.id} data-group-avatar={agent.id} className="absolute left-0 top-0" aria-hidden style={{ visibility: hiddenAvatars.includes(agent.id) ? "hidden" : undefined }}
            initial={{ opacity: 0, scale: .5, x, y: y + 16 }} animate={{ opacity: 1, scale: 1, x, y }} exit={{ opacity: 0, scale: .5, y: y + 12 }}
            transition={{ duration: reduced ? 0 : .3, ease: avatarEase }}>
            <AgentAvatar config={agent.avatar} size={avatarSize} />
          </motion.div>;
        })}
      </AnimatePresence>
    </div>
    {showCaption && <p className="text-body-regular text-text-secondary">选择要加入对话的代理。</p>}
  </div>);
}

function DialogShell({ title, children, preview, footer, wide, leaving = false, onExited, onClose }: { title: string; children: ReactNode; preview?: ReactNode; footer?: ReactNode; wide?: boolean; leaving?: boolean; onExited?: () => void; onClose: () => void }) {
  const localize = useTemplateCopy();
  const direction = useDirection();
  return localize(<MotionModalOverlay dir={direction} isOpen isDismissable={!leaving} initial={false} animate={{ opacity: leaving ? 0 : 1 }} transition={{ duration: .24 }} onAnimationComplete={() => { if (leaving) onExited?.(); }} onOpenChange={open => !open && onClose()} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
    <Modal className={cx("w-full outline-none", wide ? "max-w-[520px]" : "max-w-[440px]")}><Dialog aria-label={title} className="flex max-h-[85dvh] flex-col overflow-hidden rounded-3xl border border-border-button-default bg-background-primary-default p-4 shadow-lg outline-none">
      <header className="mb-4 flex shrink-0 items-center justify-between"><Heading slot="title" className="text-headline-medium text-text-primary">{title}</Heading><CloseButton aria-label={`关闭${title}`} size="sm" onClick={onClose} /></header>
      {preview}
      <ScrollSurface className="flex min-h-0 flex-auto flex-col" contentClassName="h-auto min-h-0 flex-auto p-1" surface="primary" label={`${title}内容`}>{children}</ScrollSurface>
      {footer && <footer className="mt-4 shrink-0">{footer}</footer>}
    </Dialog></Modal>
  </MotionModalOverlay>);
}


export function MultiAgentChat({ onRespond, storageKey = "luokui-ai:multi-agent-chat:v1", initialWorkspace = INITIAL_WORKSPACE, defaultEditorId }: MultiAgentChatProps) {
  const localize = useTemplateCopy();
  const direction = useDirection();
  const [workspace, update] = useReducer((state: Workspace, action: Workspace | ((s: Workspace) => Workspace)) => typeof action === "function" ? action(state) : action, initialWorkspace);
  const [editorSelection, setEditorSelection] = useState<EditorSelection | null>(() =>
    defaultEditorId ? { chatId: initialWorkspace.activeId, agentId: defaultEditorId } : null);
  const [editorRailOpen, setEditorRailOpen] = useState(defaultEditorId !== null);
  const [editorDrawerOpen, setEditorDrawerOpen] = useState(false);
  const editorToggle = useRef<HTMLButtonElement>(null);
  const editorId = useId();
  const [mobileNav, setMobileNav] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const [menu, setMenu] = useState(false);
  const [more, setMore] = useState(false);
  const [dialog, setDialog] = useState<"newchat" | "library" | "marketplace" | "settings" | "support" | "renamechat" | null>(null);
  const [marketplaceItem, setMarketplaceItem] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [handoff, setHandoff] = useState<AvatarHandoff | null>(null);
  const [sendHandoff, setSendHandoff] = useState<FirstMessageHandoffState | null>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);
  const replyAvatarRef = useRef<HTMLSpanElement>(null);
  const finishSendHandoff = useCallback(() => setSendHandoff(null), []);
  const arriveSendAvatar = useCallback((id: string) => setSendHandoff(current => {
    if (!current || current.arrived.includes(id)) return current;
    const arrived = [...current.arrived, id];
    return arrived.length === current.avatars.length ? null : { ...current, arrived };
  }), []);
  const [pickerLeaving, setPickerLeaving] = useState(false);
  const pickerPreviewRef = useRef<HTMLDivElement>(null);
  const chatPreviewRef = useRef<HTMLDivElement>(null);
  const finishHandoff = useCallback(() => setHandoff(null), []);
  const arriveAvatar = useCallback((id: string) => setHandoff(current => {
    if (!current || current.arrived.includes(id)) return current;
    const arrived = [...current.arrived, id];
    return arrived.length === current.avatars.length ? null : { ...current, arrived };
  }), []);
  const [renamingChat, setRenamingChat] = useState<{ id: string; name: string } | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [chatMenu, setChatMenu] = useState<ChatMenuTarget | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, number>>({});
  const [thinking, setThinking] = useState<Record<string, Message>>({});
  const [streaming, setStreaming] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);
  const jobs = useRef(new Map<string, AbortController>());
  const reducedMotion = useReducedMotion();
  const compact = useSyncExternalStore(subscribeCompact, compactSnapshot, serverSnapshot);
  const panelId = editorId + (compact ? "-drawer" : "-rail");
  const chat: Conversation = workspace.chats.find(c => c.id === workspace.activeId) ?? workspace.chats[0] ?? { id: "draft-chat", title: "", agentIds: [workspace.agents[0].id], messages: [] };
  const contextChat = chatMenu && workspace.chats.find(c => c.id === chatMenu.id);
  const participants = chat.agentIds.flatMap(id => workspace.agents.find(agent => agent.id === id) ?? []);
  const isGroup = participants.length > 1;
  const selectedAgent = editorSelection?.chatId === chat.id
    ? workspace.agents.find(agent => agent.id === editorSelection.agentId) : undefined;
  const editorAgent = selectedAgent ?? (isGroup ? undefined : participants[0]);
  const showGroup = isGroup && !editorAgent;
  const panelLabel = showGroup ? "群聊设置" : "代理编辑器";
  const editorVisible = (showGroup || !!editorAgent) && (compact ? editorDrawerOpen && !dialog && !mobileNav : editorRailOpen);

  useEffect(() => {
    if (storageKey) {
      try {
        const raw = readWorkspaceStorage(storageKey);
        const restored = raw && restoreWorkspace(raw);
        if (restored) {
          update(restored);
          setEditorSelection(defaultEditorId ? { chatId: restored.activeId, agentId: defaultEditorId } : null);
        }
      } catch { /* Storage may be unavailable in private embeds. */ }
    }
    const item = new URL(window.location.href).searchParams.get("marketplace");
    if (item && MARKETPLACE_ITEMS.some(entry => entry.id === item)) { setMarketplaceItem(item); setDialog("marketplace"); }
    loaded.current = true;
    const activeJobs = jobs.current;
    return () => { for (const controller of activeJobs.values()) controller.abort(); activeJobs.clear(); };
  }, [storageKey, defaultEditorId]);
  useEffect(() => { if (loaded.current && storageKey) { try { localStorage.setItem(storageKey, JSON.stringify(workspace)); } catch { /* The current session still works without persistence. */ } } }, [workspace, storageKey]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [chat.id]);

  function openSettings(agent?: Agent) {
    setEditorSelection(agent ? { chatId: chat.id, agentId: agent.id } : null);
    setEditorRailOpen(true);
    setEditorDrawerOpen(true);
    setDialog(null);
    setMobileNav(false);
    setMore(false);
  }
  function switchGroupView(member?: Agent) {
    openSettings(member);
    requestAnimationFrame(() => {
      const panel = document.getElementById(panelId);
      const selector = member ? "[data-group-back]" : `[data-member-id="${CSS.escape(editorAgent?.id ?? "")}"]`;
      const target = panel?.querySelector<HTMLButtonElement>(selector) ?? panel?.querySelector<HTMLButtonElement>("button");
      target?.focus({ preventScroll: true });
    });
  }
  function closeSearch() {
    setSearchOpen(false); setQuery("");
    requestAnimationFrame(() => searchButtonRef.current?.focus());
  }
  function createAgent() {
    setSendHandoff(null);
    const agent: Agent = { id: crypto.randomUUID(), ...nextAgentIdentity(workspace.agents), label: "", description: "" };
    const created = conversationFor([agent], [agent.id], crypto.randomUUID());
    update(s => ({ ...s, agents: [...s.agents, agent], chats: [created, ...s.chats], activeId: created.id }));
    setEditorSelection(null);
    setEditorRailOpen(true);
    setEditorDrawerOpen(true);
    setMenu(false); setDialog(null); setMobileNav(false);
  }
  function closeEditor() {
    setEditorDrawerOpen(false);
    if (!compact) setEditorRailOpen(false);
  }
  function toggleEditor() {
    if (editorVisible) {
      closeEditor();
      return;
    }
    setEditorRailOpen(true);
    if (compact) setEditorDrawerOpen(true);
  }
  function changeAgent(draft: Agent) {
    const agent = { ...draft, name: draft.name.trim() || "New bot" };
    update(s => {
      const previous = s.agents.find(a => a.id === agent.id);
      return { ...s, agents: s.agents.map(a => a.id === agent.id ? agent : a), chats: s.chats.map(c => c.agentIds.length === 1 && c.agentIds[0] === agent.id && (c.title === previous?.name || c.title === previous?.label) ? { ...c, title: agent.name } : c) };
    });
  }
  function openChatPicker(ids: string[] = [], chatId: string | null = null) { setSendHandoff(null); setHandoff(null); setPickerLeaving(false); setEditingChatId(chatId); setSelected(ids); setDialog("newchat"); setMenu(false); setMore(false); setMobileNav(false); }
  function renameChat(target: Conversation) {
    const singleAgent = target.agentIds.length === 1 && workspace.agents.find(a => a.id === target.agentIds[0]);
    setRenamingChat({ id: target.id, name: target.customTitle || (singleAgent ? singleAgent.name : target.title) });
    setDialog("renamechat");
    setMobileNav(false);
  }
  function togglePin(id: string) {
    update(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c) }));
  }
  function startChat(ids: string[], groupToEdit?: string | null) {
    if (!ids.length) return;
    if (groupToEdit) {
      jobs.current.get(groupToEdit)?.abort(); jobs.current.delete(groupToEdit); clearGeneration(groupToEdit);
      setEditorSelection(null);
      update(s => ({ ...updateConversationAgents(s, groupToEdit, ids), activeId: groupToEdit }));
      setDialog(null); setEditingChatId(null);
      return;
    }
    if (pickerLeaving) return;
    setEditorSelection(null);
    const created = conversationFor(workspace.agents, ids, crypto.randomUUID());
    const avatars = dialog === "newchat" && ids.length > 1 && !reducedMotion ? captureGroupAvatars(pickerPreviewRef.current) : [];
    if (avatars.length) {
      setHandoff({ chatId: created.id, avatars, arrived: [] });
      setPickerLeaving(true);
    } else { setHandoff(null); setDialog(null); }
    update(s => {
      const existing = ids.length === 1 ? s.chats.find(c => c.agentIds.length === 1 && c.agentIds[0] === ids[0]) : undefined;
      if (existing) return { ...s, activeId: existing.id };
      return { ...s, chats: [created, ...s.chats], activeId: created.id };
    });
    setMobileNav(false);
  }
  function removeChat(id: string) {
    jobs.current.get(id)?.abort(); jobs.current.delete(id); clearGeneration(id);
    if (id === chat.id) setEditorSelection(null);
    update(s => removeConversation(s, id));
    setDrafts(s => { const next = { ...s }; delete next[id]; return next; });
    setNotice("Chat removed");
  }
  async function copy(text: string, success: string) {
    try { await navigator.clipboard.writeText(text); setNotice(success); } catch { setNotice("Copy isn’t available in this browser. You can select the message text to copy it."); }
  }
  function clearGeneration(id: string) {
    setPending(s => { const next = { ...s }; delete next[id]; return next; });
    setThinking(s => { const next = { ...s }; delete next[id]; return next; });
    setStreaming(s => { const next = { ...s }; delete next[id]; return next; });
  }
  async function send(text: string) {
    if (!text.trim() || jobs.current.has(chat.id)) return;
    setHandoff(null);
    const departing = !chat.messages.length && participants.length > 1 && !reducedMotion ? captureGroupAvatars(chatPreviewRef.current) : [];
    setSendHandoff(departing.length ? { chatId: chat.id, responderId: participants[0].id, avatars: departing, arrived: [] } : null);
    const id = chat.id, controller = new AbortController(); jobs.current.set(id, controller);
    const message: Message = { id: crypto.randomUUID(), role: "user", text: text.trim() };
    const history = [...chat.messages, message];
    update(s => ({ ...s, activeId: id, chats: s.chats.some(c => c.id === id) ? s.chats.map(c => c.id === id ? { ...c, messages: [...c.messages, message] } : c) : [{ ...chat, title: participants.map(a => a.name).join(" + "), messages: [message] }, ...s.chats] }));
    setDrafts(s => ({ ...s, [id]: "" })); setPending(s => ({ ...s, [id]: Date.now() }));
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; });
    try {
      // Give each agent its own uninterrupted reply, in conversation order.
      for (const agent of participants) {
        if (controller.signal.aborted) break;
        const reply: Message = { id: crypto.randomUUID(), role: "agent", agentId: agent.id, text: "" };
        setThinking(s => ({ ...s, [id]: reply }));
        try {
          // Two complete turns, plus a brief front-facing settle before revealing text.
          const [response] = await Promise.all([
            onRespond ? onRespond(agent, history, controller.signal) : Promise.resolve(demoReply(agent, history.filter(m => m.role === "user").length - 1)),
            waitForReply(WORKING_SECONDS * 2000 + 350 + (departing.length && agent.id === participants[0].id ? REPLY_ARRIVAL_MS : 0), controller.signal),
          ]);
          if (controller.signal.aborted) return;
          const el = scrollRef.current;
          const follow = el?.dataset.chatId === id && el.scrollHeight - el.scrollTop - el.clientHeight < 100;
          update(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, messages: [...c.messages, reply] } : c) }));
          setThinking(s => { const next = { ...s }; delete next[id]; return next; });
          if (follow) requestAnimationFrame(() => { if (el?.dataset.chatId === id) el.scrollTop = el.scrollHeight; });
          setStreaming(s => ({ ...s, [id]: reply.id }));
          await waitForReply(180, controller.signal);
          await streamReply(response, controller.signal, visible => {
            const el = scrollRef.current;
            const follow = el?.dataset.chatId === id && el.scrollHeight - el.scrollTop - el.clientHeight < 100;
            update(s => ({ ...s, chats: s.chats.map(c => c.id === id ? { ...c, messages: c.messages.some(m => m.id === reply.id) ? c.messages.map(m => m.id === reply.id ? { ...m, text: visible } : m) : [...c.messages, { ...reply, text: visible }] } : c) }));
            if (follow) requestAnimationFrame(() => { if (el?.dataset.chatId === id) el.scrollTop = el.scrollHeight; });
          });
        } catch { if (!controller.signal.aborted) setNotice(`${agent.name} couldn’t respond. Please try again.`); }
        if (!controller.signal.aborted) {
          setThinking(s => { const next = { ...s }; delete next[id]; return next; });
          setStreaming(s => { const next = { ...s }; delete next[id]; return next; });
        }
      }
    } finally {
      if (jobs.current.get(id) === controller) {
        jobs.current.delete(id);
        if (!controller.signal.aborted) clearGeneration(id);
      }
    }
  }

  const visibleChats = workspace.chats.filter(c => `${c.customTitle ?? c.title} ${workspace.agents.filter(a => c.agentIds.includes(a.id)).map(a => `${a.name} ${a.label}`).join(" ")} ${c.messages.at(-1)?.text ?? ""}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  const sidebar = <aside aria-label="会话" className="flex h-full min-h-0 w-[260px] shrink-0 flex-col rounded-3xl border border-border-button-white bg-background-secondary-default p-[7px] shadow-sidebar">
    <div className="relative h-9 shrink-0">
      <div className="grid h-full grid-cols-3 gap-2">
        <div aria-hidden="true" />
        <div inert={searchOpen} aria-hidden={searchOpen} className={cx("transition-[opacity,transform] duration-200 motion-reduce:transition-none", searchOpen ? "pointer-events-none translate-x-2 scale-95 opacity-0" : "opacity-100")}>
          <Button variant="secondary" iconOnly leadingIcon={RiStore2Line} aria-label="应用市场" className="w-full min-w-0 rounded-full border-0 bg-background-tertiary-default text-foreground-icon-secondary shadow-none hover:bg-background-tertiary-hover active:bg-background-tertiary-hover" onClick={() => { setMarketplaceItem(null); setDialog("marketplace"); setMobileNav(false); }} />
        </div>
        <div inert={searchOpen} aria-hidden={searchOpen} className={cx("flex transition-[opacity,transform] duration-200 motion-reduce:transition-none", searchOpen ? "pointer-events-none translate-x-2 scale-95 opacity-0" : "opacity-100")}>
          <Dropdown isOpen={menu} onOpenChange={setMenu}><DropdownTrigger aria-label="创建代理或对话" className="flex w-full min-w-0 items-center justify-center rounded-full bg-button-primary text-text-white"><RiAddLine className="size-5" /></DropdownTrigger>
            <DropdownPopover aria-label="创建" placement="bottom start" className="w-[323px] rounded-[20px] p-1.5">
              <DropdownGroup>
                <DropdownItem onSelect={createAgent} className="rounded-[14px] p-2">
                  <span className="size-8 shrink-0" aria-hidden><AgentAvatar config={NEW_BOT_AVATAR} size={32} /></span>
                  <span className="flex min-w-0 flex-1 flex-col"><span className="text-body-medium text-text-primary">创建新代理</span><span className="text-body-2-medium text-text-tertiary">自定义一个新的团队成员。</span></span>
                </DropdownItem>
                <DropdownItem onSelect={() => openChatPicker()} className="rounded-[14px] p-2">
                  <span className="size-8 shrink-0" aria-hidden><AgentStack agents={workspace.agents.slice(0, 3)} size={32} /></span>
                  <span className="flex min-w-0 flex-1 flex-col"><span className="text-body-medium text-text-primary">与代理对话</span><span className="text-body-2-medium text-text-tertiary">邀请多个代理加入同一场对话。</span></span>
                </DropdownItem>
              </DropdownGroup>
            </DropdownPopover>
          </Dropdown>
        </div>
      </div>
      <div className="absolute inset-y-0 start-0 z-10 overflow-hidden rounded-full bg-background-tertiary-default transition-[width] duration-300 ease-in-out motion-reduce:transition-none" style={{ width: searchOpen ? "100%" : "calc((100% - 16px) / 3)" }}>
        <Button ref={searchButtonRef} variant="secondary" iconOnly leadingIcon={RiSearchLine} aria-label="搜索会话" aria-expanded={searchOpen} aria-hidden={searchOpen} tabIndex={searchOpen ? -1 : 0}
          className={cx("absolute inset-0 w-full min-w-0 rounded-full border-0 bg-background-tertiary-default text-foreground-icon-secondary shadow-none transition-opacity duration-150 hover:bg-background-tertiary-hover active:bg-background-tertiary-hover motion-reduce:transition-none", searchOpen && "pointer-events-none opacity-0")}
          onClick={() => { setSearchOpen(true); setMenu(false); requestAnimationFrame(() => searchInputRef.current?.focus()); }} />
        <div inert={!searchOpen} aria-hidden={!searchOpen} className={cx("relative transition-opacity duration-150 motion-reduce:transition-none", searchOpen ? "opacity-100 delay-100" : "pointer-events-none opacity-0")} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); closeSearch(); } }}>
          <Input ref={searchInputRef} aria-label="搜索会话" placeholder="搜索会话…" value={query} onChange={setQuery} leadingIcon={RiSearchLine}
            fieldClassName="h-9 rounded-full ps-3 pe-9 ring-0" />
          <CloseButton aria-label="关闭搜索" size="xs" className="absolute end-2 top-2 hover:bg-background-tertiary-hover" onClick={closeSearch} />
        </div>
      </div>
    </div>
    <ScrollSurface className="mt-3 flex-1" contentClassName="flex flex-col gap-2" label="会话列表" fadeBottom>
      {visibleChats.map(c => {
        const agents = workspace.agents.filter(a => c.agentIds.includes(a.id));
        const last = c.messages.at(-1);
        return <button key={c.id} type="button" aria-haspopup="menu" aria-expanded={chatMenu?.id === c.id}
          onContextMenu={event => { event.preventDefault(); setMenu(false); setMore(false); setChatMenu({ id: c.id, x: event.clientX, y: event.clientY, trigger: event.currentTarget }); }}
          onKeyDown={event => { if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); setChatMenu({ id: c.id, x: rect.left + 24, y: rect.bottom, trigger: event.currentTarget }); } }}
          aria-current={chat.id === c.id ? "page" : undefined} onClick={() => {
            setSendHandoff(null); setHandoff(null);
            setEditorSelection(null);
            update(s => ({ ...s, activeId: c.id }));
            setMobileNav(false);
          }}
          className={cx("flex h-[54px] shrink-0 items-center gap-2.5 rounded-xl p-1.5 text-start", focusClass, chat.id === c.id ? "bg-background-tertiary-default" : "hover:bg-background-secondary-hover")}>
          <AgentStack agents={agents} /><span className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="truncate text-body-medium text-text-primary">{c.customTitle || (agents.length === 1 ? agents[0].name : c.title)}</span><span className="truncate text-body-regular text-text-tertiary">{pending[c.id] ? "正在协作思考…" : last ? last.text.split(/\n\s*\n/)[0] : "开始对话"}</span></span>{c.pinned && <RiPushpinLine aria-label="已置顶对话" className="me-1 size-3.5 shrink-0 text-foreground-icon-tertiary" />}
        </button>;
      })}
      {!visibleChats.length && <p className="px-2 py-6 text-body-regular text-text-secondary">没有找到会话。</p>}
    </ScrollSurface>
    <footer className="mt-3 flex shrink-0 flex-col gap-1">
      <Button variant="ghost" leadingIcon={RiCustomerService2Line} className="justify-start bg-transparent text-text-secondary hover:bg-background-secondary-hover active:bg-background-secondary-hover" onClick={() => setDialog("support")}>使用帮助</Button>
      <Button variant="ghost" leadingIcon={RiSettings3Line} className="justify-start bg-transparent text-text-secondary hover:bg-background-secondary-hover active:bg-background-secondary-hover" onClick={() => { setMobileNav(false); setMarketplaceItem(null); setDialog("settings"); }}>设置</Button>
      <div className="mt-2"><DashboardTeamMenu showThemeToggle /></div>
    </footer>
  </aside>;

  const closeDrawer = compact ? closeEditor : undefined;
  const editorPanel = showGroup
    ? <GroupSettings key={chat.id} chat={chat} members={participants} avatar={<AgentStack agents={participants} size={80} />}
        onRename={() => renameChat(chat)} onManageMembers={() => openChatPicker(chat.agentIds, chat.id)}
        onTogglePin={() => togglePin(chat.id)} onEditMember={switchGroupView} onClose={closeDrawer} />
    : editorAgent && <AgentEditor key={editorAgent.id} agent={editorAgent} onChange={changeAgent}
        onBack={isGroup ? () => switchGroupView() : undefined} onClose={closeDrawer} />;

  return localize(<div className="workspace-multi-agent relative flex h-dvh min-h-0 overflow-hidden bg-background-full p-3 text-text-primary">
    <div className="me-4 hidden min-h-0 shrink-0 md:block">{sidebar}</div>
    <main aria-label="代理对话" className="flex min-h-0 min-w-0 flex-1 flex-col rounded-3xl bg-background-secondary-default">
      <header className="flex h-[55px] shrink-0 items-start gap-2 px-3 pt-3">
        <RightSidebarControl>
          <RightSidebarButton
            ref={editorToggle}
            label={(editorVisible ? "收起" : "打开") + panelLabel}
            expanded={editorVisible}
            controls={editorVisible ? panelId : undefined}
            aria-haspopup={compact ? "dialog" : undefined}
            disabled={!!dialog || mobileNav}
            onMouseDown={event => {
              const focused = document.activeElement;
              if (!compact && focused?.matches("input, textarea, [contenteditable=true]") && !document.getElementById(panelId)?.contains(focused)) {
                event.preventDefault();
              }
            }}
            onClick={toggleEditor}
          />
        </RightSidebarControl>
        <IconButton icon={RiMenuLine} aria-label="打开会话列表" size="small" className="-ms-2 border-0 bg-transparent shadow-none md:hidden" onClick={() => setMobileNav(true)} />
        <div className="flex min-w-0 flex-1">
          <LiquidGlassChip radius="full" className="relative z-40 min-w-0 max-w-full rounded-full">
          <button ref={badgeRef} type="button" onClick={() => openSettings(isGroup ? undefined : participants[0])} className={cx("flex h-[31px] min-w-0 max-w-full items-center gap-2 rounded-full px-2 pe-3 text-body-2-medium text-text-secondary", LIQUID_GLASS_RESET, focusClass)}>
            <AgentStack agents={participants} size={20} /><span className="truncate">{isGroup ? chat.customTitle || chat.title : participants[0].name}</span>
          </button>
          </LiquidGlassChip>
        </div>
        <button type="button" aria-label="复制对话" title="复制对话" onClick={() => copy(chat.messages.map(m => `${m.role === "user" ? "你" : workspace.agents.find(a => a.id === m.agentId)?.name}: ${m.text}`).join("\n\n"), "已复制对话")} className={cx("rounded p-1 text-foreground-icon-secondary", focusClass)}><RiShare2Line className="size-4" /></button>
        <Dropdown isOpen={more} onOpenChange={setMore}><DropdownTrigger aria-label="会话选项" className="rounded p-1 text-foreground-icon-secondary"><RiMoreFill className="size-4" /></DropdownTrigger><DropdownPopover aria-label="会话选项" placement="bottom end" className="rounded-[14px] p-1"><DropdownGroup label="本次对话">{participants.map(a => <DropdownItem key={a.id} onSelect={() => openSettings(a)} className="px-2 py-1.5 text-body-medium"><span className="size-5 shrink-0" aria-hidden><AgentAvatar config={a.avatar} size={20} /></span><span className="truncate">编辑 {a.name}</span></DropdownItem>)}<DropdownItem onSelect={() => openChatPicker(chat.agentIds)} className="px-2 py-1.5 text-body-medium"><RiGroupLine className="size-4" />开始群聊</DropdownItem></DropdownGroup></DropdownPopover></Dropdown>
      </header>
      <ScrollSurface className="flex-1" contentClassName={chat.messages.length ? "pb-4 pt-2" : "flex items-center justify-center p-4"} scrollRef={scrollRef} chatId={chat.id} label="消息">
        {chat.messages.length === 0 && <div className="flex w-full flex-col items-center justify-center gap-4 px-4 py-8 text-center"><SelectedAgentPreview key={chat.id} agents={participants} showCaption={false} previewRef={chatPreviewRef} hiddenAvatars={handoff?.chatId === chat.id ? handoff.avatars.filter(avatar => !handoff.arrived.includes(avatar.id)).map(avatar => avatar.id) : []} /><div className="flex flex-col items-center gap-1.5"><h1 className="text-title-3-semibold">{participants.length > 1 ? "多个代理，一起讨论。" : `与${participants[0].name}打个招呼`}</h1><p className="max-w-[420px] text-body-regular text-text-secondary">{participants.length > 1 ? `${participants.map(a => a.name).join("、")}已加入。发送消息后，每个代理会给出自己的意见。` : participants[0].description}</p></div></div>}
        {chat.messages.length > 0 && <div className="mb-4 mt-3 flex justify-center"><span className="rounded-full bg-background-tertiary-default px-[7px] py-1 text-body-2-medium text-text-secondary">今天</span></div>}
        {[...chat.messages, ...(thinking[chat.id] ? [thinking[chat.id]] : [])].map(message => {
          const agent = workspace.agents.find(a => a.id === message.agentId);
          return message.role === "user" ? <div key={message.id} className="me-3 ms-auto mt-3 w-fit max-w-[min(520px,calc(100%-24px))] rounded-[var(--radius-2-5xl)] bg-background-primary-default p-3 text-start text-body-regular whitespace-pre-wrap break-words">{message.text}</div> : <article key={message.id} className="group/reply mx-3 mt-3 w-fit max-w-[min(520px,calc(100%-24px))] text-body-regular">
            {message.text && <div className="rounded-[var(--radius-2-5xl)] bg-background-tertiary-default p-3"><StreamedText text={formatDemoReply(message.text)} paragraphs /></div>}
            <div className="flex items-center justify-between gap-2 px-3">
              {agent && <ReplyHeader agent={agent} thinking={thinking[chat.id]?.id === message.id} workingKey={pending[chat.id]} avatarRef={thinking[chat.id]?.id === message.id ? replyAvatarRef : undefined} arriving={sendHandoff?.chatId === chat.id && sendHandoff.responderId === agent.id && !sendHandoff.arrived.includes(agent.id)} onEdit={() => openSettings(agent)} />}
            {thinking[chat.id]?.id !== message.id && streaming[chat.id] !== message.id && <div className="mt-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover/reply:opacity-100 group-focus-within/reply:opacity-100" aria-label="消息操作">
              {(["up", "down"] as const).map(direction => { const Icon = direction === "up" ? RiThumbUpLine : RiThumbDownLine; return <button key={direction} type="button" aria-label={direction === "up" ? "有帮助" : "无帮助"} aria-pressed={feedback[message.id] === direction} onClick={() => setFeedback(s => ({ ...s, [message.id]: direction }))} className={cx("flex size-[22px] items-center justify-center rounded-md bg-background-tertiary-default", focusClass, feedback[message.id] === direction ? "text-accent-600" : "text-foreground-icon-tertiary")}><Icon className="size-3" /></button>; })}
              <button type="button" aria-label="复制回复" onClick={() => copy(formatDemoReply(message.text), "已复制回复")} className={cx("flex size-[22px] items-center justify-center rounded-md bg-background-tertiary-default text-foreground-icon-tertiary", focusClass)}><RiFileCopyLine className="size-3" /></button>
            </div>}
            </div>
          </article>;
        })}

      </ScrollSurface>
      {/* Concentric corners: 24px container − 4px inset = 20px composer. */}
      <div className="shrink-0 p-1"><ComposerPanel cardClassName="rounded-[var(--radius-2-5xl)]" value={drafts[chat.id] ?? ""} onValueChange={value => setDrafts(s => ({ ...s, [chat.id]: value }))} onSubmit={send} disabled={!!pending[chat.id]} placeholder="你好，今天需要什么帮助？" status={null} defaultPermission="bypass" defaultModel="anthropic/fable-5" /></div>
    </main>
    <SlidingMobilePanel
      id={panelId}
      label={showGroup ? "群聊设置" : "编辑代理"}
      isOpen={editorVisible}
      docked={!compact}
      returnFocusRef={editorToggle}
      breakpoint={null}
      onOpenChange={open => { if (!open && compactSnapshot()) closeEditor(); }}
      className={compact
        ? cx("absolute inset-0 z-40 @container", !editorVisible && "pointer-events-none")
        : cx(navMotion.dockWidth, "hidden min-h-0 shrink-0 overflow-clip min-[1100px]:block",
            editorVisible ? "w-[356px]" : "invisible w-0 pointer-events-none")}
    >
      {compact && <button type="button" tabIndex={-1} aria-hidden onClick={closeEditor}
        className={cx(navMotion.fadeVisibility, "absolute inset-0 bg-background-secondary-default/70 backdrop-blur-sm",
          !editorVisible && "invisible opacity-0")} />}
      <div className={compact
        ? cx(navMotion.dockWidth, "absolute inset-y-0 end-0 max-w-full overflow-clip bg-background-full",
            editorVisible ? "w-[356px]" : "invisible w-0")
        : "contents"}>
        <div className={cx("h-full w-[356px]", compact ? "max-w-[100cqi] p-2" : "ps-4")}>
          {editorPanel}
        </div>
      </div>
    </SlidingMobilePanel>
    <ModalOverlay dir={direction} isOpen={mobileNav} isDismissable onOpenChange={setMobileNav}
      className={cx(navMotion.modalBackdrop, "fixed inset-0 z-40 flex bg-background-secondary-default/70 p-3 backdrop-blur-sm")}>
      <Modal className={cx(navMotion.modalSidebar, "relative h-full outline-none")}>
        <Dialog ref={focusNavigationDialog} aria-label="会话" className="h-full outline-none">
          {sidebar}
          <CloseButton aria-label="关闭会话列表" className="absolute -end-10 top-2" onClick={() => setMobileNav(false)} />
        </Dialog>
      </Modal>
    </ModalOverlay>
    <AnimatePresence>{(dialog === "marketplace" || dialog === "settings") && <Marketplace key="marketplace" defaultPage={dialog === "settings" ? "general" : "marketplace"} agents={workspace.agents} installedPlugins={workspace.installedPlugins ?? DEFAULT_PLUGINS} initialItem={marketplaceItem}
      onClose={() => setDialog(null)} onCopy={copy} onChat={id => startChat([id])}
      onAddBot={item => update(s => addMarketplaceBot(s, item))}
      onTogglePlugin={id => update(s => { const installed = s.installedPlugins ?? DEFAULT_PLUGINS; return { ...s, installedPlugins: installed.includes(id) ? installed.filter(value => value !== id) : [...installed, id] }; })} />}</AnimatePresence>
    {sendHandoff?.chatId === chat.id && <FirstMessageHandoff handoff={sendHandoff} badgeRef={badgeRef} replyRef={replyAvatarRef} onArrive={arriveSendAvatar} onFinish={finishSendHandoff} />}
    {handoff && <GroupAvatarHandoff handoff={handoff} targetRef={chatPreviewRef} onArrive={arriveAvatar} onFinish={finishHandoff} />}
    {chatMenu && contextChat && <ChatContextMenu target={chatMenu} agents={contextChat.agentIds.flatMap(id => workspace.agents.find(agent => agent.id === id) ?? [])}
      onClose={() => setChatMenu(null)} pinned={contextChat.pinned}
      onPin={() => togglePin(contextChat.id)}
      onRename={() => renameChat(contextChat)}
      onCopyId={() => copy(contextChat.id, "已复制对话编号")}
      onEdit={() => contextChat.agentIds.length > 1 ? openChatPicker(contextChat.agentIds, contextChat.id) : openSettings(workspace.agents.find(agent => agent.id === contextChat.agentIds[0])!)}
      onCopy={() => copy(contextChat.messages.map(message => `${message.role === "user" ? "你" : workspace.agents.find(agent => agent.id === message.agentId)?.name}: ${message.text}`).join("\n\n"), "已复制对话")}
      onRemove={() => removeChat(contextChat.id)} />}
    {dialog === "renamechat" && renamingChat && <DialogShell title="重命名对话" onClose={() => { setDialog(null); setRenamingChat(null); }}
      footer={<Button type="submit" form="rename-chat-form" className="w-full rounded-full" disabled={!renamingChat.name.trim()}>保存名称</Button>}>
      <form id="rename-chat-form" onSubmit={event => { event.preventDefault(); const name = renamingChat.name.trim(); if (!name) return; update(s => ({ ...s, chats: s.chats.map(c => c.id === renamingChat.id ? { ...c, customTitle: name } : c) })); setDialog(null); setRenamingChat(null); }}>
        <Input label="对话名称" autoFocus maxLength={100} value={renamingChat.name} onChange={name => setRenamingChat({ ...renamingChat, name })} />
      </form>
    </DialogShell>}
    {dialog === "newchat" && <DialogShell wide leaving={pickerLeaving} onExited={() => { setDialog(null); setPickerLeaving(false); }} title={editingChatId ? "编辑群聊" : "与代理对话"} onClose={() => setDialog(null)}
      preview={<SelectedAgentPreview agents={selected.flatMap(id => workspace.agents.find(a => a.id === id) ?? [])} previewRef={pickerPreviewRef} hiddenAvatars={pickerLeaving ? selected : []} />}
      footer={<Button className="w-full rounded-full" disabled={pickerLeaving || !selected.length} onClick={() => startChat(selected, editingChatId)}>{editingChatId ? "保存更改" : "开始对话"}{selected.length ? ` · ${selected.length} 个代理` : ""}</Button>}>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="选择代理">
        {workspace.agents.map(a => {
          const picked = selected.includes(a.id);
          return <Button key={a.id} variant="secondary" aria-label={a.name} aria-pressed={picked}
            onClick={() => setSelected(ids => picked ? ids.filter(id => id !== a.id) : [...ids, a.id])}
            className={cx("h-10 max-w-full rounded-full border px-2 shadow-none transition-colors hover:bg-background-tertiary-default active:bg-background-tertiary-hover", picked ? "border-foreground-icon-secondary bg-background-tertiary-default text-text-primary dark:bg-background-tertiary-hover dark:hover:bg-background-tertiary-hover dark:active:bg-background-tertiary-hover" : "border-transparent bg-background-secondary-default text-text-secondary")}>
            <span className="flex min-w-0 items-center gap-2"><span className="size-6 shrink-0" aria-hidden><AgentAvatar config={a.avatar} size={24} /></span><span className="truncate">{a.name}</span></span>
          </Button>;
        })}
      </div>
    </DialogShell>}

    {dialog === "library" && <DialogShell title="你的代理" onClose={() => setDialog(null)} footer={<Button leadingIcon={RiAddLine} onClick={createAgent} className="w-full">创建新代理</Button>}><div className="flex flex-col gap-2">{workspace.agents.map(a => <div key={a.id} className="flex items-center gap-2 rounded-xl bg-background-secondary-default p-2"><AgentAvatar config={a.avatar} size={40} label={a.name} /><button type="button" onClick={() => startChat([a.id])} className={cx("min-w-0 flex-1 rounded text-start", focusClass)}><span className="block truncate text-body-medium">{a.name}</span><span className="text-caption-1-regular text-text-secondary">{a.label}</span></button><IconButton icon={RiEditLine} aria-label={`编辑${a.name}`} size="small" className="border-0 bg-transparent shadow-none" onClick={() => openSettings(a)} /></div>)}</div></DialogShell>}

    {dialog === "support" && <DialogShell title="使用帮助" onClose={() => setDialog(null)}><div className="space-y-4 text-body-regular text-text-secondary"><p>点击 <strong className="text-text-primary">+</strong> 即可创建代理或与多个代理发起对话。</p><p>打开 <strong className="text-text-primary">应用市场</strong> 即可探索插件和代理。在会话菜单中可以编辑代理形象和资料。通过表情转盘选择表情，滚动、拖动或使用方向键选择形状。</p><p>按回车发送，按 Shift + 回车换行。更改保存在当前浏览器。</p></div></DialogShell>}

    <div role="status" aria-live="polite" className={cx("pointer-events-none fixed bottom-5 left-1/2 z-[110] max-w-[calc(100%-32px)] -translate-x-1/2 rounded-xl border border-border-button-default bg-background-primary-default px-4 py-3 text-body-regular shadow-lg transition-opacity", notice ? "opacity-100" : "opacity-0")}>
      {notice && <span className="flex items-center gap-2"><RiCheckLine className="size-4 shrink-0 text-foreground-icon-secondary" />{notice}</span>}
    </div>
  </div>);
}
