"use client";

import { useCallback, useId, useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { RiHome5Line, RiMoonLine, RiSettings3Line, RiSunLine } from "@remixicon/react";
import { applyTheme, useThemeMode } from "../application/theme/theme-toggle";
import { DesktopBasePath, logicalHref, workspaceHref } from "./desktop-navigation";
import { DesktopRightSidebarSlot } from "./right-sidebar-control";
import { workspaceLibrary, workspaceRoutes, workspaceTools } from "./navigation";
import { workspaceName } from "./identity";
import logo from "./workspace-logo.png";
import css from "./desktop-shell.module.css";

const destinations = [{ href: "/", label: "总览", icon: RiHome5Line }, ...workspaceRoutes, ...workspaceLibrary, ...workspaceTools];
const sourceSelector = '[data-titlebar-sidebar="desktop"],.workspace-multi-agent > div:first-child > aside';
const storageKeyDefault = "luokui-ai:desktop:titlebar:d-collapsed";

export interface DesktopWorkspaceShellProps {
  /** Logical workspace URL, including an optional query or fragment. */
  pathname: string;
  children: ReactNode;
  /** Called on an unmodified local navigation. Without a router, links navigate normally. */
  onNavigate?: (href: string) => void;
  /** Mount the workspace under a path such as /workspace. */
  basePath?: string;
  /** Defaults to the matched navigation item. Useful on nested routes. */
  pageTitle?: string;
  /** Physical host inset in CSS pixels. For macOS hiddenInset use 90, or 14 in full screen. */
  windowControlsInset?: number;
  /** Server-rendered initial state; pass the host preference to match a restored window's first paint. */
  initialCollapsed?: boolean;
  /** Separate embedded workspaces can use different keys. */
  storageKey?: string;
  className?: string;
  style?: CSSProperties;
}

function originalHref(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || anchor.hasAttribute("download")) return null;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  if (!/^https?:\/\//i.test(href) || anchor.origin !== location.origin) return null;
  return anchor.pathname + anchor.search + anchor.hash;
}

function locateSidebar(stage: HTMLElement) {
  return Array.from(stage.querySelectorAll<HTMLElement>(sourceSelector)).find(el => !el.closest('[role="dialog"]')) ?? null;
}

/** B uses the current page's full-size sidebar. C substitutes a 60px icon rail
 * without unmounting the page, its composer, or the right-hand panel. */
export function DesktopWorkspaceShell({ pathname, children, onNavigate, basePath = "", pageTitle, windowControlsInset = 14, initialCollapsed = false, storageKey = storageKeyDefault, className, style }: DesktopWorkspaceShellProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [slot, setSlot] = useState<HTMLSpanElement | null>(null);
  const root = useRef<HTMLDivElement>(null), stage = useRef<HTMLDivElement>(null), rail = useRef<HTMLElement>(null);
  const toggle = useRef<HTMLButtonElement>(null), moving = useRef<HTMLElement | null>(null);
  const generation = useRef(0), focusSource = useRef(false), navId = useId();
  const theme = useThemeMode();
  const path = pathname.split(/[?#]/, 1)[0] || "/";
  const matches = (href: string) => path === href || (href !== "/" && path.startsWith(href + "/"));
  const businessNav = path === "/multi-agent-chat" ? "会话列表" : path === "/ai-chat" || path === "/ai-image-generation" ? "项目与会话" : undefined;
  const title = pageTitle ?? destinations.find(x => matches(x.href))?.label ?? "工作台";
  const label = collapsed ? "展开导航栏" : "收起导航栏";
  const themeLabel = theme === "dark" ? "切换浅色模式" : "切换深色模式";

  const finishMotion = useCallback(() => {
    generation.current++;
    root.current?.removeAttribute("data-nav-motion");
    if (moving.current) {
      moving.current.removeAttribute("data-nav-column");
      moving.current.style.removeProperty("--desktop-column-end");
      moving.current.style.removeProperty("--desktop-column-hidden");
      moving.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    function restore() {
      try {
        const value = localStorage.getItem(storageKey);
        setCollapsed(value === null ? initialCollapsed : value === "true");
      } catch { setCollapsed(initialCollapsed); }
    }
    restore();
    const update = (e: StorageEvent) => { if (e.key === storageKey || e.key === null) restore(); };
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, [initialCollapsed, storageKey]);

  useLayoutEffect(() => {
    const container = stage.current;
    if (!container) return;
    const source = locateSidebar(container);
    if (source) source.inert = collapsed;
    if (!collapsed && focusSource.current) {
      focusSource.current = false;
      const controls = Array.from(source?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input') ?? [])
        .filter(el => el.getClientRects().length && !el.closest('[inert]'));
      (controls.find(el => el.matches('[aria-current="page"],[aria-selected="true"],[aria-pressed="true"]')) ?? controls[0] ?? toggle.current)?.focus({ preventScroll: true });
    }
    const version = ++generation.current;
    if (root.current?.hasAttribute("data-nav-motion")) {
      const effects = rail.current?.getAnimations().filter(effect => "transitionProperty" in effect && effect.transitionProperty === "width") ?? [];
      Promise.allSettled(effects.map(effect => effect.finished)).then(() => {
        if (generation.current === version) finishMotion();
      });
    }
    return () => { if (source) source.inert = false; };
  }, [collapsed, path, finishMotion]);

  useLayoutEffect(() => {
    finishMotion();
    return finishMotion;
  }, [path, finishMotion]);

  function toggleSidebar() {
    const el = root.current, content = stage.current;
    if (!el || !content) return;
    const source = locateSidebar(content);
    if ((collapsed ? rail.current : source)?.contains(document.activeElement)) toggle.current?.focus({ preventScroll: true });
    if (!el.hasAttribute("data-nav-motion") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Some templates wrap the navigation in its own flex item with margins or
      // padding. Animate that entire footprint, including the inter-column gap.
      el.setAttribute("data-nav-motion", "preparing");
      if (source) {
        const parent = source.parentElement;
        const column = parent?.childElementCount === 1 && parent !== content ? parent : source;
        const computed = getComputedStyle(column);
        const end = parseFloat(computed.marginInlineEnd) || 0, start = parseFloat(computed.marginInlineStart) || 0;
        const gap = column.parentElement ? parseFloat(getComputedStyle(column.parentElement).columnGap) || 0 : 0;
        column.style.setProperty("--desktop-column-end", end + "px");
        column.style.setProperty("--desktop-column-hidden", -(column.getBoundingClientRect().width + gap + start) + "px");
        column.setAttribute("data-nav-column", "");
        moving.current = column;
      }
      el.getBoundingClientRect();
      el.setAttribute("data-nav-motion", "running");
    }
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* Storage is optional in an embedded host. */ }
  }

  function openBusinessNavigation() {
    // On a phone the page already implements a focus-managed conversation drawer.
    const mobile = stage.current?.querySelector<HTMLElement>(path === "/multi-agent-chat" ? 'button[aria-label="打开会话列表"]' : 'button[aria-label="打开导航"]');
    if (mobile?.getClientRects().length) { mobile.click(); return; }
    focusSource.current = true;
    toggleSidebar();
  }
  function resolveAnchor(target: EventTarget | null) {
    if (!(target instanceof Element)) return null;
    const a = target.closest<HTMLAnchorElement>("a[href]");
    if (!a || a.closest("[data-desktop-workspace-shell]") !== root.current) return null;
    const href = originalHref(a);
    if (!href) return null;
    const real = workspaceHref(href, basePath);
    if (real !== a.getAttribute("href")) a.setAttribute("href", real);
    return { a, path: logicalHref(real, basePath) };
  }
  function follow(event: MouseEvent<HTMLDivElement>) {
    const link = resolveAnchor(event.target);
    if (!link || !onNavigate || event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (link.a.target && link.a.target !== "_self")) return;
    event.preventDefault();
    if (link.path !== pathname || link.path.includes("#")) onNavigate(link.path);
  }
  function links(compact: boolean) {
    return destinations.map(({ href, label: name, icon: Icon }, i) => <a href={workspaceHref(href, basePath)} key={href}
      aria-label={name} title={compact ? name : undefined} aria-current={matches(href) ? "page" : undefined}
      className={compact ? css.railLink : css.fullLink} data-divider={compact && (i === 1 || i === 8 || href === "/settings") || undefined}>
      <Icon aria-hidden="true" />{!compact && name}
    </a>);
  }

  return <DesktopBasePath.Provider value={basePath}><DesktopRightSidebarSlot.Provider value={slot}>
    <div ref={root} data-desktop-workspace-shell="" data-workspace-route={path} data-titlebar-layout={collapsed ? "C" : "B"} className={[css.shell, className].filter(Boolean).join(" ")}
      style={{ "--desktop-light-inset": windowControlsInset + "px", ...style } as CSSProperties}
      onClickCapture={follow} onFocusCapture={e => resolveAnchor(e.target)} onPointerDownCapture={e => resolveAnchor(e.target)} onContextMenuCapture={e => resolveAnchor(e.target)}>
      <header className={css.toolbar} aria-label="桌面窗口工具栏">
        <button ref={toggle} className={css.tool} type="button" aria-label={label} title={label} aria-expanded={!collapsed} aria-controls={navId}
          data-workspace-sidebar-toggle="" onMouseDown={e => { if (e.button === 0 && document.activeElement?.matches('textarea,input:not([type="button"]),[contenteditable="true"]')) e.preventDefault(); }} onClick={toggleSidebar}><span className={css.glyph} /></button>
        <div className={css.leading}>
          {collapsed ? <nav className={css.tabs} aria-label="工作区视图">{destinations.slice(0, 2).map(({ href, label: name, icon: Icon }) =>
            <a key={href} href={workspaceHref(href, basePath)} aria-current={matches(href) ? "page" : undefined}><Icon aria-hidden="true" />{name}</a>)}{path !== "/" && path !== "/chat" && (businessNav ? <button type="button" title={"打开" + businessNav} aria-label={title + "：" + businessNav} onClick={openBusinessNavigation}>{title}</button> : <span>{title}</span>)}</nav>
            : <><a className={css.brand} href={workspaceHref("/", basePath)} aria-label="回到工作台总览"><img src={typeof logo === "string" ? logo : logo.src} alt="" /><strong>{workspaceName}</strong></a>
              <span className={css.divider} /><span className={css.page}><span>工作台　/　</span>{title}</span></>}
        </div>
        <div className={css.actions}>
          <a className={css.tool} href={workspaceHref("/settings", basePath)} aria-label="打开工作台设置" title="打开工作台设置"><RiSettings3Line /></a>
          <button className={css.tool} type="button" aria-label={themeLabel} title={themeLabel} onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <RiSunLine /> : <RiMoonLine />}</button>
          <span ref={setSlot} data-workspace-right-sidebar-slot="" data-workspace-embedded-slot="" className={css.rightSlot} />
        </div>
      </header>
      <div className={css.body} id={navId}>
        <nav ref={rail} aria-label="工作台快捷导航" aria-hidden={!collapsed} inert={!collapsed} className={css.rail}>
          <a href={workspaceHref("/", basePath)} className={css.railBrand} aria-label="LUOKUI-AI 总览"><img src={typeof logo === "string" ? logo : logo.src} alt="" /></a>{links(true)}
        </nav>
        <nav className={css.fallback} aria-label="工作台导航" inert={collapsed} aria-hidden={collapsed}>{links(false)}</nav>
        <div ref={stage} className={css.stage}>{children}</div>
      </div>
    </div>
  </DesktopRightSidebarSlot.Provider></DesktopBasePath.Provider>;
}
