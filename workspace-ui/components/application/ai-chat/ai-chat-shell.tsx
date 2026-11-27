"use client";

import { SlidingMobilePanel } from "../dashboard/mobile-navigation";
import navMotion from "../../../styles/sidebar-motion.module.css";
import { RightSidebarButton, RightSidebarControl } from "../../workspace/right-sidebar-control";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { RiCloseLine, RiMenuLine } from "@remixicon/react";
import { AiChatCodePanel } from "./ai-chat-code-panel";
import { AiChatContainer, type AiChatScenario } from "./ai-chat-container";
import { AiChatGalleryPanel, type Generation } from "./ai-chat-gallery-panel";
import { AiChatSidebar } from "./ai-chat-sidebar";
import { IconButton } from "../../base/buttons/icon-button";
import { cx } from "../../../utils/cx";
import styles from "./ai-chat-shell.module.css";

/**
 * Figma source: Board UI → "ai_chat" (node 4030:5897, 1440×900).
 *
 * Full AI chat template screen on the primary background with a 12px frame
 * inset: fixed 260px sidebar, the chat container flexing to fill whatever
 * width remains, and the resizable code panel on the right (16px gap to
 * the chat, 12px to the sidebar). Hovering the chat's right edge reveals a
 * drag handle (Figma node 4040:5413) — holding and dragging it trades width
 * between the chat and the code panel. Below xl the panel opens as a drawer; below
 * lg the sidebar becomes a push drawer: it slides in from the left while the
 * complete chat workspace moves right, keeping its context visible.
 */

const PANEL_DEFAULT_WIDTH = 410;
const PANEL_MIN_WIDTH = 320;
const PANEL_MAX_WIDTH = 560;
const splitPanel = { expanded: false, animate: false };

/** The image the demo thread "generates" — mirrored into the gallery when
 *  the reveal finishes so the two panes tell one story. */
const MESSI_GENERATION: Generation = {
  id: "generated-footballer",
  prompt: "Vintage editorial Messi, Argentina kit",
  src: "/ai-chat/generated-footballer.jpg",
  tint: "from-chart-6/25 to-chart-4/25",
  ratio: "449/600",
};

/** Beat between the image finishing in the thread and it surfacing in the
 *  gallery — the two reveals reading as one motion is worse than reading as
 *  cause and effect, so the wall waits for the chat to land first. */
const GALLERY_REVEAL_DELAY_MS = 900;

/**
 * The divider paints the full space between the two panes. Its 15×25 grip
 * with three lines is revealed on hover and while dragging. The pill
 * follows the cursor vertically along the edge; dragging calls `onResize`
 * with the horizontal delta from the drag start.
 */
function DragHandle({
  onResizeStart,
  onResize,
  isDragging,
  collapsed,
}: {
  onResizeStart: () => void;
  onResize: (dx: number) => void;
  isDragging: boolean;
  collapsed: boolean;
}) {
  const localize = useTemplateCopy();
  const startX = useRef(0);
  const [gripY, setGripY] = useState<number | null>(null);

  const trackGrip = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Keep the 25px pill fully inside the edge strip
    const y = Math.min(rect.height - 13, Math.max(13, e.clientY - rect.top));
    setGripY(y);
  };

  return localize((
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="调整面板大小"
      aria-hidden={collapsed}
      inert={collapsed}
      onPointerDown={(e) => {
        e.preventDefault();
        startX.current = e.clientX;
        onResizeStart();
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        trackGrip(e);
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          onResize((e.clientX - startX.current) * (getComputedStyle(e.currentTarget).direction === "rtl" ? -1 : 1));
        }
      }}
      className={cx(navMotion.dockWidth, "group/drag relative z-10 hidden shrink-0 cursor-col-resize touch-none justify-center self-stretch bg-background-full before:absolute before:inset-y-0 before:-inset-x-1 xl:flex",
        collapsed ? "pointer-events-none w-0 overflow-hidden" : "w-3")}
    >
      <span
        style={gripY !== null ? { top: gripY } : undefined}
        className={cx(
          "absolute flex h-[25px] w-[15px] -translate-y-1/2 items-center justify-center gap-0.5 rounded-sm border border-border-button-default bg-background-primary-default shadow-xs",
          gripY === null && "top-1/2",
          "transition-opacity duration-150 ease",
          isDragging ? "opacity-100" : "opacity-0 group-hover/drag:opacity-100",
        )}
      >
        <span className="h-[13px] w-px bg-foreground-icon-quaternary" />
        <span className="h-[13px] w-px bg-foreground-icon-quaternary" />
        <span className="h-[13px] w-px bg-foreground-icon-quaternary" />
      </span>
    </div>
  ));
}

export function AiChatShell({
  className,
  contained = false,
  defaultScenario = "coding-scenario",
  composer,
}: {
  className?: string;
  contained?: boolean;
  defaultScenario?: AiChatScenario;
  /** Hands the chat container a composer of its own; see AiChatContainer. */
  composer?: ReactNode;
} = {}) {
  const localize = useTemplateCopy();
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT_WIDTH);
  const [panelSize, setPanelSize] = useState(splitPanel);
  const isPanelExpanded = panelSize.expanded;
  const [isDragging, setIsDragging] = useState(false);
  const [{ scenario: activeScenario, animateOnEntry }, selectThread] = useState({
    scenario: defaultScenario,
    animateOnEntry: false,
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [canDock, setCanDock] = useState(true);
  const [dockedPanelOpen, setDockedPanelOpen] = useState(true);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const widthAtDragStart = useRef(PANEL_DEFAULT_WIDTH);
  const panelOpen = canDock ? dockedPanelOpen : mobilePanelOpen;

  useEffect(() => {
    const media = window.matchMedia("(min-width: 80rem)");
    function updateLayout() {
      if (!media.matches && document.getElementById(panelId)?.contains(document.activeElement)) {
        triggerRef.current?.focus({ preventScroll: true });
      }
      setCanDock(media.matches);
      setPanelSize(splitPanel);
      setMobilePanelOpen(false);
      setIsDragging(false);
    }
    updateLayout();
    media.addEventListener("change", updateLayout);
    return () => media.removeEventListener("change", updateLayout);
  }, [panelId]);

  const setPanelOpen = useCallback((open: boolean) => {
    if (open) setMobileNavOpen(false);
    else if (document.getElementById(panelId)?.contains(document.activeElement)) {
      triggerRef.current?.focus({ preventScroll: true });
    }
    setPanelSize({ expanded: false, animate: true });
    setIsDragging(false);
    if (canDock) setDockedPanelOpen(open);
    else setMobilePanelOpen(open);
  }, [canDock, panelId]);

  function togglePanelSize() {
    setIsDragging(false);
    setPanelSize(current => ({ expanded: !current.expanded, animate: true }));
  }

  // Images the thread has finished generating — handed to the gallery
  // panel, which lands them at the top-left of the wall.
  const [generated, setGenerated] = useState<Generation[]>([]);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleImageGenerated = useCallback(() => {
    // A pending timer already covers this generation — don't stack another.
    if (revealTimer.current) return;
    revealTimer.current = setTimeout(() => {
      revealTimer.current = null;
      setGenerated((current) =>
        // Guard against a re-mount replaying the completion callback.
        current.some((g) => g.id === MESSI_GENERATION.id)
          ? current
          : [MESSI_GENERATION, ...current],
      );
    }, GALLERY_REVEAL_DELAY_MS);
  }, []);

  useEffect(
    () => () => {
      if (revealTimer.current) clearTimeout(revealTimer.current);
    },
    [],
  );

  const handleResizeStart = useCallback(() => {
    setPanelSize(splitPanel);
    widthAtDragStart.current = panelWidth;
    setIsDragging(true);
  }, [panelWidth]);

  const handleResize = useCallback((dx: number) => {
    // Dragging right widens the chat, so the panel gives up that width
    setPanelWidth(
      Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, widthAtDragStart.current - dx)),
    );
  }, []);

  const selectScenario = (id: string) => {
    if (
      id === "landing-page-design" ||
      id === "image-generation" ||
      id === "coding-scenario"
    ) {
      if (id !== activeScenario) {
        setPanelSize(splitPanel);
        selectThread({ scenario: id, animateOnEntry: true });
      }
      setMobileNavOpen(false);
    }
  };

  const panelLabel = activeScenario === "image-generation" ? "画廊" : "代码";
  const panelName = activeScenario === "image-generation" ? "画廊" : "代码面板";
  const openDockWidth = isPanelExpanded ? "100%" : panelWidth;

  return localize((
    <div
      className={cx(
        "relative flex w-full overflow-hidden bg-background-full p-3",
        contained ? "h-[var(--template-preview-height)]" : "h-dvh",
        isDragging && "cursor-col-resize select-none",
        className,
      )}
      onPointerUp={() => setIsDragging(false)}
      onPointerCancel={() => setIsDragging(false)}
    >
      <div className="absolute end-3 top-3 z-50 empty:hidden">
        <RightSidebarControl>
          <RightSidebarButton
            ref={triggerRef}
            label={`${panelOpen ? "收起" : "打开"}${panelName}`}
            expanded={panelOpen}
            controls={panelId}
            aria-haspopup={canDock ? undefined : "dialog"}
            onClick={() => setPanelOpen(!panelOpen)}
          />
        </RightSidebarControl>
      </div>
      {/* Mobile navigation stays beneath the workspace. Opening it only moves
          the workspace right while the stationary sidebar content fades in. */}
      <SlidingMobilePanel
        className="absolute inset-y-0 start-0 z-10 flex w-[272px] py-3 ps-[6px] lg:hidden"
        isOpen={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      >
        <div
          data-nav-open={mobileNavOpen || undefined}
          className={cx(
            navMotion.pushSidebar,
            "h-full w-[260px] origin-left rtl:origin-right will-change-transform",
            mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <AiChatSidebar
            activeThreadId={activeScenario}
            onThreadSelect={selectScenario}
            onClose={() => setMobileNavOpen(false)}
            flat
            className="flex"
          />
        </div>
      </SlidingMobilePanel>

      <AiChatSidebar
        desktopNavigation={contained}
        activeThreadId={activeScenario}
        onThreadSelect={selectScenario}
        className={cx(
          "relative z-10 me-4 hidden lg:flex",
          // h-full, not `preview-height - 24px`: this shell frames itself with
          // its own p-3, so a percentage height already resolves against the
          // padded content box. Subtracting the frame again (as the shells
          // whose root has no padding correctly do) left the rail 24px short
          // of the workspace beside it.
          contained && "sticky top-0 h-full self-start",
        )}
      />
      <div className={cx(styles.workspace, "relative flex min-w-0 flex-1 bg-background-full")} data-size-motion={panelSize.animate || undefined}>
        <div
          inert={isPanelExpanded}
          aria-hidden={isPanelExpanded || undefined}
          data-nav-open={mobileNavOpen || undefined}
          className={cx(styles.conversation, navMotion.pushContent, "relative z-20 flex min-w-0 flex-1 flex-col gap-2 overflow-hidden bg-background-full max-lg:will-change-transform lg:z-0 lg:!transform-none lg:!rounded-none",
            isPanelExpanded ? "invisible opacity-0" : "xl:overflow-visible",
            isPanelExpanded && !canDock && "grow-0")}
        >
          <button
            type="button"
            aria-label="关闭导航"
            tabIndex={-1}
            aria-hidden={!mobileNavOpen}
            onClick={() => setMobileNavOpen(false)}
            data-nav-open={mobileNavOpen || undefined}
            className={cx(
              navMotion.pushBackdrop,
              "absolute inset-0 z-50 cursor-pointer rounded-[inherit] bg-black/10 dark:bg-white/5 lg:hidden",
              mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
            )}
          />
          <div className="flex min-h-0 min-w-0 flex-1 gap-3 overflow-hidden xl:overflow-visible">
            <div className="relative flex min-w-0 flex-1 basis-0">
              <AiChatContainer
                scenario={activeScenario}
                animateOnEntry={animateOnEntry}
                onImageGenerated={handleImageGenerated}
                composer={composer}
                mobileHeader={
                  <header className="flex h-12 shrink-0 items-center justify-between px-3 pt-[11px] xl:hidden">
                    <div className="flex min-w-0 items-center gap-2">
                      <IconButton
                        icon={RiMenuLine}
                        size="medium"
                        aria-label="打开导航"
                        aria-haspopup="dialog"
                        aria-expanded={mobileNavOpen}
                        onClick={() => {
                          setMobilePanelOpen(false);
                          setMobileNavOpen(true);
                        }}
                        className="rounded-full lg:hidden"
                      />
                      <span className="truncate px-1 text-headline-medium text-text-primary">
                        {activeScenario === "image-generation" ? "图像生成" : "代理对话"}
                      </span>
                    </div>
                  </header>
                }
              />
            </div>
          </div>
        </div>
        {canDock && (
          <DragHandle
            onResizeStart={handleResizeStart}
            onResize={handleResize}
            isDragging={isDragging}
            collapsed={!panelOpen || isPanelExpanded}
          />
        )}
        <SlidingMobilePanel
          id={panelId}
          label={panelLabel}
          isOpen={panelOpen}
          docked={canDock}
          breakpoint={null}
          returnFocusRef={triggerRef}
          onOpenChange={setPanelOpen}
          style={canDock ? { width: panelOpen ? openDockWidth : 0 } : undefined}
          className={canDock
            ? cx(navMotion.dockWidth, "hidden h-full min-w-0 shrink-0 overflow-clip xl:flex", !panelOpen && "invisible pointer-events-none")
            : cx("absolute -inset-3 z-50 @container", !panelOpen && "pointer-events-none")}
        >
          {!canDock && (
            <button
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => setPanelOpen(false)}
              className={cx(
                navMotion.fadeVisibility, "absolute inset-y-0 end-0 w-screen bg-black/40",
                panelOpen && !isPanelExpanded ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            />
          )}
          <div className={canDock ? "contents" : cx(
            navMotion.dockWidth, "absolute inset-y-0 end-0 overflow-clip bg-background-full",
            panelOpen ? (isPanelExpanded ? "w-full" : "w-[min(410px,calc(100%_-_12px))]") : "invisible w-0",
            !isPanelExpanded && "shadow-sidebar",
          )}>
            <div className={cx("flex h-full w-full flex-col", !canDock && "min-w-[min(410px,calc(100cqi_-_12px))] p-3")}
              style={canDock ? { minWidth: panelWidth } : undefined}>
              {!canDock && (
                <div className="flex h-10 shrink-0 items-center justify-between px-1">
                  <span className="text-headline-medium text-text-primary">{panelLabel}</span>
                  <IconButton
                    icon={RiCloseLine}
                    size="medium"
                    aria-label={`关闭${panelLabel}`}
                    onClick={() => setPanelOpen(false)}
                  />
                </div>
              )}
              {activeScenario === "image-generation" ? (
                <AiChatGalleryPanel width="100%" generated={generated} animateOnEntry={animateOnEntry} className="min-h-0 flex-1"
                  isExpanded={isPanelExpanded} onToggleExpand={togglePanelSize} />
              ) : (
                <AiChatCodePanel width="100%" className="min-h-0 flex-1" isExpanded={isPanelExpanded} onToggleExpand={togglePanelSize} />
              )}
            </div>
          </div>
        </SlidingMobilePanel>
      </div>
    </div>
  ));
}
