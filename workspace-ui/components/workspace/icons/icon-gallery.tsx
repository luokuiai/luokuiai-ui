"use client";

import { useState } from "react";
import { RiCheckLine, RiFileCopyLine, RiSearchLine } from "@remixicon/react";
import { Button } from "../../base/buttons/button";
import { Input } from "../../base/input/input";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "../../base/modal/modal";
import { iconGroups } from "./catalog";

type IconItem = (typeof iconGroups)[number]["items"][number];
type IconStyle = "line" | "fill";
const sizes = [16, 24, 32, 48] as const;

export function IconGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const [style, setStyle] = useState<IconStyle>("line");
  const [selected, setSelected] = useState<IconItem | null>(null);
  const [feedback, setFeedback] = useState("");
  const needle = query.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const groups = iconGroups
    .filter((group) => category === "全部" || group.name === category)
    .map((group) => ({
      name: group.name,
      items: group.items.filter(({ base, label }) => (label + base + "ri" + base + "line" + "ri" + base + "fill").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").includes(needle)),
    }))
    .filter((group) => group.items.length);
  const count = groups.reduce((total, group) => total + group.items.length, 0);
  const Selection = selected?.[style];
  const name = selected ? "Ri" + selected.base + (style === "line" ? "Line" : "Fill") : "";
  const snippet = 'import { ' + name + ' } from "@remixicon/react";\n\n<' + name + ' size={24} aria-hidden="true" />';

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(snippet);
      setFeedback("已复制 React 代码");
    } catch {
      setFeedback("无法访问剪贴板，请选中代码后手动复制。");
    }
  }

  return (
    <>
      <div className="grid gap-4 rounded-3xl border border-border-button-default bg-background-primary-default p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input className="w-full sm:max-w-sm" aria-label="搜索图标" placeholder="搜索中文名称或 React 组件名" value={query} onChange={setQuery} leadingIcon={RiSearchLine} />
          <div role="group" aria-label="图标风格" className="flex gap-2">
            <Button size="small" variant={style === "line" ? "primary" : "secondary"} aria-pressed={style === "line"} onClick={() => setStyle("line")}>线框</Button>
            <Button size="small" variant={style === "fill" ? "primary" : "secondary"} aria-pressed={style === "fill"} onClick={() => setStyle("fill")}>实心</Button>
          </div>
        </div>
        <div role="group" aria-label="图标分类" className="flex flex-wrap items-center gap-2">
          {["全部", ...iconGroups.map((group) => group.name)].map((group) => (
            <Button key={group} size="small" variant={category === group ? "primary" : "ghost"} aria-pressed={category === group} onClick={() => setCategory(group)}>{group}</Button>
          ))}
          <span className="text-caption-1-medium text-text-tertiary" role="status">{count} 个结果</span>
        </div>
      </div>
      {!count && <p className="rounded-3xl border border-separator-border bg-background-primary-default p-6 text-body-regular text-text-secondary">没有匹配的图标。试试其他关键词或分类。</p>}
      {groups.map((group) => (
        <section key={group.name} aria-label={group.name} className="grid gap-3">
          <h2 className="text-title-3-semibold">{group.name}</h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
            {group.items.map((item) => {
              const Icon = item[style];
              return (
                <Button key={item.base} variant="secondary" title={"Ri" + item.base + (style === "line" ? "Line" : "Fill")} className="h-auto min-h-20 min-w-0 flex-col rounded-xl px-1 py-3 [&>span]:w-full" onClick={() => { setFeedback(""); setSelected(item); }}>
                  <span className="flex min-w-0 flex-col items-center gap-2">
                    <Icon className="size-6 text-foreground-icon-primary" aria-hidden="true" />
                    <span className="w-full overflow-hidden text-ellipsis text-caption-1-medium text-text-secondary">{item.label}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </section>
      ))}
      <Modal isOpen={!!selected} onOpenChange={(isOpen) => { if (!isOpen) setSelected(null); }} isDismissable>
        {selected && Selection && <>
          <ModalHeader title={selected.label} description={name} closeLabel="关闭" />
          <ModalBody>
            <div className="flex flex-wrap items-end justify-around gap-3 rounded-2xl bg-background-secondary-default p-5">
              {sizes.map((size) => <div key={size} className="flex flex-col items-center gap-2"><Selection size={size} aria-hidden="true" /><span className="text-caption-1-medium text-text-tertiary">{size} 像素</span></div>)}
            </div>
            <pre dir="ltr" className="overflow-x-auto rounded-xl bg-background-secondary-default p-3 text-caption-1-medium text-text-primary"><code>{snippet}</code></pre>
            {feedback && <p role="status" className="text-body-regular text-text-secondary">{feedback}</p>}
          </ModalBody>
          <ModalFooter><Button onClick={copyCode} leadingIcon={feedback === "已复制 React 代码" ? RiCheckLine : RiFileCopyLine}>复制 React 代码</Button></ModalFooter>
        </>}
      </Modal>
    </>
  );
}
