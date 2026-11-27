"use client";

import type { ReactNode } from "react";
import { RiArrowRightSLine, RiEditLine, RiPushpinLine } from "@remixicon/react";
import { AgentAvatar } from "../agent-avatar/agent-avatar";
import { SettingsCard } from "../settings/settings-rows";
import { Button } from "../../base/buttons/button";
import { CloseButton } from "../../base/buttons/close-button";
import { IconButton } from "../../base/buttons/icon-button";
import { Switch } from "../../base/switch/switch";
import { useTemplateCopy } from "../../foundations/template-copy/template-copy";
import type { Agent, Conversation } from "./data";
import { ScrollSurface } from "./scroll-surface";

type GroupSettingsProps = {
  chat: Conversation;
  members: Agent[];
  avatar: ReactNode;
  onRename: () => void;
  onManageMembers: () => void;
  onTogglePin: () => void;
  onEditMember: (agent: Agent) => void;
  onClose?: () => void;
};

export function GroupSettings({ chat, members, avatar, onRename, onManageMembers, onTogglePin, onEditMember, onClose }: GroupSettingsProps) {
  const localize = useTemplateCopy();
  const title = chat.customTitle || chat.title;

  return localize(
    <section aria-label="群聊设置" className="flex h-full min-h-0 min-w-0 flex-col bg-background-full ps-1 pe-2 text-text-primary">
      <header className="relative flex h-11 shrink-0 items-center justify-center px-8">
        <h2 className="text-body-medium">群聊设置</h2>
        {onClose && <CloseButton size="sm" aria-label="关闭群聊设置" className="absolute end-1" onClick={onClose} />}
      </header>

      <ScrollSurface className="flex-1" contentClassName="space-y-5 px-1 pb-4" surface="full" label="群聊资料与成员" fadeBottom>
        <div className="flex flex-col items-center gap-3 px-2 pb-1 pt-4">
          <div aria-hidden="true">{avatar}</div>
          <div className="flex min-w-0 max-w-full items-center justify-center gap-1.5">
            <h3 className="min-w-0 text-center text-title-3-semibold [overflow-wrap:anywhere]">{title}</h3>
            <IconButton size="small" icon={RiEditLine} aria-label="重命名群聊" title="重命名群聊" onClick={onRename}
              className="rounded-full border-0 bg-transparent text-foreground-icon-secondary shadow-none hover:bg-background-secondary-hover" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex min-w-0 items-center justify-between gap-3 ps-1">
            <h3 className="flex items-baseline gap-1.5 text-body-medium">
              群成员 <span className="text-caption-1-regular text-text-secondary">{members.length}</span>
            </h3>
            <Button size="small" variant="secondary" className="shrink-0" onClick={onManageMembers}>管理成员</Button>
          </div>
          <SettingsCard className="p-1">
            <ul aria-label="群成员" className="divide-y divide-separator-border">
              {members.map(agent => (
                <li key={agent.id}>
                  <button type="button" data-member-id={agent.id} aria-label={`编辑 ${agent.name}`} onClick={() => onEditMember(agent)}
                    className="flex w-full min-w-0 cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-start outline-none hover:bg-background-secondary-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-border-focus-ring">
                    <span aria-hidden="true" className="shrink-0"><AgentAvatar config={agent.avatar} size={32} paused /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-medium" title={agent.name}>{agent.name}</span>
                      {agent.label && <span className="block truncate text-caption-1-regular text-text-secondary" title={agent.label}>{agent.label}</span>}
                    </span>
                    <RiArrowRightSLine aria-hidden className="size-4 shrink-0 text-foreground-icon-tertiary rtl:rotate-180" />
                  </button>
                </li>
              ))}
            </ul>
          </SettingsCard>
        </div>

        <SettingsCard className="px-3">
          <Switch aria-label="置顶对话" size="sm" isSelected={!!chat.pinned} onChange={onTogglePin}
            className="min-h-12 w-full flex-row-reverse justify-between">
            <span className="flex items-center gap-2"><RiPushpinLine aria-hidden className="size-5 text-foreground-icon-secondary" />置顶对话</span>
          </Switch>
        </SettingsCard>
      </ScrollSurface>
    </section>
  );
}
