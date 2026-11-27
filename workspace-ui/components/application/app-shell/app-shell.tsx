"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import {
  RiAddFill,
  RiDashboardLine,
  RiFilter3Fill,
  RiMenuLine,
} from "@remixicon/react";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

import {
  DashboardSidebar,
  type DashboardNavItem,
} from "../dashboard/dashboard-sidebar";
import { MobileNavigationDrawer } from "../dashboard/mobile-navigation";
import { NotificationBell } from "./notification-bell";
import { ProOfferCard } from "./pro-offer-card";
import { Avatar } from "../../base/avatar/avatar";
import { Breadcrumb, BreadcrumbItem } from "../../base/breadcrumb/breadcrumb";
import { Button } from "../../base/buttons/button";
import { IconButton } from "../../base/buttons/icon-button";
import { cx } from "../../../utils/cx";
import { teamName } from "../../workspace/identity";
import { WorkspaceTeamAvatar } from "../../workspace/brand";
import { workspaceRoutes, workspaceTools } from "../../workspace/navigation";

/**
 * The starter's page frame: the sidebar, a drawer for phones, and a titled
 * content card. Every page of the starter except the chat renders inside it,
 * and the chat shares its navigation, so the sidebar only ever links to pages
 * the app actually has.
 *
 * On boardui.com the starter lives under /templates/chat-starter; in a
 * deployed copy it is the root. The base is read off the URL rather than
 * configured, so the same files run in both places untouched.
 */
export const STARTER_SITE_PREFIX = "/templates/chat-starter";

// Keep the optional starter catalogue API without loading its interactive
// previews, chat transport and charts in every page that imports navigation.
export type { CatalogTier } from "./components-catalog";
export const CatalogTierFilter = dynamic(() => import("./components-catalog").then(module => module.CatalogTierFilter));
export const ComponentsCatalog = dynamic(() => import("./components-catalog").then(module => module.ComponentsCatalog));

/** "" in a deployed starter, the site prefix on boardui.com. */
export function useStarterBase(): string {
  const pathname = usePathname() ?? "";
  // Preserve an optional language prefix on the hosted preview. Installed
  // starters still use their normal root routes.
  return pathname.match(/^((?:\/[a-z]{2}(?:-[a-zA-Z]{2})?)?\/templates\/chat-starter)(?:\/|$)/)?.[1] ?? "";
}

export function starterNav(base: string): DashboardNavItem[] {
  return [
    { key: "home", label: "总览", icon: RiDashboardLine, href: base || "/" },
    ...[...workspaceRoutes, ...workspaceTools].map(({ id, label, icon, href }) => ({ key: id, label, icon, href: `${base}${href}` })),
  ];
}

/** The nav key of the page at the current URL. */
export function useStarterSelected(): string {
  const pathname = usePathname() ?? "";
  const base = useStarterBase();
  const rest = pathname.slice(base.length);
  if (rest.startsWith("/dashboard")) return "dashboard";
  if (rest.startsWith("/components")) return "components";
  return "chat";
}

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

/**
 * The page standard every BoardUI template follows, free or Pro: content sits
 * directly on the page background inside a 1300px column, so cards and tables
 * carry their own surfaces; above it a breadcrumb trail (team, member, page)
 * and the page heading. Pages pass what differs and get the rest.
 */
export function AppShell({
  title,
  heading = title,
  icon: Icon = RiDashboardLine,
  actions,
  children,
  className,
  columnClassName,
  showOffer = true,
}: {
  /** The page's name, shown as the current breadcrumb item. */
  title: string;
  /** The heading over the content. Defaults to the title. */
  heading?: string;
  /** Icon on the current breadcrumb item. */
  icon?: IconComponent;
  /** Header actions on the right; the Pro dashboard's set by default, `null` for none. */
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Overrides the 1300px content column, e.g. `max-w-[964px]` for the catalogue's grids. */
  columnClassName?: string;
  showOffer?: boolean;
}) {
  const localize = useTemplateCopy();
  const [navOpen, setNavOpen] = useState(false);
  const items = starterNav(useStarterBase());
  const selected = useStarterSelected();

  return localize((
    <div
      className={cx(
        "relative flex h-dvh w-full gap-4 overflow-hidden bg-background-full p-3",
        className,
      )}
    >
      <DashboardSidebar items={items} selected={selected} className="hidden lg:flex" />

      <MobileNavigationDrawer isOpen={navOpen} onOpenChange={setNavOpen}>
        <DashboardSidebar mobile items={items} selected={selected} onClose={() => setNavOpen(false)} />
      </MobileNavigationDrawer>

      <main className="relative flex min-h-0 min-w-0 flex-1 justify-center overflow-x-hidden overflow-y-auto bg-background-full sm:pt-3">
        <div className={cx("flex w-full max-w-[1300px] flex-col gap-2.5", columnClassName)}>
          <header className="flex w-full flex-col gap-2">
            <Breadcrumb>
              <BreadcrumbItem href="/">
                <WorkspaceTeamAvatar size="xs" />
                {teamName}
              </BreadcrumbItem>
              <BreadcrumbItem href="/">
                <Avatar size="xs" color="neutral" initials="M" />
                工作区
              </BreadcrumbItem>
              <BreadcrumbItem current icon={Icon}>
                {title}
              </BreadcrumbItem>
            </Breadcrumb>
            <div className="flex w-full flex-wrap items-end justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <IconButton
                  icon={RiMenuLine}
                  size="medium"
                  aria-label="打开导航"
                  aria-haspopup="dialog"
                  aria-expanded={navOpen}
                  onClick={() => setNavOpen(true)}
                  className="lg:hidden"
                />
                <h1 className="px-1 text-title-2-medium whitespace-nowrap text-text-primary">
                  {heading}
                </h1>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2.5">
                {actions !== undefined ? actions : (
                  <>
                    <NotificationBell />
                    <Button variant="secondary" size="medium" leadingIcon={RiFilter3Fill}>
                      筛选
                    </Button>
                    <Button variant="primary" size="medium" leadingIcon={RiAddFill}>
                      创建工单
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          <div className="flex w-full flex-col gap-4 pb-4">{children}</div>
        </div>
      </main>
      {showOffer && <ProOfferCard />}
    </div>
  ));
}
