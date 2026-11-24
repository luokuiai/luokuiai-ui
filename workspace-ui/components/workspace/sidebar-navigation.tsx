"use client";

import type { ReactNode } from "react";
import { ScrollFade, useScrollFade } from "../foundations/scroll-fade/scroll-fade";

export function SidebarNavigation({ children }: { children: ReactNode }) {
  const fade = useScrollFade();
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <nav onScroll={fade.onScroll} aria-label="工作台导航" className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pb-2">
        {children}
      </nav>
      <ScrollFade progress={fade.progress} />
    </div>
  );
}
