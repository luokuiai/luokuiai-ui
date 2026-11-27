"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { BarListCard } from "../charts/bar-list-card";
import { ComboChartCard } from "../charts/combo-chart-card";
import { RadarChartCard } from "../charts/radar-chart-card";
import { StageBarsCard } from "../charts/stage-bars-card";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { RecentHiresCard } from "../dashboard/recent-hires-card";
import { StatCards } from "../dashboard/stat-cards";
import { EmployeesTable } from "./employees-table";
import {
  ATTRITION_LINE,
  ENGAGEMENT_RANGES,
  GROWTH_RANGES,
  HIRES_BAR,
  HR_STATS,
  PIPELINE_RANGES,
  TEAM_TABS,
} from "./hr-data";
import { HrHeader } from "./hr-header";
import { cx } from "../../../utils/cx";

/**
 * HR management template — same floating sidebar / mobile-drawer shell as
 * `DashboardShell` and `MedicalShell`. KPI stat cards, then a 3-up row
 * (recent hires, hiring pipeline stage bars, engagement score radar), a
 * 2-up row (hires vs. attrition combo, team breakdown bar list), and the
 * employees data table.
 */
export function HrShell({ contained = false }: { contained?: boolean } = {}) {
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
        <DashboardSidebar selected="hr" />
      </div>

      {/* Mobile sidebar remains beneath the HR dashboard content. */}
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
          <DashboardSidebar
            mobile
            flat
            selected="hr"
            onClose={() => setMobileOpen(false)}
          />
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
          <HrHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="flex w-full flex-col gap-4">
            <StatCards stats={HR_STATS} />
            {/* 3-up chart row: at md (tablet) the cards flow 2-per-row with
                the radar stretched across the empty cell; xl is 3 across. */}
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <RecentHiresCard />
              <StageBarsCard title="Hiring pipeline" ranges={PIPELINE_RANGES} />
              <RadarChartCard
                variant="score"
                title="Team engagement"
                ranges={ENGAGEMENT_RANGES}
                alertBelow={60}
                className="md:col-span-2 xl:col-span-1"
              />
            </div>
            {/* 2-up row: hires vs. attrition, and where the team comes from. */}
            <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
              <ComboChartCard
                title="Hires"
                bar={HIRES_BAR}
                line={ATTRITION_LINE}
                ranges={GROWTH_RANGES}
                tiles
              />
              <BarListCard tabs={TEAM_TABS} metricLabel="People" metric="value" />
            </div>
            <EmployeesTable />
          </div>
        </div>
      </main>
    </div>
  ));
}
