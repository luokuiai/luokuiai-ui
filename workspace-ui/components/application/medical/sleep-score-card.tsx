"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { hash, weekLabel } from "./medical-data";
import { WeekRangePill } from "./week-range-pill";
import { useDirection } from "../../foundations/direction/direction";
import { useCountUp } from "../../../hooks/use-count-up";
import { cx } from "../../../utils/cx";

/**
 * Figma source: Board UI → medical profile dashboard → Frame 127 (node
 * 3950:5729). A full neutral-200 ring sits behind three colored arcs (one
 * per sub-score below; 49 + 29 + 20 = 98, the headline score) — the arcs
 * have fully rounded caps and small gaps, and the unearned points stay
 * visible as exposed grey track. Hovering an arc swaps the center "98"
 * for that sub-score's own number.
 *
 * The week pill steps through earlier weeks and back, up to the current one,
 * like the Important alerts card. Each week has its own night averages
 * (seeded, so stable across renders and SSR), scored by the same rules, so
 * the current week keeps Figma's 7h 50m, 20m earlier and 5m wake up (98).
 * Switching, the arcs sweep to their new lengths, the center score and each
 * row's score count to the new values, and the rows' copy slides 8px in from
 * the side of the week being reached, 50ms apart, sharpening from a 2px
 * blur. Reduced motion keeps the fades only.
 */

type Metric = { label: string; detail: string; score: number; max: number; color: string };

/** The current week's nights, per Figma; earlier weeks are seeded around them. */
const CURRENT_WEEK = { sleep: 470, bedtime: 20, wake: 5 };

/** Bedtime against the usual one, in minutes: positive is earlier. */
const BEDTIME_SHIFTS = [30, 20, 15, 10, -10, -15, -20, -30, -45];

function sleepDuration(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

/** Eight hours earns the full 50; 7h 50m earns 49. */
function durationScore(minutes: number) {
  return Math.min(50, Math.round((minutes / 480) * 50));
}

/** Half an hour early or more earns the full 30; any later bedtime costs a point per 3 minutes. */
function bedtimeScore(shift: number) {
  if (shift >= 30) return 30;
  if (shift >= 0) return 30 - Math.ceil((30 - shift) / 15);
  return 28 - Math.round(-shift / 3);
}

/** Five minutes awake earns the full 20; every 3 minutes more costs a point. */
function interruptionScore(minutes: number) {
  return 20 - Math.round((minutes - 5) / 3);
}

/** The week `offset` weeks from the current one: its three sub-scores, in ring order. */
function weekMetrics(offset: number): Metric[] {
  const seed = offset * 131;
  const { sleep, bedtime, wake } =
    offset === 0
      ? CURRENT_WEEK
      : {
          // 6h 15m to 8h 10m, in 5-minute steps
          sleep: 375 + Math.floor(hash(seed) * 24) * 5,
          bedtime: BEDTIME_SHIFTS[Math.floor(hash(seed + 1) * BEDTIME_SHIFTS.length)],
          // 5 to 35 minutes awake
          wake: 5 + Math.floor(hash(seed + 2) * 7) * 5,
        };
  return [
    { label: "Duration", detail: sleepDuration(sleep), score: durationScore(sleep), max: 50, color: "var(--color-chart-5)" },
    {
      label: "Bedtime",
      detail: bedtime > 0 ? `${bedtime}m earlier` : `${-bedtime}m later`,
      score: bedtimeScore(bedtime),
      max: 30,
      color: "var(--color-chart-3)",
    },
    { label: "Interruptions", detail: `${wake}m wake up`, score: interruptionScore(wake), max: 20, color: "var(--color-chart-6)" },
  ];
}

function scoreLabel(total: number) {
  if (total >= 90) return "Excellent";
  if (total >= 75) return "Good";
  if (total >= 50) return "Fair";
  return "Poor";
}

/** The copy that changes with the week re-enters from its start styles each time it is keyed anew. */
const ENTER = cx(
  "transition-[opacity,translate,filter] duration-300 ease-out",
  "starting:opacity-0 motion-safe:starting:translate-x-(--sleep-in) motion-safe:starting:blur-[2px]",
);

export function SleepScoreCard({ className }: { className?: string } = {}) {
  const localize = useTemplateCopy();
  const direction = useDirection();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [week, setWeek] = useState(0);
  const [step, setStep] = useState(-1);

  const metrics = useMemo(() => weekMetrics(week), [week]);
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  const totalMax = metrics.reduce((sum, m) => sum + m.max, 0);
  // Colored arcs + a transparent filler for the unearned points, so the
  // segments occupy exactly score/100 of the circle and the grey base ring
  // shows through the rest.
  const ringData = useMemo(
    () => [...metrics.map((m) => ({ value: m.score, fill: m.color })), { value: totalMax - total, fill: "transparent" }],
    [metrics, total, totalMax],
  );

  const hovering = activeIndex !== null && activeIndex < metrics.length;
  const centerValue = useCountUp(hovering ? metrics[activeIndex].score : total);

  // Back in time, the new week's copy arrives from the start side (forward,
  // from the end side), mirrored in RTL, like the pill's chevrons.
  const fromStart = (step < 0 ? 1 : -1) * (direction === "rtl" ? -1 : 1);
  const shift = { "--sleep-in": `${-8 * fromStart}px` } as CSSProperties;

  const goTo = (next: number) => {
    setStep(next < week ? -1 : 1);
    setWeek(next);
  };

  return localize((
    <section
      className={cx(
        "flex h-[330px] w-full min-w-0 flex-col gap-4 rounded-[20px] bg-background-secondary-default p-2.5",
        className,
      )}
      style={shift}
    >
      <div className="flex w-full items-start justify-between gap-2 px-1.5 pt-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5" aria-live="polite">
          <p className="text-body-medium text-text-secondary">Sleep score</p>
          <p key={week} className={cx("text-title-1-medium whitespace-nowrap text-text-primary", ENTER)}>
            {scoreLabel(total)}
          </p>
        </div>
        <WeekRangePill
          label={weekLabel(week)}
          onPrev={() => goTo(week - 1)}
          onNext={() => goTo(week + 1)}
          nextDisabled={week >= 0}
        />
      </div>

      <div className="relative -mt-2 h-[104px] w-full shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Full grey track behind the arcs, per Figma. */}
            <Pie
              data={[{ value: 1 }]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={37}
              outerRadius={52}
              fill="var(--color-chart-track)"
              stroke="none"
              isAnimationActive={false}
            />
            <Pie
              data={ringData}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={37}
              outerRadius={52}
              startAngle={90}
              endAngle={-270}
              cornerRadius={99}
              paddingAngle={4}
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              isAnimationActive
              // Recharts waits 400ms by default; the arcs move with the numbers.
              animationBegin={0}
              animationDuration={450}
              animationEasing="ease-out"
            >
              {ringData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.fill}
                  opacity={hovering && activeIndex !== index && index < metrics.length ? 0.7 : 1}
                  className="transition-opacity duration-200 ease-out"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            key={String(activeIndex)}
            className="animate-number-fade text-display-4-medium text-text-primary tabular-nums"
          >
            {centerValue}
          </span>
        </div>
      </div>

      {/* Figma pads this panel on the left only (pl-10) and each row on the
          right (pr-10), so the hairline dividers run all the way to the
          panel's right edge but stay inset on the left. */}
      <div className="flex w-full flex-1 flex-col rounded-2lg bg-background-inner-default ps-2.5">
        {metrics.map((metric, index) => (
          <MetricRow key={metric.label} metric={metric} week={week} index={index} last={index === metrics.length - 1} />
        ))}
      </div>
    </section>
  ));
}

function MetricRow({ metric, week, index, last }: { metric: Metric; week: number; index: number; last: boolean }) {
  const localize = useTemplateCopy();
  const score = useCountUp(metric.score);
  return localize((
    <div
      className={cx(
        // flex-1 lets the rows share the panel height evenly so the last
        // row sits flush to the bottom instead of leaving a gap below it.
        "flex w-full flex-1 items-center justify-between py-2 pe-2.5",
        !last && "border-b border-separator-border-strong",
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="size-3 shrink-0 rounded-[4px]" style={{ backgroundColor: metric.color }} />
        <span
          key={week}
          style={{ transitionDelay: `${index * 50}ms` }}
          className={cx("text-body-regular whitespace-nowrap text-text-secondary", ENTER)}
        >
          {metric.label}: {metric.detail}
        </span>
      </div>
      <span className="text-body-medium whitespace-nowrap text-text-primary tabular-nums">
        {score}/{metric.max}
      </span>
    </div>
  ));
}
