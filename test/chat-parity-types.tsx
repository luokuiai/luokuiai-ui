import type { JSX } from "react";
import { createRef } from "react";
import { AgentChat } from "../workspace-ui/components/application/agent-chat/agent-chat";
import { AgentChatHistory } from "../workspace-ui/components/application/agent-chat/agent-chat-history";
import { AgentChatActions, type AgentChatActionsProps } from "../workspace-ui/components/application/agent-chat/agent-chat-actions";
import { AgentMessage, type AgentMessageProps } from "../workspace-ui/components/application/agent-chat/agent-chat-message";
import { AgentComposer, type AgentComposerProps } from "../workspace-ui/components/application/agent-chat/agent-composer";
import { AiChatCodePanel } from "../workspace-ui/components/application/ai-chat/ai-chat-code-panel";
import { AiChatGalleryPanel } from "../workspace-ui/components/application/ai-chat/ai-chat-gallery-panel";
import { MultiAgentChat } from "../workspace-ui/components/application/multi-agent-chat/multi-agent-chat";

const stop = () => {};
<AgentChat contained demoOnly onLogout={null} settingsHref="/workspace/settings" />;
<AgentChat onLogout={stop} />;
<AgentChatHistory activeId="" threads={[]} onSelect={stop} onRename={stop} onDelete={stop}
  onToggleUnread={stop} onNewChat={stop} onExport={stop} onLogout={null} />;
const common = { busy: false, onStop: stop, messageCount: 0 };
const controlled: AgentComposerProps = { ...common, value: "draft", onValueChange: text => text.trim(), onSubmit: stop };
controlled.onSubmit();
<AgentComposer {...controlled} />;
<AgentComposer {...common} formRef={createRef<HTMLFormElement>()} onSubmit={text => text.trim()} />;

const actions = { onExport: stop, onDelete: stop, onToggleUnread: stop };
const staticActions: AgentChatActionsProps = { ...actions, transcript: "available immediately" };
staticActions.transcript.trim();
<AgentChatActions {...staticActions} />;
<AgentChatActions {...actions} unread getTranscript={() => "current streamed text"} />;

const message: (props: AgentMessageProps) => JSX.Element | null = AgentMessage;
void message;
<AiChatCodePanel />;
<AiChatCodePanel width={420} isExpanded={false} onToggleExpand={stop} />;
<AiChatGalleryPanel generated={[]} />;
<AiChatGalleryPanel width="60%" isExpanded onToggleExpand={stop} animateOnEntry />;

<MultiAgentChat storageKey={null} defaultEditorId={null}
  onRespond={async (agent, messages, signal) => signal.aborted ? "" : agent.name + messages.length} />;
