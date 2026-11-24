import { FOLD_CONFIG, parsePreset, type AvatarConfig } from "../agent-avatar/model";

export const AGENT_LANGUAGES = [
  { id: "zh-CN", label: "简体中文" }, { id: "auto", label: "自动识别" }, { id: "en", label: "英语" },
  { id: "tr", label: "土耳其语" }, { id: "es", label: "西班牙语" },
  { id: "fr", label: "法语" }, { id: "de", label: "德语" },
  { id: "ja", label: "日语" }, { id: "pt", label: "葡萄牙语" },
] as const;
export const AGENT_SPEECH_RATES = [0.75, 1, 1.25, 1.5] as const;
export type AgentPreferences = { voice: string; speed: number; language: typeof AGENT_LANGUAGES[number]["id"]; notifications: boolean };
export const DEFAULT_AGENT_PREFERENCES: AgentPreferences = { voice: "alice", speed: 1, language: "zh-CN", notifications: true };
export function normalizeAgentPreferences(value: Partial<AgentPreferences> | null): AgentPreferences {
  return {
    voice: typeof value?.voice === "string" ? value.voice.slice(0, 200) : DEFAULT_AGENT_PREFERENCES.voice,
    speed: AGENT_SPEECH_RATES.some(rate => rate === value?.speed) ? value!.speed! : 1,
    language: AGENT_LANGUAGES.some(language => language.id === value?.language) ? value!.language! : DEFAULT_AGENT_PREFERENCES.language,
    notifications: typeof value?.notifications === "boolean" ? value.notifications : true,
  };
}

export type Agent = { id: string; name: string; label: string; description: string; avatar: AvatarConfig; preferences?: AgentPreferences };
export type Message = { id: string; role: "user" | "agent"; agentId?: string; text: string; example?: boolean };
export type Conversation = { id: string; title: string; customTitle?: string; pinned?: boolean; agentIds: string[]; messages: Message[] };
export type Workspace = { agents: Agent[]; chats: Conversation[]; activeId: string; installedPlugins?: string[] };

const NEW_AGENT_IDENTITIES = [
  { name: "产品策划", avatar: { ...FOLD_CONFIG, foldShape: "diamond", hue: 215, saturation: 70, eyes: "curious", seed: 71 } },
  { name: "云工程师", avatar: { ...FOLD_CONFIG, foldShape: "cloud", hue: 18, saturation: 76, eyes: "thinking", seed: 82 } },
  { name: "用户支持助手", avatar: { ...FOLD_CONFIG, foldShape: "heart", hue: 135, saturation: 48, eyes: "happy", seed: 93 } },
] satisfies Pick<Agent, "name" | "avatar">[];

/** Choose an unused identity, including when restoring old unnamed demo bots. */
export function nextAgentIdentity(agents: Pick<Agent, "name">[]): Pick<Agent, "name" | "avatar"> {
  const names = new Set(agents.map(agent => agent.name.toLowerCase()));
  let index = 0;
  while (true) {
    const identity = NEW_AGENT_IDENTITIES[index % NEW_AGENT_IDENTITIES.length];
    const cycle = Math.floor(index / NEW_AGENT_IDENTITIES.length);
    const name = cycle ? `${identity.name} ${cycle + 1}` : identity.name;
    if (!names.has(name.toLowerCase())) return { name, avatar: { ...identity.avatar, hue: (identity.avatar.hue + cycle * 47) % 360, seed: identity.avatar.seed + cycle } };
    index++;
  }
}

const ADDITIONAL_AGENTS: Agent[] = [
  { id: "product", ...NEW_AGENT_IDENTITIES[0], label: "产品", description: "把想法整理成清晰的优先级、路线图和下一步行动。" },
  { id: "cloud", ...NEW_AGENT_IDENTITIES[1], label: "云服务", description: "协助设计服务器架构和云基础设施，规划部署和运维。" },
  { id: "support", ...NEW_AGENT_IDENTITIES[2], label: "使用帮助", description: "整理可执行的解答，让客户沟通清楚、有针对性。" },
  { id: "data", name: "数据分析师", label: "数据分析", description: "从数据中提炼结论、制作图表，并辅助做出决策。", avatar: { ...FOLD_CONFIG, foldShape: "pocket", hue: 205, saturation: 62, eyes: "focused", seed: 104 } },
];

export const INITIAL_AGENTS: Agent[] = [
  { id: "design", name: "落地页设计师", label: "设计", description: "规划落地页的布局和视觉层次，明确用户的下一步操作。", avatar: { ...FOLD_CONFIG, hue: 157, saturation: 37, eyes: "curious", seed: 12 } },
  { id: "content", name: "内容审校", label: "写作", description: "优化文稿结构和表达，保留你的写作风格。", avatar: { ...FOLD_CONFIG, foldShape: "pocket", hue: 25, saturation: 60, eyes: "thinking", seed: 29 } },
  { id: "marketing", name: "营销代理", label: "营销", description: "围绕目标受众和核心卖点制定营销活动。", avatar: { ...FOLD_CONFIG, foldShape: "star", hue: 179, saturation: 47, eyes: "happy", seed: 37 } },
  { id: "seo", name: "搜索优化代理", label: "搜索优化", description: "优化内容结构和检索可见性，帮助目标读者找到内容。", avatar: { ...FOLD_CONFIG, foldShape: "flower", hue: 253, saturation: 65, eyes: "neutral", seed: 42 } },
  { id: "research", name: "调研助手", label: "调研", description: "组织调研问题，核对来源，梳理证据。", avatar: { ...FOLD_CONFIG, foldShape: "petal", hue: 43, saturation: 80, eyes: "thinking", seed: 53 } },
  { id: "security", name: "安全代理", label: "安全", description: "审查访问权限、隐私保护和应用安全。", avatar: { ...FOLD_CONFIG, foldShape: "shield", hue: 181, saturation: 49, eyes: "neutral", grain: 8, seed: 64 } },
  ...ADDITIONAL_AGENTS,
];

const SAMPLE_CONVERSATIONS: Record<string, { prompt: string; reply: string }> = {
  design: { prompt: "怎样让落地页更清楚？", reply: "首屏只放一个主要操作。先说用户能获得什么，再配一张聚焦的产品预览，次要链接放到下方。\n\n接下来可以列出三项具体收益，每项附一个简短示例，帮助用户从理解产品走到实际试用。" },
  content: { prompt: "能帮我精简这封欢迎邮件吗？", reply: "可以用一句简短的感谢开场，接着说明用户的第一个操作，按钮放在说明旁边。\n\n功能导览留到后续邮件。读者看完这封邮件应当知道从哪里开始。" },
  marketing: { prompt: "发布活动应当聚焦什么？", reply: "从目标受众熟悉的问题切入，用一个前后对比的故事贯穿邮件、社交内容和落地页。\n\n先向少量受众测试两种开场，再根据反馈决定推广方向。" },
  seo: { prompt: "帮我规划博客的主题内容。", reply: "先写一份实用的主题指南，再用独立文章回答读者接下来的具体问题。\n\n每篇文章链接至指南，并给出一个相关的下一步。标题和示例应一眼能看懂。" },
  research: { prompt: "怎样准备客户访谈？", reply: "请客户回忆问题最近一次出现的场景，了解他们尝试过什么、卡在哪里、期望怎样解决。\n\n前五次访谈使用同一组核心问题，整理共性后再决定要验证的假设。" },
  security: { prompt: "邀用户参与测试前要检查什么？", reply: "先审查访问权限。确认每个请求都会检查当前账号的权限，确保账号之间的数据彼此隔离。\n\n再检查密码重置、文件上传和日志中是否含有敏感信息。把检查项整理为简短的发布清单。" },
  product: { prompt: "能帮我给首版发布排优先级吗？", reply: "首版聚焦一条完整的用户流程。选出用户能完成目标的三项必要功能，其余放到后续版本。\n\n为每个优先项写明成功条件，以便判断是否达到发布要求。" },
  cloud: { prompt: "如何部署预发布环境？", reply: "为预发布环境配置独立的数据和权限，尽量与生产环境的应用配置保持一致。\n\n自动发布前先加健康检查和回滚路径，再用小规模部署验证日志、启动行为和连通性。" },
  support: { prompt: "帮我给导入失败的客户写一封回复。", reply: "先确认已收到导入失败的反馈，再询问文件类型和错误消息，并说明收到后会检查什么。\n\n措辞清晰具体，告诉客户下一次更新的大致时间。" },
  data: { prompt: "周度仪表盘应关注什么数据？", reply: "建议同时观察激活率和周留存，以了解新用户是否获得价值，以及是否在首次访问后回来。\n\n按注册周和获客来源拆分结果，对异常变化补充简短说明。" },
};

function sampleMessages(agentId: string): Message[] {
  const sample = SAMPLE_CONVERSATIONS[agentId];
  if (!sample) return [];
  return [
    { id: `sample-request-${agentId}`, role: "user", text: sample.prompt },
    { id: `sample-reply-${agentId}`, role: "agent", agentId, example: true, text: sample.reply },
  ];
}

const STARTER_CHAT_AGENT_IDS = new Set(["design", "content", "marketing", "seo", "research", "security", "cloud"]);

export const INITIAL_WORKSPACE: Workspace = {
  agents: INITIAL_AGENTS,
  activeId: "chat-design",
  chats: INITIAL_AGENTS.filter(agent => STARTER_CHAT_AGENT_IDS.has(agent.id)).map(agent => ({
    id: `chat-${agent.id}`, title: agent.name, agentIds: [agent.id], messages: sampleMessages(agent.id),
  })),
};

const legacyAgentCopy: Record<string, [string, string, string]> = {
  design: ["landing page designer", "Design", "Thoughtful layouts, clear hierarchy, and a little personality for your next landing page."],
  content: ["content reviewer", "Writing", "Makes your writing clear, concise, and unmistakably yours."],
  marketing: ["marketing bot", "Marketing", "Turns a good idea into a campaign people remember."],
  seo: ["seo bot", "SEO", "Helps the right people discover your work through search."],
  research: ["research assistant", "Research", "Connects the dots, asks better questions, and brings the evidence."],
  security: ["Security agent", "Security", "A careful second pair of eyes for permissions, privacy, and application security."],
  product: ["Product planner", "Product", "Turns ideas into clear priorities, practical roadmaps, and manageable next steps."],
  cloud: ["Cloud engineer", "Cloud", "Helps with server architecture, cloud infrastructure, deployments, and reliable services."],
  support: ["Support guide", "Support", "Finds helpful answers and makes every customer conversation feel clear and personal."],
  data: ["Data analyst", "Analytics", "Turns data into clear insights, useful charts, and practical decisions."],
};

function localizeStarterAgent(agent: Agent): Agent {
  const original = legacyAgentCopy[agent.id];
  const localized = INITIAL_AGENTS.find(item => item.id === agent.id);
  if (!original || !localized) return agent;
  const [name, label, description] = original;
  return {
    ...agent,
    name: agent.name === name ? localized.name : agent.name,
    label: agent.label === label ? localized.label : agent.label,
    description: agent.description === description ? localized.description : agent.description,
  };
}

/** Restored data is bounded and validated before it reaches the animated renderer. */
export function restoreWorkspace(raw: string): Workspace | null {
  try {
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.agents) || !Array.isArray(data.chats) || !data.agents.length || data.agents.length > 100 || data.chats.length > 200) return null;
    let agents: Agent[] = data.agents.map((a: Agent) => {
      if (!a || typeof a.id !== "string" || typeof a.name !== "string" || !a.name.trim() || typeof a.label !== "string" || typeof a.description !== "string") throw new Error("Invalid agent");
      return { id: a.id.slice(0, 100), name: a.name.slice(0, 48), label: a.label.slice(0, 60), description: a.description.slice(0, 500), ...(a.preferences ? { preferences: normalizeAgentPreferences(a.preferences) } : {}), avatar: { ...parsePreset({ name: a.name, config: a.avatar }).config, family: "fold", lookAt: "wander" } };
    }).map(localizeStarterAgent);
    const renamed = new Set<string>();
    for (const agent of agents) {
      if (agent.name.trim().toLowerCase() !== "new bot") continue;
      Object.assign(agent, nextAgentIdentity(agents));
      renamed.add(agent.id);
    }
    const ids = new Set(agents.map(a => a.id));
    if (ids.size !== agents.length) return null;
    let chats: Conversation[] = data.chats.map((c: Conversation) => {
      if (!c || typeof c.id !== "string" || typeof c.title !== "string" || !Array.isArray(c.agentIds) || !c.agentIds.length || c.agentIds.some(id => !ids.has(id)) || new Set(c.agentIds).size !== c.agentIds.length || !Array.isArray(c.messages) || c.messages.length > 1000) throw new Error("Invalid conversation");
      let messages = c.messages.map(m => {
        if (!m || typeof m.id !== "string" || typeof m.text !== "string" || !["user", "agent"].includes(m.role) || (m.role === "agent" && (!m.agentId || !ids.has(m.agentId)))) throw new Error("Invalid message");
        return { id: m.id, role: m.role, ...(m.agentId ? { agentId: m.agentId } : {}), text: m.text.slice(0, 20000), ...(m.example === true ? { example: true } : {}) };
      });
      const sampleAgentId = c.agentIds[0];
      if (c.agentIds.length === 1 && c.id === `chat-${sampleAgentId}` && SAMPLE_CONVERSATIONS[sampleAgentId] && messages.every(message => message.id === `intro-${sampleAgentId}` || (sampleAgentId === "design" && message.id === "request-design"))) {
        messages = sampleMessages(sampleAgentId);
      }
      if (c.id === `chat-${sampleAgentId}` && c.agentIds.length === 1) {
        const localized = new Map(sampleMessages(sampleAgentId).map(message => [message.id, message]));
        messages = messages.map(message => localized.get(message.id) ?? message);
      }
      const renamedAgent = c.agentIds.length === 1 && renamed.has(c.agentIds[0]) ? agents.find(a => a.id === c.agentIds[0]) : undefined;
      return { id: c.id, title: renamedAgent && c.title.trim().toLowerCase() === "new bot" ? renamedAgent.name : c.title.slice(0, 100), agentIds: c.agentIds, messages, ...(typeof c.customTitle === "string" && c.customTitle.trim() ? { customTitle: c.customTitle.trim().slice(0, 100) } : {}), ...(typeof c.pinned === "boolean" ? { pinned: c.pinned } : {}) };
    });
    if (new Set(chats.map(c => c.id)).size !== chats.length) return null;
    // Retire unused demo additions; keep any customized agent or conversation with real messages.
    const retiredNames: Record<string, string> = { qa: "QA tester", notes: "Meeting notes", brand: "Brand strategist" };
    const retired = new Set(agents.filter(agent => retiredNames[agent.id] === agent.name && !chats.some(chat => chat.agentIds.includes(agent.id) && (chat.agentIds.length > 1 || chat.messages.some(message => message.id !== `intro-${agent.id}`)))).map(agent => agent.id));
    agents = agents.filter(agent => !retired.has(agent.id));
    chats = chats.filter(chat => !chat.agentIds.some(id => retired.has(id)));
    // Remove only untouched surplus starter chats; keep all agents available in the picker.
    chats = chats.filter(chat => {
      const agent = agents.find(agent => agent.id === chat.agentIds[0]);
      const original = INITIAL_AGENTS.find(initial => initial.id === agent?.id);
      if (!agent || !original || STARTER_CHAT_AGENT_IDS.has(agent.id) || chat.id !== `chat-${agent.id}` || chat.agentIds.length !== 1 || chat.customTitle || chat.pinned || chat.title !== original.name) return true;
      const customized = agent.name !== original.name || agent.label !== original.label || agent.description !== original.description || agent.preferences || Object.entries(original.avatar).some(([key, value]) => agent.avatar[key as keyof AvatarConfig] !== value);
      const samples = sampleMessages(agent.id);
      const untouched = chat.messages.length === samples.length && chat.messages.every((message, index) => Object.entries(samples[index]).every(([key, value]) => message[key as keyof Message] === value));
      return !!customized || !untouched;
    });
    // Upgrade older demos without replacing edited agents, chats, or prior renamed placeholders.
    for (const agent of ADDITIONAL_AGENTS) {
      if (agents.length >= 100 || chats.length >= 200) break;
      if (agents.some(existing => existing.id === agent.id || existing.name.toLowerCase() === agent.name.toLowerCase())) continue;
      agents.push({ ...agent, avatar: { ...agent.avatar } });
      if (!STARTER_CHAT_AGENT_IDS.has(agent.id)) continue;
      let chatId = `chat-${agent.id}`;
      while (chats.some(chat => chat.id === chatId)) chatId += "-new";
      chats.push({ id: chatId, title: agent.name, agentIds: [agent.id], messages: sampleMessages(agent.id) });
    }
    const installedPlugins = Array.isArray(data.installedPlugins) ? [...new Set(data.installedPlugins.filter((id: unknown): id is string => typeof id === "string" && /^[a-z-]{1,40}$/.test(id)))].slice(0, 100) as string[] : undefined;
    return { agents, chats, ...(installedPlugins ? { installedPlugins } : {}), activeId: chats.some(c => c.id === data.activeId) ? data.activeId : chats[0]?.id ?? "" };
  } catch { return null; }
}

export function conversationFor(agents: Agent[], ids: string[], id: string): Conversation {
  const selected = [...new Set(ids)].flatMap(id => agents.find(agent => agent.id === id) ?? []);
  return { id, title: selected.map(a => a.label || a.name).join(" + "), agentIds: selected.map(a => a.id), messages: [] };
}

/** Update membership without dropping historical replies or changing the conversation identity. */
export function updateConversationAgents(workspace: Workspace, chatId: string, agentIds: string[]): Workspace {
  const membership = conversationFor(workspace.agents, agentIds, chatId);
  if (!membership.agentIds.length) return workspace;
  return { ...workspace, chats: workspace.chats.map(chat => chat.id === chatId ? { ...chat, agentIds: membership.agentIds, title: membership.title } : chat) };
}

export function removeConversation(workspace: Workspace, chatId: string): Workspace {
  const chats = workspace.chats.filter(chat => chat.id !== chatId);
  return { ...workspace, chats, activeId: workspace.activeId === chatId ? chats[0]?.id ?? "" : workspace.activeId };
}

/** Ten authored directions, rotated per agent so follow-up messages stay varied. */
export const DEMO_ANSWERS = [
  "可以先确定一个受众和一个目标，明确最重要的操作。首版验证通过后，再补充真正有帮助的信息。",
  "建议比较两种方案。保持内容一致，分别验证更直接和更有辨识度的表达，再选择能更快讲清核心想法的方案。",
  "从用户能获得的价值倒推：他们要先了解什么，需要什么证据，下一步可以做什么？按这个顺序组织内容。",
  "先检查核心承诺是否具体、每段是否回答实际问题，以及关键内容能否一眼找到。优先解决最大的理解障碍。",
  "开头先给明确结果和一个具体例子，次要信息放到后面。用简洁的标题展示各部分之间的关系。",
  "使用受众熟悉的表达和能识别的场景。选一个细节体现个性，其余部分保持易读。",
  "动手扩展前先验证核心假设。请几个人完成同一项任务，问他们卡在哪一步、原本期待发生什么。",
  "也要检查首次访问、空结果、长内容、慢连接和小屏幕。每个状态都应说明发生了什么，以及下一步可以做什么。",
  "可以分三轮推进：先确认结构和操作，再调整措辞与示例，最后对照原目标验收。",
  "下一轮只改最不确定的一处，定义改善标准，再与当前版本比较。",
] as const;

/** Bring previously saved demo replies into the current paragraph treatment. */
export function formatDemoReply(text: string): string {
  const footer = "\n\nThis is a sample response from the interactive template.";
  if (!text.startsWith("For “") || !text.endsWith(footer)) return text;
  const body = text.slice(0, -footer.length).replace(/^For “[\s\S]*?”:\n\n/u, "");
  const paragraphs = body.split(/\n\s*\n/u);
  return [paragraphs.slice(0, 2).join(" "), paragraphs.slice(2).join(" ")].filter(Boolean).join("\n\n");
}

export function demoReply(agent: Agent, turn = 0): string {
  const suggestions: Record<string, string> = {
    design: "我会先确定标题、视觉层次和主要操作，再检查桌面与手机布局。",
    content: "我会先明确主要结论，缩短开头，再用实例替换模糊的描述，并保持语气一致。",
    marketing: "我会先明确受众和卖点，再比较三个活动角度。每次测试一条信息。",
    seo: "我会梳理搜索意图，使页面聚焦一个主题，再检查标题、分节和内部链接。",
    research: "我会把问题拆成可核对的子问题，收集一手来源，区分已知事实和待验证假设。",
    security: "我会先梳理数据流与权限边界，再检查权限、输入校验和敏感数据的存储。",
  };
  const offset = Math.max(0, INITIAL_AGENTS.findIndex(a => a.id === agent.id));
  const answer = DEMO_ANSWERS[(Math.max(0, Math.floor(turn)) + offset) % DEMO_ANSWERS.length];
  return `${suggestions[agent.id] ?? `我会从「${agent.label || agent.name}」的角度来分析。`} ${answer}`;
}
