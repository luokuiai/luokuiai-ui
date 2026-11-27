import { IntentLink as Link } from "./intent-link";
import type { ReactNode } from "react";
import {
  RiArrowLeftLine, RiArrowRightLine, RiHome5Line, RiSettings3Line, RiStackLine,
} from "@remixicon/react";
import { ThemeToggle } from "../application/theme/theme-toggle";
import { cx } from "../../utils/cx";
import { WorkspaceTeamAvatar, WorkspaceWordmark } from "./brand";
import { workspaceName } from "./identity";
import { workspaceLibrary, workspaceRoutes, workspaceTools, type WorkspaceRoute } from "./navigation";
import { SidebarNavigation } from "./sidebar-navigation";
import { RightSidebarToolbarProvider, RightSidebarToolbarSlot } from "./right-sidebar-control";

export function WorkspaceMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus-ring" aria-label={`${workspaceName} 首页`}>
      <WorkspaceWordmark alt="" className={compact ? "w-36" : "w-40"} />
    </Link>
  );
}

type WorkspaceSection = "home" | "lab" | "settings" | "model" | "harness" | (typeof workspaceLibrary)[number]["id"];
const sectionLabels: Record<WorkspaceSection, string> = {
  home: "总览", lab: "组件实验室", settings: "设置", model: "模型连接", harness: "任务执行台",
  charts: "数据图表", icons: "图标库", templates: "整页模板", admin: "AI 管理后台",
};

export function WorkspaceSidebar({ active }: { active: WorkspaceSection }) {
  const navClass = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-medium transition-colors duration-150 hover:bg-background-secondary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring";
  return (
    <aside data-titlebar-sidebar="desktop" className="sticky top-0 hidden h-dvh w-[228px] shrink-0 flex-col border-e border-separator-border bg-background-primary-default p-4 lg:flex">
      <div className="px-2 pb-8 pt-2"><WorkspaceMark /></div>
      <SidebarNavigation>
        <Link href="/" aria-current={active === "home" ? "page" : undefined} className={cx(navClass, active === "home" ? "bg-accent-500/10 text-accent-600" : "text-text-secondary")}>
          <RiHome5Line className="size-4" aria-hidden="true" />
          总览
        </Link>
        <div className="px-3 pb-1 pt-5 text-caption-1-semibold text-text-tertiary">工作空间</div>
        {[{ label: "", items: workspaceRoutes }, { label: "组件与管理", items: [...workspaceLibrary, ...workspaceTools] }].map(({ label, items }) => (
          <div key={label} className="flex flex-col gap-1">
            {label && <div className="px-3 pb-1 pt-4 text-caption-1-semibold text-text-tertiary">{label}</div>}
            {items.map(({ id, href, label: name, icon: Icon }) => (
              <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={cx(navClass, active === id ? "bg-accent-500/10 text-accent-600" : "text-text-secondary")}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />{name}
              </Link>
            ))}
          </div>
        ))}
      </SidebarNavigation>
      <div className="mt-auto flex items-center gap-3 rounded-2xl border border-separator-border bg-background-secondary-default p-3">
        <RiStackLine className="size-5 shrink-0 text-foreground-icon-secondary" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-caption-1-semibold text-text-primary">{workspaceName} 组件库</p>
          <Link href="/components" className="flex items-center gap-1 rounded-sm text-caption-2-medium text-text-secondary hover:underline focus-visible:outline-2 focus-visible:outline-border-focus-ring">
            查看全部 <RiArrowRightLine className="size-3" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

export function WorkspaceFrame({ active, children }: { active: WorkspaceSection; children: ReactNode }) {
  return (
    <div data-titlebar-page="workspace" className="flex min-h-dvh bg-background-full text-text-primary">
      <WorkspaceSidebar active={active} />
      <div className="min-w-0 flex-1">
        <header data-titlebar-header className="flex h-16 items-center justify-between gap-4 border-b border-separator-border px-5 lg:px-9">
          <div className="lg:hidden"><WorkspaceMark compact /></div>
          <div className="hidden items-center gap-2 text-body-medium lg:flex">
            <span className="text-text-tertiary">工作台</span>
            <span aria-hidden="true" className="text-text-tertiary">/</span>
            {sectionLabels[active]}
          </div>
          <div className="flex items-center gap-2"><Link href="/settings" aria-label="打开设置" className="grid size-8 place-items-center rounded-lg text-foreground-icon-secondary hover:bg-background-secondary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring"><RiSettings3Line className="size-4" aria-hidden="true" /></Link><ThemeToggle appearance="segmented" size="small" /></div>
        </header>
        <nav aria-label="组件与管理" className="flex gap-1 overflow-x-auto border-b border-separator-border px-4 py-2 lg:hidden">
          {workspaceLibrary.map(({ id, href, label }) => (
            <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={cx("shrink-0 rounded-lg px-2.5 py-1.5 text-caption-1-semibold", active === id ? "bg-accent-500/10 text-accent-600" : "text-text-secondary hover:bg-background-secondary-hover")}>
              {label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}

export function TemplateFrame({ route, children }: { route: WorkspaceRoute["id"]; children: ReactNode }) {
  const current = workspaceRoutes.find((item) => item.id === route);
  return (
    <RightSidebarToolbarProvider>
      <div data-titlebar-page="template" className="workspace-template flex h-dvh flex-col overflow-hidden bg-background-full text-text-primary">
        <header data-titlebar-header className="relative z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-separator-border bg-background-primary-default px-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-body-medium text-text-secondary hover:bg-background-secondary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring">
              <RiArrowLeftLine className="size-4" aria-hidden="true" />
              <WorkspaceTeamAvatar size="xs" />
              工作台
            </Link>
            <span className="h-4 w-px shrink-0 bg-separator-border" aria-hidden="true" />
            <strong className="truncate text-body-semibold">{current?.label}</strong>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {route !== "chat" && <span className="rounded-full bg-background-secondary-default px-2.5 py-1 text-caption-1-medium text-text-secondary">{route === "agents" ? "本地演示" : "示例数据"}</span>}
            <div className="flex items-center gap-2"><Link href="/settings" aria-label="打开设置" className="grid size-8 place-items-center rounded-lg text-foreground-icon-secondary hover:bg-background-secondary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring"><RiSettings3Line className="size-4" aria-hidden="true" /></Link><ThemeToggle appearance="segmented" size="small" /></div>
            <RightSidebarToolbarSlot />
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </RightSidebarToolbarProvider>
  );
}
