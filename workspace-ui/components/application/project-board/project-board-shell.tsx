"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";
import { useState } from "react";
import navMotion from "../../../styles/sidebar-motion.module.css";

import { starterNav } from "../app-shell/app-shell";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { cx } from "../../../utils/cx";
import { ProjectBoard } from "./project-board";

/**
 * Figma source: Board UI → kanbanboard (node 4472:12159, 1440×900).
 *
 * The layout follows the Figma frame: 12px floating sidebar
 * inset, content at x=296, 24px header inset, 10px header-to-board gap, and
 * five 273px columns, expanding equally to fill spare space above 1440px.
 * The board scrolls horizontally when they do not fit, with scrollable gutters
 * extending to both edges of the main area; navigation
 * moves into the shared mobile drawer below the sidebar breakpoint.
 */
export function ProjectBoardShell({ contained = false }: { contained?: boolean } = {}) {
  const localize = useTemplateCopy();
  const [mobileOpen, setMobileOpen] = useState(false);

  return localize((
    <div
      className={cx(
        "relative flex w-full overflow-hidden bg-background-full",
        contained ? "h-[var(--template-preview-height)]" : "h-dvh",
      )}
    >

      <div
        className={cx(
          "sticky top-3 z-10 hidden shrink-0 ps-3 lg:block",
          contained ? "h-[calc(var(--template-preview-height)-24px)]" : "h-[calc(100dvh-24px)]",
        )}
      >
        <DashboardSidebar selected="project-board" items={starterNav("")} showThemeToggle={false} />
      </div>

      <SlidingMobilePanel
        className={cx(
          "start-0 z-10 flex w-[272px] py-3 ps-[6px] lg:hidden",
          contained ? "absolute top-0 h-[var(--template-preview-height)]" : "fixed inset-y-0",
        )}
        isOpen={mobileOpen}
        onOpenChange={setMobileOpen}
      >
        <div
          data-nav-open={mobileOpen || undefined}
          className={cx(
            navMotion.pushSidebar, "h-full w-[260px] origin-left rtl:origin-right",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <DashboardSidebar
            mobile
            flat
            selected="project-board" items={starterNav("")} showThemeToggle={false}
            onClose={() => setMobileOpen(false)}
          />
        </div>
      </SlidingMobilePanel>

      <main
        data-nav-open={mobileOpen || undefined}
        className={cx(navMotion.pushContent, "relative z-20 flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background-full p-3 sm:px-6 sm:pt-6 sm:pb-[22px] lg:z-0 lg:pe-7")}
      >
        <button
          type="button"
          aria-label="关闭导航"
          tabIndex={-1}
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
          data-nav-open={mobileOpen || undefined}
          className={cx(
            navMotion.pushBackdrop, "absolute inset-0 z-50 cursor-pointer rounded-[inherit] bg-black/10 dark:bg-white/5 lg:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        />
        <ProjectBoard onMenuClick={() => setMobileOpen(true)} />
      </main>
    </div>
  ));
}
