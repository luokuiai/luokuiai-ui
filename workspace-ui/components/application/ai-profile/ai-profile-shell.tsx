"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import { RiMenuLine } from "@remixicon/react";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { AgentsChartCard } from "./agents-chart-card";
import { AiProfileCard } from "./ai-profile-card";
import { TokensChartCard } from "./tokens-chart-card";
import { starterNav } from "../app-shell/app-shell";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { IconButton } from "../../base/buttons/icon-button";
import { cx } from "../../../utils/cx";

/**
 * Figma source: Board UI → "ai profile" (node 4063:5675, 1440×900). Same
 * floating sidebar / mobile-drawer shell as `MedicalShell` — the content is
 * a single centered 680px column: profile card, agents bar chart, tokens
 * line chart, stacked with a 16px gap.
 */
export function AiProfileShell({ contained = false }: { contained?: boolean } = {}) {
  const localize = useTemplateCopy();
  const [mobileOpen, setMobileOpen] = useState(false);

  return localize((
    <div
      className={cx(
        "relative flex w-full bg-background-full max-lg:overflow-hidden",
        contained && "overflow-hidden",
        contained
          ? "h-[var(--template-preview-height)]"
          : "h-dvh lg:h-auto lg:min-h-screen",
      )}
    >
      {/* Desktop sidebar (in-flow) */}
      <div
        className={cx(
          "sticky top-3 z-10 hidden shrink-0 py-0 ps-3 lg:block",
          contained
            ? "h-[calc(var(--template-preview-height)-24px)]"
            : "h-[calc(100vh-24px)]",
        )}
      >
        <DashboardSidebar selected="profile" items={starterNav("")} showThemeToggle={false} />
      </div>

      {/* The mobile sidebar stays beneath the page while its contents reveal. */}
      <SlidingMobilePanel
        className={cx(
          "start-0 z-10 flex w-[272px] py-3 ps-[6px] lg:hidden",
          contained
            ? "absolute top-0 h-[var(--template-preview-height)]"
            : "fixed inset-y-0",
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
          <DashboardSidebar mobile flat selected="profile" items={starterNav("")} showThemeToggle={false} onClose={() => setMobileOpen(false)} />
        </div>
      </SlidingMobilePanel>

      <main
        data-nav-open={mobileOpen || undefined}
        className={cx(
          navMotion.pushContent, "relative z-20 flex min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto bg-background-full p-3 sm:p-6 lg:z-0",
          // Contained, the frame around this is a fixed window: the main
          // column keeps its own scrollbar so the rail beside it stays put,
          // instead of the whole shell scrolling and dragging the rail off
          // the top. Standalone, the page scrolls as it should.
          !contained && "lg:overflow-visible",
        )}
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
        <div className="flex w-full max-w-[680px] flex-col items-center gap-4">
          <div id="activity" className="relative w-full">
            <IconButton
              icon={RiMenuLine}
              size="medium"
              aria-label="打开导航"
              onClick={() => setMobileOpen(true)}
              className="absolute top-3 start-3 z-10 rounded-full lg:hidden"
            />
            <AiProfileCard />
          </div>
          <AgentsChartCard />
          <TokensChartCard />
        </div>
      </main>
    </div>
  ));
}
