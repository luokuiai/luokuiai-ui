"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { useDirection } from "../../foundations/direction/direction";
import { cx } from "../../../utils/cx";
import navMotion from "../../../styles/sidebar-motion.module.css";

interface MobilePanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/** Make Escape and Tab available as soon as the entering drawer is mounted. */
export function focusNavigationDialog(node: HTMLElement | null) {
  node?.focus({ preventScroll: true });
}

function useCloseOnDesktop(isOpen: boolean, onOpenChange: (open: boolean) => void, breakpoint: number | null) {
  useEffect(() => {
    if (!isOpen || breakpoint === null) return;
    const desktop = window.matchMedia(`(min-width: ${breakpoint}rem)`);
    const close = () => { if (desktop.matches) onOpenChange(false); };
    close();
    desktop.addEventListener("change", close);
    return () => desktop.removeEventListener("change", close);
  }, [isOpen, onOpenChange, breakpoint]);
}

/** Overlay used by page shells whose navigation floats above their content. */
export function MobileNavigationDrawer({ isOpen, onOpenChange, children }: MobilePanelProps) {
  const direction = useDirection();
  useCloseOnDesktop(isOpen, onOpenChange, 64);
  return (
    <ModalOverlay
      dir={direction}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className={cx(navMotion.modalBackdrop, "fixed inset-0 z-100 flex h-dvh items-stretch bg-black/40 p-3")}
    >
      <Modal className={cx(navMotion.modalSidebar, "h-full max-w-full outline-none")}>
        <Dialog ref={focusNavigationDialog} aria-label="工作台导航" className="h-full outline-none">{children}</Dialog>
      </Modal>
    </ModalOverlay>
  );
}

interface SlidingPanelProps extends MobilePanelProps {
  className: string;
  id?: string;
  style?: CSSProperties;
  label?: string;
  /** Pass null when the owning workspace observes its available content width. */
  breakpoint?: number | null;
  docked?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const focusable = 'a[href],button,input,select,textarea,[tabindex]';

/** Sliding templates keep their panel mounted while the main content moves over it. */
export function SlidingMobilePanel({
  isOpen, onOpenChange, children, className, id, style, label = "工作台导航", breakpoint = 64,
  docked = false, returnFocusRef,
}: SlidingPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const modalOpen = isOpen && !docked;
  useCloseOnDesktop(modalOpen, onOpenChange, breakpoint);

  useLayoutEffect(() => {
    if (!modalOpen || !panel.current) return;
    const previousFocus = document.activeElement;
    panel.current.focus({ preventScroll: true });
    return () => {
      const trigger = returnFocusRef?.current ?? previousFocus;
      if (trigger instanceof HTMLElement && trigger.isConnected && trigger.getClientRects().length) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, [modalOpen, returnFocusRef]);

  function handleKey(event: KeyboardEvent<HTMLDivElement>) {
    const node = panel.current;
    // Menus and settings opened from the panel manage their own portalled focus.
    if (!modalOpen || !node || event.defaultPrevented || !node.contains(event.target as Node)) return;
    if (event.key === "Escape" && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onOpenChange(false);
      return;
    }
    if (event.key !== "Tab") return;
    const controls = Array.from(node.querySelectorAll<HTMLElement>(focusable)).filter(item =>
      item.tabIndex >= 0 && !item.matches(":disabled") && !item.closest('[inert],[aria-hidden="true"]')
        && item.getClientRects().length > 0 && getComputedStyle(item).visibility === "visible",
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || (event.shiftKey ? event.target === first || event.target === node : event.target === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first)?.focus();
    }
  }

  return (
    <div
      ref={panel}
      id={id}
      tabIndex={-1}
      role={isOpen ? (docked ? "region" : "dialog") : undefined}
      aria-label={isOpen ? label : undefined}
      aria-modal={modalOpen || undefined}
      aria-hidden={!isOpen}
      inert={!isOpen}
      onKeyDown={handleKey}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}
