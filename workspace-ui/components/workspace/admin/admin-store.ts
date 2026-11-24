"use client";

import { useMemo, useSyncExternalStore } from "react";
import { adminSchema, initialAdminState, type AdminState, type AuditEntry } from "./admin-data";

const storageKey = "luokui-ai:admin-workspace:v1";
const defaultSnapshot = JSON.stringify(initialAdminState);
const subscribers = new Set<() => void>();
let memorySnapshot: string | undefined;

function readSnapshot() {
  if (memorySnapshot !== undefined) return memorySnapshot;
  try {
    return localStorage.getItem(storageKey) ?? defaultSnapshot;
  } catch {
    return defaultSnapshot;
  }
}

function parseSnapshot(snapshot: string): AdminState {
  try {
    const parsed = adminSchema.safeParse(JSON.parse(snapshot));
    return parsed.success ? parsed.data : initialAdminState;
  } catch {
    return initialAdminState;
  }
}

function subscribe(listener: () => void) {
  subscribers.add(listener);
  function onStorage(event: StorageEvent) {
    if (event.key === storageKey || event.key === null) listener();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    subscribers.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useAdminWorkspace() {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => defaultSnapshot);
  return useMemo(() => parseSnapshot(snapshot), [snapshot]);
}

type Change = Pick<AuditEntry, "group" | "action" | "target">;

export function updateAdminWorkspace(update: (state: AdminState) => { state: AdminState; log: Change } | string) {
  const change = update(parseSnapshot(readSnapshot()));
  if (typeof change === "string") return change;
  const entry: AuditEntry = {
    ...change.log,
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
  };
  const snapshot = JSON.stringify({ ...change.state, audit: [entry, ...change.state.audit].slice(0, 100) });
  let message = change.log.action + "成功";
  try {
    localStorage.setItem(storageKey, snapshot);
    memorySnapshot = undefined;
  } catch {
    memorySnapshot = snapshot;
    message += "。浏览器存储不可用，刷新后将恢复示例数据。";
  }
  subscribers.forEach((listener) => listener());
  return message;
}
