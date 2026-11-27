import { createContext } from "react";

/** Public app links keep their original targets when no desktop shell is present. */
export const DesktopBasePath = createContext("");

export function workspaceHref(href: string, basePath: string): string {
  const base = basePath.replace(/\/$/, "");
  if (!base || !href.startsWith("/") || href.startsWith("//")) return href;
  const path = href.split(/[?#]/, 1)[0];
  if (path === base || path.startsWith(base + "/")) return href;
  return path === "/" ? base + href.slice(1) : base + href;
}

export function logicalHref(href: string, basePath: string): string {
  const base = basePath.replace(/\/$/, "");
  if (!base) return href;
  const path = href.split(/[?#]/, 1)[0];
  if (path === base) return "/" + href.slice(base.length);
  return path.startsWith(base + "/") ? href.slice(base.length) : href;
}
