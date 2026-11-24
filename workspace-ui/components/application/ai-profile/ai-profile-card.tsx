"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useEffect, useState } from "react";
import { RiEditBoxLine, RiShare2Line } from "@remixicon/react";
import { ContributionsGrid } from "../dashboard/contributions-card";
import { Counter } from "../../base/badges/counter";
import { Chip } from "../../base/badges/chip";
import { Button } from "../../base/buttons/button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../../base/segmented-control/segmented-control";
import { useCountUp } from "../../../hooks/use-count-up";
import { cx } from "../../../utils/cx";

/**
 * Figma source: Board UI → ai profile → profile card (node 4063:5759).
 *
 *   card      680w, radius/3xl (24px), 1px border/button/default,
 *             px 16, pb 16, pt 124 — the cover photo overlays the top 165px
 *             and the 80px avatar overlaps its bottom edge
 *   actions   Share / Edit — secondary small buttons, 20px below the cover
 *   name      Title 2/Medium + "@luokui-ai" (Headline/Medium secondary) with
 *             the neutral PRO counter pill
 *   value     "Contributions this year" + $7,462 (Title 1/Medium) + purple
 *             +14.8% chip
 *   stats     4 tiles bg secondary radius/2lg p-10: value Body 1/Medium over
 *             label Body 2/Medium secondary
 *   activity  "Activity" + plain Weekly/Monthly/Yearly switcher, then the
 *             shared `ContributionsGrid` heatmap (38 columns here) — same
 *             hash-scattered violet ramp and hover tooltips as the dashboard
 *             contributions card.
 */

const STATS = [
  { value: "90 亿", label: "累计词元" },
  { value: "5.63 亿", label: "峰值词元" },
  { value: "12 小时 54 分钟", label: "最长任务" },
  { value: "62 天", label: "最长连续记录" },
];

const CONTRIBUTIONS_TOTAL = 7462;

export function AiProfileCard({ className }: { className?: string }) {
  const localize = useTemplateCopy();
  const [period, setPeriod] = useState("weekly");

  // Headline counts up 0 → 7,462 on mount (target flips after first render
  // so `useCountUp` — which starts at its initial target — has 0 to roll from).
  // 1.6s: the hook's ease-out front-loads the movement, so a longer run is
  // what actually makes the intermediate numbers readable.
  const [contributionsTarget, setContributionsTarget] = useState(0);
  useEffect(() => setContributionsTarget(CONTRIBUTIONS_TOTAL), []);
  const contributions = useCountUp(contributionsTarget, 1600);

  return localize((
    <section
      className={cx(
        "relative w-full overflow-hidden rounded-3xl border border-border-ai-profile-card",
        className,
      )}
    >
      {/* Cover photo — overlays the top of the card, clipped by its radius */}
      <div className="absolute inset-x-0 top-0 h-[165px] overflow-hidden rounded-t-[23px] bg-background-tertiary-default">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/templates/ai-profile-cover.png"
          alt=""
          className="size-full object-cover object-[50%_45%]"
        />
      </div>

      <div className="relative flex w-full flex-col gap-[15px] px-4 pt-[124px] pb-4">
        {/* Avatar — overlaps the cover's bottom edge */}
        <span className="flex size-20 items-center justify-center rounded-full bg-background-tertiary-default">
          <span className="text-[30px] leading-[42.5px] font-medium text-text-secondary">M</span>
        </span>

        {/* Name row + actions pinned 20px under the cover */}
        <div className="relative flex w-full items-start gap-[15px]">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-title-2-medium whitespace-nowrap text-text-primary">
              小卢
            </p>
            <div className="flex items-center gap-1.5">
              <p className="text-headline-medium whitespace-nowrap text-text-secondary">
                @luokui-ai
              </p>
              <Counter color="neutral">专业方案</Counter>
            </div>
          </div>
          <div className="absolute -top-[34px] end-1 flex items-center justify-end gap-2.5">
            <Button variant="secondary" size="small" leadingIcon={RiShare2Line}>
              分享
            </Button>
            <Button variant="secondary" size="small" leadingIcon={RiEditBoxLine}>
              编辑
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          {/* Contributions headline */}
          <div className="flex flex-col gap-0.5">
            <p className="text-body-medium text-text-secondary">今年的贡献</p>
            <div className="flex items-center gap-2">
              <p className="text-title-1-medium whitespace-nowrap text-text-primary tabular-nums">
                {contributions.toLocaleString("zh-CN")} 次
              </p>
              <Chip variant="bold" color="purple">
                +14.8%
              </Chip>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-stretch">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex min-w-0 flex-col items-start rounded-2lg bg-background-secondary-default p-2.5 sm:flex-1"
              >
                <p className="w-full truncate text-body-medium text-text-primary">{stat.value}</p>
                <p className="w-full truncate text-body-2-medium text-text-secondary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Activity header */}
          <div className="flex w-full items-center justify-between pt-1.5 ps-0.5">
            <p className="text-body-2-medium text-text-secondary">活动</p>
            <SegmentedControl
              variant="plain"
              selectedKeys={[period]}
              onSelectionChange={(keys) => {
                const next = [...(keys as Set<string>)][0];
                if (next) setPeriod(next);
              }}
              aria-label="活动周期"
            >
              <SegmentedControlItem id="weekly">每周</SegmentedControlItem>
              <SegmentedControlItem id="monthly">每月</SegmentedControlItem>
              <SegmentedControlItem id="yearly">每年</SegmentedControlItem>
            </SegmentedControl>
          </div>

          {/* Heatmap — the shared contributions pattern (violet ramp + hover
              tooltips), 38 columns wide here. Mobile scrolls horizontally. */}
          <div className="flex w-full overflow-x-auto sm:overflow-visible">
            <ContributionsGrid columns={38} animateIn className="w-max sm:w-full" />
          </div>
        </div>
      </div>
    </section>
  ));
}
