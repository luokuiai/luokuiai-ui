"use client";

import { useEffect, useState } from "react";
import { RiRefreshLine } from "@remixicon/react";
import { Button } from "../base/buttons/button";

type ModelStatus = {
  configured: boolean;
  providerLabel: string | null;
  model: string | null;
};

export function ModelStatus() {
  const [refresh, setRefresh] = useState(0);
  const [status, setStatus] = useState<ModelStatus | "error" | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/chat", { signal: controller.signal, cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("无法读取模型状态");
        return response.json() as Promise<ModelStatus>;
      })
      .then(setStatus)
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [refresh]);

  const message = status === "error"
    ? "读取失败，请重试。"
    : status === null
      ? "正在检查模型连接…"
      : status.configured
        ? `已配置 ${status.providerLabel ?? "模型服务"}。`
        : "当前使用本地演示模式。配置模型后可在对话页发送真实请求。";

  return (
    <section aria-label="模型连接状态" className="flex flex-col items-start gap-3 rounded-3xl border border-border-button-default p-5">
      <h2 className="text-title-3-semibold">模型连接状态</h2>
      <p role="status" className="text-body-regular text-text-secondary">{message}</p>
      {status && status !== "error" && status.model && <p className="text-body-medium">模型 <code>{status.model}</code></p>}
      <Button variant="secondary" leadingIcon={RiRefreshLine} onClick={() => { setStatus(null); setRefresh((value) => value + 1); }}>重新检查</Button>
    </section>
  );
}
