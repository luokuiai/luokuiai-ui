"use client";

import { SlidingMobilePanel } from "./mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { ContributionsCard } from "./contributions-card";
import { CustomersTable } from "./customers-table";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { EarningsChartCard } from "./earnings-chart-card";
import { RecentHiresCard } from "./recent-hires-card";
import { LineChartCard } from "./line-chart-card";
import { StatCards } from "./stat-cards";
import { cx } from "../../../utils/cx";

/**
 * Responsive layout host for the dashboard template.
 *
 *   lg+       sidebar sits in-flow (collapsible via its own control)
 *   below lg  sidebar is hidden; the header shows a hamburger that opens it
 *             as a slide-in drawer with a backdrop
 *
 * Content blocks stack / reflow at their own breakpoints (see each block).
 */
export function DashboardShell({ contained = false }: { contained?: boolean } = {}) {
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
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar remains beneath the dashboard content. */}
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
          <DashboardSidebar mobile flat onClose={() => setMobileOpen(false)} />
        </div>
      </SlidingMobilePanel>

      <main
        data-nav-open={mobileOpen || undefined}
        className={cx(
          navMotion.pushContent, "relative z-20 flex min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto bg-background-full p-3 sm:pt-6 lg:z-0",
          // Contained, the frame around this is a fixed window: the main
          // column keeps its own scrollbar so the rail beside it stays put,
          // instead of the whole shell scrolling and dragging the rail off
          // the top. Standalone, the page scrolls as it should.
          !contained && "lg:overflow-visible",
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          tabIndex={-1}
          aria-hidden={!mobileOpen}
          onClick={() => setMobileOpen(false)}
          data-nav-open={mobileOpen || undefined}
          className={cx(
            navMotion.pushBackdrop, "absolute inset-0 z-50 cursor-pointer rounded-[inherit] bg-text-primary/10 lg:hidden",
            mobileOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        />
        <div className="flex w-full max-w-[1300px] flex-col gap-2.5">
          <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col items-stretch gap-4 xl:flex-row xl:items-start">
              <RecentHiresCard />
              <EarningsChartCard />
            </div>
            <div className="flex w-full flex-col items-stretch gap-4 lg:flex-row lg:items-start">
              <LineChartCard className="h-[337px]" />
              <ContributionsCard />
            </div>
            <StatCards />
            <CustomersTable />
          </div>
        </div>
      </main>
    </div>
  ));
}
