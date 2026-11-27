"use client";

import { useSearchParams } from "next/navigation";
import { lazy, Suspense, useState, type ReactNode } from "react";
import { RiArrowRightSLine, RiSearchLine } from "@remixicon/react";
import { AreaChartCard } from "../../application/charts/area-chart-card";
import type { SelectedDay } from "../../application/medical/medical-data";
import { Button } from "../../base/buttons/button";
import { Input } from "../../base/input/input";
import { WorkspaceDemoCopy } from "../templates/demo-copy";
import { cx } from "../../../utils/cx";

// The directory shows one chart at a time. Keep the default area chart ready
// and request a specialized chart only when the visitor actually opens it.
const BarListCard = lazy(() => import("../../application/charts/bar-list-card").then(module => ({ default: module.BarListCard })));
const ComboChartCard = lazy(() => import("../../application/charts/combo-chart-card").then(module => ({ default: module.ComboChartCard })));
const FunnelChartCard = lazy(() => import("../../application/charts/funnel-chart-card").then(module => ({ default: module.FunnelChartCard })));
const HeatmapChartCard = lazy(() => import("../../application/charts/heatmap-chart-card").then(module => ({ default: module.HeatmapChartCard })));
const RadarChartCard = lazy(() => import("../../application/charts/radar-chart-card").then(module => ({ default: module.RadarChartCard })));
const RadialChartCard = lazy(() => import("../../application/charts/radial-chart-card").then(module => ({ default: module.RadialChartCard })));
const SankeyChartCard = lazy(() => import("../../application/charts/sankey-chart-card").then(module => ({ default: module.SankeyChartCard })));
const ScatterChartCard = lazy(() => import("../../application/charts/scatter-chart-card").then(module => ({ default: module.ScatterChartCard })));
const StageBarsCard = lazy(() => import("../../application/charts/stage-bars-card").then(module => ({ default: module.StageBarsCard })));
const ContributionsCard = lazy(() => import("../../application/dashboard/contributions-card").then(module => ({ default: module.ContributionsCard })));
const EarningsChartCard = lazy(() => import("../../application/dashboard/earnings-chart-card").then(module => ({ default: module.EarningsChartCard })));
const LineChartCard = lazy(() => import("../../application/dashboard/line-chart-card").then(module => ({ default: module.LineChartCard })));
const OrdersChartCard = lazy(() => import("../../application/dashboard/orders-chart-card").then(module => ({ default: module.OrdersChartCard })));
const RevenueChartCard = lazy(() => import("../../application/dashboard/revenue-chart-card").then(module => ({ default: module.RevenueChartCard })));
const ActivityRingsCard = lazy(() => import("../../application/medical/activity-rings-card").then(module => ({ default: module.ActivityRingsCard })));
const MostActiveDaysCard = lazy(() => import("../../application/medical/most-active-days-card").then(module => ({ default: module.MostActiveDaysCard })));
const SleepScoreCard = lazy(() => import("../../application/medical/sleep-score-card").then(module => ({ default: module.SleepScoreCard })));
const StepsCard = lazy(() => import("../../application/medical/steps-card").then(module => ({ default: module.StepsCard })));

function ChartLoading() {
  return <p role="status" className="text-body-regular text-text-secondary">正在加载图表…</p>;
}

function ChartVariants<T extends string>({ options, children }: { options: readonly (readonly [T, string])[]; children: (variant: T) => ReactNode }) {
  const [variant, setVariant] = useState(options[0][0]);
  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="图表样式">
        {options.map(([id, name]) => <Button key={id} size="small" variant={variant === id ? "primary" : "secondary"} aria-pressed={variant === id} onClick={() => setVariant(id)}>{name}</Button>)}
      </div>
      {children(variant)}
    </div>
  );
}

function ActiveDays() {
  const [day, setDay] = useState<SelectedDay | null>(null);
  return (
    <div className="grid min-w-0 gap-4 xl:grid-cols-2">
      <MostActiveDaysCard selectedDay={day} onSelectDay={setDay} />
      <ActivityRingsCard selectedDay={day} />
    </div>
  );
}

const chartGroups = [
  { name: "趋势与比较", items: [
    { id: "area-chart-card", name: "多系列面积图", description: "比较数个时间序列，可在堆叠、重叠和百分比视图之间切换。", render: () => <ChartVariants options={[["stacked", "堆叠"], ["overlap", "重叠"], ["percent", "百分比"]] as const}>{(variant) => <AreaChartCard variant={variant} tiles />}</ChartVariants> },
    { id: "line-chart-card", name: "折线趋势图", description: "按周期查看变化，比较曲线和平直折线。", render: () => <ChartVariants options={[["curved", "曲线"], ["sharp", "折线"]] as const}>{(shape) => <LineChartCard shape={shape} />}</ChartVariants> },
    { id: "revenue-chart-card", name: "营收面积图", description: "比较今年与去年的月度营收。", render: () => <RevenueChartCard title="营收" /> },
    { id: "orders-chart-card", name: "订单对比柱图", description: "使用并列柱对照两个年度的订单数。", render: () => <OrdersChartCard title="订单" /> },
    { id: "earnings-chart-card", name: "收益柱图", description: "切换周期查看收益及当前柱对应的数值。", render: () => <EarningsChartCard /> },
    { id: "combo-chart-card", name: "双轴组合图", description: "用柱状和折线同时对照两种不同量纲的指标。", render: () => <ComboChartCard /> },
  ] },
  { name: "分布与排名", items: [
    { id: "bar-list-card", name: "排行列表", description: "按列表类别切换，比较各条目的占比。", render: () => <BarListCard /> },
    { id: "radar-chart-card", name: "雷达图", description: "对比多个维度。试用填充、散点、线条和中心评分样式。", render: () => <ChartVariants options={[["filled", "填充"], ["dots", "散点"], ["lines", "线条"], ["score", "中心评分"]] as const}>{(variant) => <RadarChartCard variant={variant} />}</ChartVariants> },
    { id: "radial-chart-card", name: "径向图与仪表", description: "查看同心环、刻度网格和仪表盘的多种表现。", render: () => <ChartVariants options={[["rings", "圆环"], ["labels", "带标签"], ["grid", "刻度网格"], ["gauge", "仪表"], ["solid", "实心"], ["stacked", "堆叠"]] as const}>{(variant) => <RadialChartCard variant={variant} />}</ChartVariants> },
    { id: "scatter-chart-card", name: "散点与气泡图", description: "用位置观察相关性，用气泡大小比较规模。", render: () => <ScatterChartCard /> },
    { id: "heatmap-chart-card", name: "矩阵热力图", description: "用色阶查看各时段的数值分布。", render: () => <HeatmapChartCard /> },
  ] },
  { name: "转化与流向", items: [
    { id: "funnel-chart-card", name: "转化漏斗", description: "查看跨步骤的流失和转化率，切换曲面或直边。", render: () => <ChartVariants options={[["curved", "曲面"], ["sharp", "直边"]] as const}>{(shape) => <FunnelChartCard shape={shape} />}</ChartVariants> },
    { id: "stage-bars-card", name: "阶段条形图", description: "按顺序比较某个流程各阶段的数量与占比。", render: () => <StageBarsCard /> },
    { id: "sankey-chart-card", name: "桑基流向图", description: "查看数值如何在来源和去向间分配，悬停突出某条路径。", render: () => <SankeyChartCard /> },
  ] },
  { name: "活动与健康", items: [
    { id: "contributions-card", name: "活动贡献热力图", description: "逐日查看贡献，切换活动周期。", render: () => <ContributionsCard /> },
    { id: "steps-card", name: "每周步数", description: "按周比较每日步数，并切换时间范围。", render: () => <StepsCard /> },
    { id: "sleep-score-card", name: "睡眠评分", description: "悬停查看评分分项，了解各项指标怎样构成总分。", render: () => <SleepScoreCard /> },
    { id: "activity-rings-card", name: "活动圆环", description: "用三个同心圆环展示活动、锻炼与站立目标。", render: () => <ActivityRingsCard /> },
    { id: "most-active-days-card", name: "活动日历", description: "按月浏览，点击日期联动查看当日的活动圆环。", render: () => <ActiveDays /> },
  ] },
];
const charts = chartGroups.flatMap((group) => group.items);

export function ChartPreview({ id }: { id: string }) {
  const chart = charts.find((item) => item.id === id);
  if (!chart) throw new Error("图表演示缺失：" + id);
  return <Suspense fallback={<ChartLoading />}><WorkspaceDemoCopy>{chart.render()}</WorkspaceDemoCopy></Suspense>;
}

export function ChartGallery() {
  const selectedId = useSearchParams().get("chart");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const selected = charts.find((chart) => chart.id === selectedId) ?? charts[0];
  const groups = chartGroups.map((group) => ({ ...group, items: group.items.filter((item) => (item.name + " " + item.id).toLowerCase().includes(search) || group.name.includes(search)) }));
  const total = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[234px_minmax(0,1fr)]">
      <aside aria-label="图表目录" className="order-2 grid gap-4 rounded-3xl border border-border-button-default bg-background-primary-default p-4 lg:order-1">
        <Input aria-label="搜索图表" placeholder="搜索图表" leadingIcon={RiSearchLine} value={query} onChange={setQuery} />
        <div className="flex flex-wrap justify-between gap-1"><strong className="text-body-semibold">图表目录</strong><span className="text-caption-1-medium text-text-tertiary">{total} 张</span></div>
        {!total && <p className="text-body-regular text-text-secondary" role="status">没有匹配的图表。</p>}
        {groups.filter((group) => group.items.length > 0).map((group) => (
          <nav key={group.name} aria-label={group.name} className="grid gap-1">
            <h2 className="px-2 text-caption-1-semibold text-text-tertiary">{group.name}</h2>
            {group.items.map(({ id, name }) => (
              <a
                key={id}
                href={"/charts?chart=" + id + "#chart-preview"}
                aria-current={selected.id === id ? "page" : undefined}
                onClick={(event) => {
                  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  window.history.pushState(null, "", event.currentTarget.href);
                  document.getElementById("chart-preview")?.scrollIntoView({ block: "start" });
                }}
                className={cx("flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-body-medium focus-visible:outline-2 focus-visible:outline-border-focus-ring", selected.id === id ? "bg-accent-500/10 text-accent-600" : "text-text-secondary hover:bg-background-secondary-hover")}
              >
                {name}<RiArrowRightSLine className="size-4 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </nav>
        ))}
      </aside>
      <section id="chart-preview" aria-labelledby="chart-name" className="order-1 grid min-w-0 scroll-mt-4 gap-5 rounded-3xl border border-border-button-default bg-background-primary-default p-4 sm:p-6 lg:order-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="grid gap-1">
            <h2 id="chart-name" className="text-title-2-semibold">{selected.name}</h2>
            <p className="text-body-regular text-text-secondary">{selected.description}</p>
          </div>
        </div>
        <Suspense key={selected.id} fallback={<ChartLoading />}>
          <WorkspaceDemoCopy>{selected.render()}</WorkspaceDemoCopy>
        </Suspense>
      </section>
    </div>
  );
}
