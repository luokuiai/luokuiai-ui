"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { HeatmapChartCard } from "../charts/heatmap-chart-card";
import { RadialChartCard } from "../charts/radial-chart-card";
import { SankeyChartCard } from "../charts/sankey-chart-card";
import { ScatterChartCard } from "../charts/scatter-chart-card";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { StatCards } from "../dashboard/stat-cards";
import {
  CASH_FLOW_RANGES,
  currency,
  FINANCE_STATS,
  percent,
  PORTFOLIO_RANGES,
  SPENDING_HEAT_RANGES,
  SPENDING_RANGES,
} from "./finance-data";
import { FinanceHeader } from "./finance-header";
import { TransactionsTable } from "./transactions-table";
import { cx } from "../../../utils/cx";

/**
 * Finance template — same floating sidebar / mobile-drawer shell as
 * `DashboardShell` and `MedicalShell`. KPI stat cards, a full-width
 * cash-flow sankey, a 3-up row (spending rings, portfolio bubbles, daily
 * spending heatmap), and the transactions data table.
 */
export function FinanceShell({ contained = false }: { contained?: boolean } = {}) {
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
        <DashboardSidebar selected="finance" />
      </div>

      {/* Mobile sidebar remains beneath the finance dashboard content. */}
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
            selected="finance"
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
          <FinanceHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="flex w-full flex-col gap-4">
            <StatCards stats={FINANCE_STATS} />
            {/* Hero card: where the money comes from and where it goes. */}
            <SankeyChartCard
              title="Cash flow"
              ranges={CASH_FLOW_RANGES}
              format={currency}
              axisLabels={["Income", "Spending"]}
            />
            {/* 3-up chart row: at md (tablet) the cards flow 2-per-row with
                the heatmap stretched across the empty cell; xl is 3 across. */}
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <RadialChartCard
                title="Spending by category"
                ranges={SPENDING_RANGES}
                format={currency}
              />
              <ScatterChartCard
                title="Portfolio"
                ranges={PORTFOLIO_RANGES}
                axisLabels={["Risk score", "Return"]}
                format={percent}
              />
              <HeatmapChartCard
                title="Daily spending"
                ranges={SPENDING_HEAT_RANGES}
                format={currency}
                columnLabelEvery={2}
                className="md:col-span-2 xl:col-span-1"
              />
            </div>
            <TransactionsTable />
          </div>
        </div>
      </main>
    </div>
  ));
}
