"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { RiSideBarFill } from "@remixicon/react";
import { IconButton, type IconButtonProps } from "../base/buttons/icon-button";

type ToolbarHost = {
  slot: HTMLSpanElement | null;
  setSlot: (node: HTMLSpanElement | null) => void;
};

const ToolbarContext = createContext<ToolbarHost | null>(null);
export const DesktopRightSidebarSlot = createContext<HTMLElement | null | undefined>(undefined);
const slotReady = "luokui:workspace-right-sidebar-slot-ready";

export function RightSidebarToolbarProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLSpanElement | null>(null);
  return <ToolbarContext.Provider value={{ slot, setSlot }}>{children}</ToolbarContext.Provider>;
}

export function RightSidebarToolbarSlot() {
  const host = useContext(ToolbarContext);
  return <span ref={host?.setSlot} data-workspace-web-right-sidebar-slot className="inline-flex shrink-0 items-center empty:hidden" />;
}

function subscribeToNativeToolbar(onReady: () => void) {
  document.addEventListener(slotReady, onReady);
  return () => document.removeEventListener(slotReady, onReady);
}

const getNativeSlot = () => document.querySelector<HTMLElement>("[data-workspace-right-sidebar-slot]:not([data-workspace-embedded-slot])");
const getServerSlot = () => null;

/** A component preview keeps its local trigger. A workspace page owns a single
 * trigger in its toolbar, with Electron's native window taking precedence. */
export function RightSidebarControl({ children }: { children: ReactNode }) {
  const host = useContext(ToolbarContext);
  const desktopSlot = useContext(DesktopRightSidebarSlot);
  const nativeSlot = useSyncExternalStore(subscribeToNativeToolbar, getNativeSlot, getServerSlot);
  if (desktopSlot !== undefined) return desktopSlot ? createPortal(children, desktopSlot) : null;
  if (!host) return children;
  if (!host.slot) return null;
  return createPortal(children, nativeSlot ?? host.slot);
}

type RightSidebarButtonProps = Omit<IconButtonProps, "icon" | "aria-label"> & {
  label: string;
  expanded: boolean;
  controls?: string;
};

export function RightSidebarButton({ label, expanded, controls, ...props }: RightSidebarButtonProps) {
  return (
    <IconButton
      icon={RiSideBarFill}
      className="sidebar-tool-button"
      data-workspace-right-sidebar-toggle
      title={label}
      aria-label={label}
      aria-expanded={expanded}
      aria-controls={controls}
      {...props}
    />
  );
}
