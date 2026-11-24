"use client";

import { useState } from "react";
import Link from "next/link";
import { RiArrowRightUpLine, RiSettings3Line } from "@remixicon/react";
import { Button } from "../base/buttons/button";
import { SettingsModal, type SettingsPage } from "../application/settings/settings-modal";

const sections = [
  ["general", "常规", "查看通知、代码审查和方案用量。"],
  ["profile", "个人资料", "查看和编辑示例账户资料。"],
  ["tools", "工具", "查看模型上下文协议服务器和认证偏好。"],
  ["storage", "存储", "筛选文件并查看文件操作。"],
] as const;

export function WorkspaceSettings() {
  const [active, setActive] = useState<SettingsPage | null>(null);
  return (
    <main className="mx-auto flex w-full max-w-[960px] flex-col gap-5 px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-display-4-semibold">设置</h1>
        <p className="text-body-regular text-text-secondary">工作台界面语言为简体中文。</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {sections.map(([id, label, description]) => (
          <article key={id} className="flex flex-col items-start gap-3 rounded-3xl border border-border-button-default p-5">
            <h2 className="text-title-3-semibold">{label}</h2>
            <p className="text-body-regular text-text-secondary">{description}</p>
            <Button variant="secondary" leadingIcon={RiSettings3Line} onClick={() => setActive(id)}>{`打开${label}设置`}</Button>
          </article>
        ))}
      </div>
      <Link href="/model" className="inline-flex w-fit items-center gap-2 text-body-medium text-accent-600 hover:underline">
        查看模型连接 <RiArrowRightUpLine className="size-4" aria-hidden="true" />
      </Link>
      <SettingsModal isOpen={active !== null} defaultPage={active ?? "general"} onClose={() => setActive(null)} planArtSrc="/templates/settings-plan-art.png" />
    </main>
  );
}
