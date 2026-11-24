const prefix = "luokui-ai:";

/** Read renamed browser preferences without losing data saved by the earlier workspace. */
export function readWorkspaceStorage(key: string) {
  const value = window.localStorage.getItem(key);
  if (value !== null || !key.startsWith(prefix)) return value;
  return window.localStorage.getItem(`boardui:${key.slice(prefix.length)}`);
}
