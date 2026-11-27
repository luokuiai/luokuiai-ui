import { IntentLink as Link } from "./intent-link";
import { RiArrowRightLine, RiArrowRightUpLine } from "@remixicon/react";
import { WorkspaceWordmark } from "./brand";
import { WorkspaceFrame } from "./chrome";
import { HeroAgents } from "./hero-agents";
import { workspaceLibrary, workspaceRoutes } from "./navigation";
import { cx } from "../../utils/cx";

const linkArrowClass = "size-4 text-foreground-icon-tertiary group-hover:text-foreground-icon-primary";

export function WorkspaceOverview() {
  return (
    <WorkspaceFrame active="home">
      <main className="mx-auto flex w-full max-w-[1336px] flex-col gap-8 px-5 py-7 sm:px-8 lg:px-9 lg:py-9">
        <section aria-labelledby="workspace-title" className="relative isolate flex min-h-[286px] items-center overflow-hidden rounded-3xl bg-accent-950 p-6 text-text-white sm:p-9 lg:p-10">
          <HeroAgents />
          <div className="relative z-10 flex w-full flex-col items-start gap-4 sm:w-[54%]">
            <WorkspaceWordmark inverse className="w-40" />
            <h1 id="workspace-title" className="text-display-4-semibold lg:text-display-3-semibold">与 AI 一起工作</h1>
            <p className="max-w-[370px] text-headline-regular text-accent-100">从流式对话到多代理协作，打开一个场景，或在实验室试用每个 AI 组件。</p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/chat" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-accent-500 px-4 text-body-semibold text-text-white transition-colors duration-150 hover:bg-accent-600 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-200">
                开始对话 <RiArrowRightLine aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/components" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-accent-200/30 bg-accent-100/5 px-4 text-body-semibold text-text-white transition-colors duration-150 hover:bg-accent-100/15 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-200">
                浏览 AI 组件
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="library-title" className="flex flex-col gap-4">
          <h2 id="library-title" className="text-title-1-semibold">组件、模板与管理</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {workspaceLibrary.map(({ id, href, label, description, icon: Icon, tone }) => (
              <Link key={id} href={href} className="group flex flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-5 transition-colors hover:border-border-button-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring">
                <div className="flex items-center justify-between">
                  <span className={cx("grid size-9 place-items-center rounded-xl", tone)}><Icon aria-hidden="true" className="size-5" /></span>
                  <RiArrowRightUpLine aria-hidden="true" className={linkArrowClass} />
                </div>
                <div className="grid gap-1">
                  <h3 className="text-title-3-semibold">{label}</h3>
                  <p className="text-body-regular text-text-secondary">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="spaces-title" className="flex flex-col gap-4">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="spaces-title" className="text-title-1-semibold">打开工作空间</h2>
            <span className="text-caption-1-medium text-text-tertiary">{workspaceRoutes.length} 个入口</span>
          </header>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {workspaceRoutes.map(({ id, href, label, description, icon: Icon, tone, category }) => (
              <Link key={id} href={href} className={cx(
                "group flex min-h-[148px] flex-col gap-3 rounded-3xl border border-border-button-default bg-background-primary-default p-5 transition-colors duration-150 hover:border-border-button-hover hover:bg-background-primary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring",
                id === "lab" && "sm:col-span-full sm:min-h-0",
              )}>
                <div className="flex items-center justify-between gap-2">
                  <span className={cx("grid size-9 place-items-center rounded-xl", tone)}><Icon aria-hidden="true" className="size-[19px]" /></span>
                  <span className="flex items-center gap-2 text-caption-1-medium text-text-tertiary">
                    {category}<RiArrowRightUpLine aria-hidden="true" className={linkArrowClass} />
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-title-3-semibold">{label}</h3>
                  <p className="text-body-regular text-text-secondary">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </WorkspaceFrame>
  );
}
