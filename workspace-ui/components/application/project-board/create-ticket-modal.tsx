"use client";

import { displayProjectName, priorityLabels } from "./project-board-data";
import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useDirection } from "../../foundations/direction/direction";
import { useRef, useState, type ReactNode } from "react";
import { Dialog, Form, Modal, ModalOverlay, TextArea, TextField } from "react-aria-components";
import { RiAddFill, RiArrowRightSLine, RiFolder6Line } from "@remixicon/react";
import { Avatar } from "../../base/avatar/avatar";
import { Chip } from "../../base/badges/chip";
import { Button } from "../../base/buttons/button";
import { CloseButton } from "../../base/buttons/close-button";
import { Select, SelectItem } from "../../base/select/select";
import { Switch } from "../../base/switch/switch";
import { cx } from "../../../utils/cx";
import { TicketAssigneeIcon, TicketStatusIcon, TicketUrgencyIcon } from "./project-board-icons";
import { TicketGenieSurface } from "./ticket-genie-surface";
import styles from "./create-ticket-modal.module.css";
import { PROJECT_MEMBERS, type ProjectColumn, type TicketPriority } from "./project-board-data";

export type NewProjectTicket = {
  title: string;
  description: string;
  columnId: string;
  priority: TicketPriority;
  project: string;
  assignees: string[];
};

const priorities: TicketPriority[] = ["Low", "Medium", "High", "Urgent"];
const projects = ["vibl", "firstview", "LUOKUI-AI"];
const priorityStyles: Record<TicketPriority, string> = {
  Low: "bg-indigo-200 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300",
  Medium: "bg-status-yellow-background text-status-yellow-text",
  High: "bg-status-orange-background text-status-orange-text",
  Urgent: "bg-status-rose-background text-status-rose-text",
};

function PriorityChip({ priority }: { priority: TicketPriority }) {
  const localize = useTemplateCopy();
  return localize(<Chip className={cx("px-[7px] py-[3px]", priorityStyles[priority])}>{priorityLabels[priority]}</Chip>);
}

function TicketSelect({ label, value, onChange, renderValue, children }: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  renderValue: ReactNode;
  children: ReactNode;
}) {
  const localize = useTemplateCopy();
  return localize((
    <Select
      aria-label={label}
      selectedKey={value}
      onSelectionChange={(key) => key != null && onChange(String(key))}
      renderValue={<span className="flex items-center gap-1.5">{renderValue}</span>}
      triggerClassName="w-auto justify-start rounded-md border-0 bg-transparent p-0 text-body-medium text-text-secondary shadow-none hover:bg-background-primary-hover [&>svg]:hidden"
      popoverClassName="z-[110] w-[220px]"
    >
      {children}
    </Select>
  ));
}

/** Private template dialog. Figma default 4491:12600 and filled 4492:12735. */
export function CreateTicketModal({ isOpen, onClose, initialColumnId, columns, code, onCreate }: {
  isOpen: boolean;
  onClose: () => void;
  initialColumnId?: string;
  columns: ProjectColumn[];
  code: string;
  onCreate: (ticket: NewProjectTicket) => void;
}) {
  const localize = useTemplateCopy();
  const direction = useDirection();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState<string | null>(initialColumnId ?? null);
  const [priority, setPriority] = useState<TicketPriority | null>(null);
  const [assignee, setAssignee] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);
  const [keepCreating, setKeepCreating] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const member = assignee ? PROJECT_MEMBERS[assignee] : null;
  const selectedColumn = columns.find((column) => column.id === columnId);

  return localize((
    <ModalOverlay dir={direction}
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      isDismissable
      className="fixed inset-0 z-100 flex items-end justify-center overflow-clip px-4 pt-4 pb-10"
    >
      <Modal className={cx("w-[560px] max-w-full outline-none", styles.panel)}>
        <TicketGenieSurface exiting={!isOpen}>
        <Dialog aria-label="创建工单" className="max-h-[calc(100dvh-56px)] overflow-y-auto rounded-3xl bg-background-primary-default p-4 outline-none">
          <Form
            className="flex flex-col gap-12"
            onSubmit={(event) => {
              event.preventDefault();
              if (!title.trim()) {
                titleRef.current?.focus();
                return;
              }
              onCreate({
                title: title.trim(), description: description.trim(),
                columnId: columnId ?? "todo", priority: priority ?? "Low",
                project: project ?? "LUOKUI-AI", assignees: member ? [member.id] : [],
              });
              if (keepCreating) {
                setTitle("");
                setDescription("");
                titleRef.current?.focus();
              } else onClose();
            }}
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-0.5 text-body-2-medium text-text-secondary">
                  <span className="truncate">LUOKUI-AI 设计任务</span>
                  <RiArrowRightSLine className="size-[15px] shrink-0 text-foreground-icon-tertiary rtl:rotate-180" aria-hidden />
                  <span>{code}</span>
                  <RiArrowRightSLine className="size-[15px] shrink-0 text-foreground-icon-tertiary rtl:rotate-180" aria-hidden />
                  <span className="whitespace-nowrap">新建工单</span>
                </div>
                <CloseButton size="sm" aria-label="关闭新建工单" onClick={onClose} />
              </div>
              <div className="flex flex-col gap-1.5">
                <TextField aria-label="工单标题" name="title" value={title} onChange={setTitle} isRequired className="relative grid text-headline-medium text-text-primary">
                  <span aria-hidden className="invisible min-h-[22px] whitespace-pre-wrap wrap-anywhere">{title || "输入工单标题"}{"\u200b"}</span>
                  <TextArea ref={titleRef} autoFocus rows={1} maxLength={200} placeholder="输入工单标题" className="absolute inset-0 size-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none placeholder:text-text-secondary" />
                </TextField>
                <TextField aria-label="说明" name="description" value={description} onChange={setDescription} className="relative grid max-h-[200px] text-body-medium text-text-secondary max-sm:text-[16px]">
                  <span aria-hidden className="invisible min-h-5 whitespace-pre-wrap wrap-anywhere">{description || "输入工单说明"}{"\u200b"}</span>
                  <TextArea rows={1} maxLength={5000} placeholder="输入工单说明" className="absolute inset-0 size-full resize-none border-0 bg-transparent p-0 outline-none placeholder:text-text-tertiary" />
                </TextField>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <TicketSelect label="状态" value={columnId} onChange={setColumnId} renderValue={selectedColumn ? <><TicketStatusIcon status={selectedColumn.id} />{selectedColumn.title}</> : <><RiAddFill className="size-5 text-foreground-icon-tertiary" aria-hidden /><span className="text-text-tertiary">状态</span></>}>
                  {columns.map((column) => <SelectItem key={column.id} id={column.id} textValue={column.title}><TicketStatusIcon status={column.id} className="text-foreground-icon-secondary" />{column.title}</SelectItem>)}
                </TicketSelect>
                <TicketSelect label="紧急程度" value={priority} onChange={(value) => setPriority(value as TicketPriority)} renderValue={priority ? <PriorityChip priority={priority} /> : <><TicketUrgencyIcon className="size-[18px] text-foreground-icon-tertiary" aria-hidden /><span className="text-text-tertiary">紧急程度</span></>}>
                  {priorities.map((value) => <SelectItem key={value} id={value} textValue={priorityLabels[value]}><PriorityChip priority={value} /></SelectItem>)}
                </TicketSelect>
                <TicketSelect label="负责人" value={assignee} onChange={setAssignee} renderValue={member ? <><Avatar src={member.avatar} initials={member.initials} className="size-[18px]" /><span>{member.name}</span></> : <><TicketAssigneeIcon className="size-[18px] text-foreground-icon-tertiary" aria-hidden /><span className="text-text-tertiary">负责人</span></>}>
                  <SelectItem id="unassigned" textValue="未分配"><TicketAssigneeIcon className="size-[18px] text-foreground-icon-secondary" aria-hidden />未分配</SelectItem>
                  {Object.values(PROJECT_MEMBERS).map((person) => <SelectItem key={person.id} id={person.id} textValue={person.name}><Avatar size="xs" src={person.avatar} initials={person.initials} />{person.name}</SelectItem>)}
                </TicketSelect>
                <TicketSelect label="项目" value={project} onChange={setProject} renderValue={<><RiFolder6Line className="size-[18px] text-text-primary opacity-30" aria-hidden /><span className={project ? "text-text-secondary" : "text-text-tertiary"}>{project ? displayProjectName(project) : "项目"}</span></>}>
                  {projects.map((value) => <SelectItem key={value} id={value} textValue={displayProjectName(value)}><RiFolder6Line className="size-[18px] text-foreground-icon-secondary" aria-hidden />{displayProjectName(value)}</SelectItem>)}
                </TicketSelect>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Switch size="sm" isSelected={keepCreating} onChange={setKeepCreating}>
                  <span className="text-body-2-medium text-text-tertiary">连续创建</span>
                </Switch>
                <div className="ms-auto flex gap-2.5">
                  <Button type="button" variant="secondary" onClick={onClose}>取消</Button>
                  <Button type="submit">创建工单</Button>
                </div>
              </div>
            </div>
          </Form>
        </Dialog>
        </TicketGenieSurface>
      </Modal>
    </ModalOverlay>
  ));
}
