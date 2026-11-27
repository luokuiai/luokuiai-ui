"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState, type ComponentProps } from "react";

import { DesktopBasePath, workspaceHref } from "./desktop-navigation";

/** Native rail links without a matching page link share the same App Router. */
export function DesktopWorkspaceNavigation() {
  const router = useRouter();
  useEffect(() => {
    function navigate(event: Event) {
      const link = event.target;
      if (!(link instanceof HTMLAnchorElement) || !link.closest(".lk-titlebar, .lk-rail")) return;
      if (link.origin !== location.origin || !event.cancelable) return;
      event.preventDefault();
      if (link.href !== location.href) router.push(link.pathname + link.search + link.hash);
    }
    document.addEventListener("luokui:workspace-navigate", navigate);
    return () => document.removeEventListener("luokui:workspace-navigate", navigate);
  }, [router]);
  return null;
}

/** In the desktop shell the whole navigation is visible at once. Warm just
 * the route under the pointer or keyboard focus, using Next's shared cache. */
export function IntentLink({ href, prefetch, onMouseEnter, onFocus, ...props }: ComponentProps<typeof NextLink>) {
  const base = useContext(DesktopBasePath);
  const target = typeof href === "string" ? workspaceHref(href, base) : base && href.pathname ? { ...href, pathname: workspaceHref(href.pathname, base) } : href;
  const [warmHref, setWarmHref] = useState<typeof href | null>(null);
  return (
    <NextLink
      {...props}
      href={target}
      prefetch={prefetch ?? (warmHref === href ? null : false)}
      onMouseEnter={event => {
        setWarmHref(href);
        onMouseEnter?.(event);
      }}
      onFocus={event => {
        setWarmHref(href);
        onFocus?.(event);
      }}
    />
  );
}
