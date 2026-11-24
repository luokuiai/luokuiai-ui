"use client";

import { displayProjectName, priorityLabels } from "./project-board-data";
import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import { RiCheckLine, RiEqualizerLine, RiSideBarLine, RiSortDesc } from "@remixicon/react";
import { Checkbox } from "../../base/checkbox/checkbox";
import { Dropdown, DropdownItem, DropdownPopover, DropdownTrigger } from "../../base/dropdown/dropdown";
import { Tooltip, TooltipTrigger } from "../../base/tooltip/tooltip";
import type { TicketPriority } from "./project-board-data";

export type BoardSort = "manual" | "priority" | "title";
const TRIGGER = "relative flex size-9 shrink-0 items-center justify-center rounded-2lg border border-border-button-default bg-background-primary-default text-foreground-icon-primary shadow-xs transition-colors hover:border-border-button-hover hover:bg-background-primary-hover";
const MENU = "w-[220px] rounded-[14px] p-1";
const ROW = "rounded-2lg px-2 py-1.5 text-body-medium";

/** Private toolbar for the Project Board template. */
export function ProjectBoardControls({ sort, onSort, priority, onPriority, project, onProject, showDone, onShowDone, fillColumns, onFillColumns }: {
  sort: BoardSort;
  onSort: (sort: BoardSort) => void;
  priority: TicketPriority | "all";
  onPriority: (priority: TicketPriority | "all") => void;
  project: string;
  onProject: (project: string) => void;
  showDone: boolean;
  onShowDone: (show: boolean) => void;
  fillColumns: boolean;
  onFillColumns: (fill: boolean) => void;
}) {
  const localize = useTemplateCopy();
  const [sortOpen, setSortOpen] = useState(false);
  const filtered = priority !== "all" || project !== "all";
  return localize(<div className="flex items-center gap-2" role="group" aria-label="看板操作">
    <Dropdown isOpen={sortOpen} onOpenChange={setSortOpen}>
      <TooltipTrigger delay={200}>
        <DropdownTrigger aria-label="排序工单" className={TRIGGER}>
          <RiSortDesc className="size-5" aria-hidden />
          {sort !== "manual" && <span aria-hidden className="absolute -top-0.5 -end-0.5 size-2 rounded-full bg-accent-500 ring-2 ring-background-full" />}
        </DropdownTrigger>
        <Tooltip placement="bottom">排序</Tooltip>
      </TooltipTrigger>
      <DropdownPopover aria-label="排序工单" placement="bottom end" className={MENU}>
        {([{ id: "manual", label: "手动排列" }, { id: "priority", label: "优先级" }, { id: "title", label: "标题" }] as const).map(option =>
          <DropdownItem key={option.id} selected={sort === option.id} className={ROW} onSelect={() => { onSort(option.id); setSortOpen(false); }}>
            <span className="flex-1">{option.label}</span>{sort === option.id && <RiCheckLine className="size-4" aria-hidden />}
          </DropdownItem>)}
      </DropdownPopover>
    </Dropdown>
    <Dropdown>
      <TooltipTrigger delay={200}>
        <DropdownTrigger aria-label="筛选工单" className={TRIGGER}>
          <RiEqualizerLine className="size-5" aria-hidden />
          {filtered && <span aria-hidden className="absolute -top-0.5 -end-0.5 size-2 rounded-full bg-accent-500 ring-2 ring-background-full" />}
        </DropdownTrigger>
        <Tooltip placement="bottom">筛选</Tooltip>
      </TooltipTrigger>
      <DropdownPopover aria-label="筛选工单" placement="bottom end" className={MENU}>
        <p className="px-2 pt-2 pb-1 text-body-2-medium text-text-tertiary">优先级</p>
        {(["all", "Low", "Medium", "High", "Urgent"] as const).map(value =>
          <DropdownItem key={value} selected={priority === value} className={ROW} onSelect={() => onPriority(value)}>
            <span className="flex-1">{value === "all" ? "所有优先级" : priorityLabels[value]}</span>{priority === value && <RiCheckLine className="size-4" aria-hidden />}
          </DropdownItem>)}
        <p className="px-2 pt-2 pb-1 text-body-2-medium text-text-tertiary">项目</p>
        {["all", "vibl", "firstview", "LUOKUI-AI"].map(value =>
          <DropdownItem key={value} selected={project === value} className={ROW} onSelect={() => onProject(value)}>
            <span className="flex-1">{value === "all" ? "所有项目" : displayProjectName(value)}</span>{project === value && <RiCheckLine className="size-4" aria-hidden />}
          </DropdownItem>)}
        {filtered && <DropdownItem className={ROW} onSelect={() => { onPriority("all"); onProject("all"); }}>清除筛选</DropdownItem>}
      </DropdownPopover>
    </Dropdown>
    <Dropdown>
      <TooltipTrigger delay={200}>
        <DropdownTrigger aria-label="显示选项" className={TRIGGER}><RiSideBarLine className="size-5" aria-hidden /></DropdownTrigger>
        <Tooltip placement="bottom">显示</Tooltip>
      </TooltipTrigger>
      <DropdownPopover aria-label="显示选项" placement="bottom end" className={MENU}>
        <Checkbox isSelected={showDone} onChange={onShowDone} className={ROW}>显示已完成列</Checkbox>
        <Checkbox isSelected={fillColumns} onChange={onFillColumns} className={ROW}>填满宽屏</Checkbox>
      </DropdownPopover>
    </Dropdown>
  </div>);
}
