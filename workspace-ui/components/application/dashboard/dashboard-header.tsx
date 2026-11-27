"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { RiAddFill, RiFilter3Fill, RiHomeLine, RiMenuLine } from "@remixicon/react";
import { TemplateNotificationCenterMenu } from "../notification-center/template-notification-center-menu";
import { Avatar } from "../../base/avatar/avatar";
import { Breadcrumb, BreadcrumbItem } from "../../base/breadcrumb/breadcrumb";
import { Button } from "../../base/buttons/button";
import { IconButton } from "../../base/buttons/icon-button";
import { WorkspaceTeamAvatar } from "../../workspace/brand";
import { teamName } from "../../workspace/identity";

/**
 * Figma source: Board UI → dashboard 1 → Frame 60 (node 3731:3011).
 *
 * Breadcrumb trail + page title row with header actions (notifications with
 * unread count, Filters, Create ticket).
 */

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const localize = useTemplateCopy();
  return localize((
    <header className="flex w-full flex-col gap-2">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbItem href="#">
          <WorkspaceTeamAvatar size="xs" />
          {teamName}
        </BreadcrumbItem>
        <BreadcrumbItem href="#">
          <Avatar size="xs" color="neutral" initials="M" />
          Mertcan
        </BreadcrumbItem>
        <BreadcrumbItem current icon={RiHomeLine}>
          Home
        </BreadcrumbItem>
      </Breadcrumb>

      {/* Title + actions */}
      <div className="flex w-full flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {onMenuClick && (
            <IconButton
              icon={RiMenuLine}
              size="medium"
              aria-label="Open navigation"
              onClick={onMenuClick}
              className="lg:hidden"
            />
          )}
          <h1 className="px-1 text-title-2-medium whitespace-nowrap text-text-primary">
            Welcome Mertcan
          </h1>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          <TemplateNotificationCenterMenu unreadCount={5} />
          <Button variant="secondary" size="medium" leadingIcon={RiFilter3Fill}>
            Filters
          </Button>
          <Button variant="primary" size="medium" leadingIcon={RiAddFill}>
            Create ticket
          </Button>
        </div>
      </div>
    </header>
  ));
}
