"use client";

import { IntentLink as Link } from "./intent-link";
import { RiArrowRightUpLine } from "@remixicon/react";
import { AppShell } from "../application/app-shell/app-shell";
import { catalogCount, catalogSections } from "./catalog";
import { workspaceLibrary } from "./navigation";

export function ComponentDirectory() {
  return (
    <AppShell title="AI 组件目录" actions={null} showOffer={false}>
      <div className="flex flex-col gap-6 px-1 pt-3">
        <p className="text-body-regular text-text-secondary">共 {catalogCount} 个注册项。选择任意一项，直接打开演示位置。</p>
        <nav aria-label="更多组件与管理入口" className="flex flex-wrap gap-2">
          {workspaceLibrary.map(({ id, label, href, icon: Icon }) => (
            <Link key={id} href={href} className="inline-flex items-center gap-2 rounded-xl border border-border-button-default bg-background-primary-default px-3 py-2 text-body-medium text-text-primary hover:bg-background-primary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring">
              <Icon className="size-4 text-foreground-icon-secondary" aria-hidden="true" />{label}
            </Link>
          ))}
        </nav>
        {catalogSections.map(({ title, items }) => (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="text-title-2-semibold">{title}</h2>
            <div className="grid gap-2.5 xl:grid-cols-2">
              {items.map(([id, label, href, description]) => (
                <Link key={id} href={href} className="flex items-start gap-3 rounded-xl border border-border-button-default bg-background-primary-default p-4 transition-colors duration-150 hover:bg-background-primary-hover focus-visible:outline-2 focus-visible:outline-border-focus-ring">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-headline-semibold text-text-primary">{label}</h3>
                    <code className="text-caption-1-medium text-text-tertiary">{id}</code>
                    <p className="pt-1 text-body-regular text-text-secondary">{description}</p>
                  </div>
                  <RiArrowRightUpLine className="size-4 shrink-0 text-foreground-icon-secondary" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
