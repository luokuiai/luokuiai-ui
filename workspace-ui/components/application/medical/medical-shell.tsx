"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { DashboardSidebar } from "../dashboard/dashboard-sidebar";
import { ActivityRingsCard } from "./activity-rings-card";
import { ImportantAlertsCard } from "./important-alerts-card";
import type { SelectedDay } from "./medical-data";
import { MedicalHeader } from "./medical-header";
import { MostActiveDaysCard } from "./most-active-days-card";
import { PatientInfoCard } from "./patient-info-card";
import { PatientsTable } from "./patients-table";
import { SleepScoreCard } from "./sleep-score-card";
import { StepsCard } from "./steps-card";
import { cx } from "../../../utils/cx";

/**
 * Figma source: Board UI → "medical profile dashboard" (node 3950:5573,
 * 1440×900). Same floating sidebar / mobile-drawer shell as `DashboardShell`
 * and `CalendarShell` — two rows of three 330px-tall cards (node 3950:5655),
 * then the patients table.
 */
export function MedicalShell({ contained = false }: { contained?: boolean } = {}) {
  const localize = useTemplateCopy();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Selected calendar day — Most active days reports clicks here, and the
  // Activity card swaps its rings/values to that day's data. Defaults to
  // today (Jul 10, 2026) so the Activity card opens on the current day.
  const [selectedDay, setSelectedDay] = useState<SelectedDay | null>({ month: 6, day: 10 });

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
        <DashboardSidebar selected="medical" />
      </div>

      {/* Mobile sidebar remains beneath the medical dashboard content. */}
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
            selected="medical"
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
          <MedicalHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="flex w-full flex-col gap-4">
            {/* One grid for all six cards: at md (tablet) they flow 2-per-row
                with no empty cell; at xl it's the Figma 2 rows of 3. */}
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <PatientInfoCard />
              <StepsCard />
              <SleepScoreCard />
              <MostActiveDaysCard selectedDay={selectedDay} onSelectDay={setSelectedDay} />
              <ActivityRingsCard selectedDay={selectedDay} />
              <ImportantAlertsCard />
            </div>
            <PatientsTable />
          </div>
        </div>
      </main>
    </div>
  ));
}
