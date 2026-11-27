"use client";

import { RiCollapseDiagonalLine, RiExpandDiagonalSLine } from "@remixicon/react";
import { useState, type CSSProperties } from "react";
import { Focusable } from "react-aria-components";
import { Tooltip, TooltipTrigger } from "../../base/tooltip/tooltip";
import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

type PanelActionProps = {
  icon: typeof RiExpandDiagonalSLine;
  label: string;
  onClick?: () => void;
  pressed?: boolean;
};

export function PanelAction({ icon: Icon, label, onClick, pressed }: PanelActionProps) {
  const localize = useTemplateCopy();
  return localize(
    <TooltipTrigger delay={200}>
      <Focusable>
        <button
          type="button"
          aria-label={label}
          aria-pressed={pressed}
          onClick={onClick}
          className="group flex cursor-pointer items-center rounded-md p-0.5 outline-none transition-colors duration-150 ease hover:bg-background-primary-hover focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        >
          <Icon aria-hidden className="size-[18px] text-foreground-icon-secondary transition-colors duration-150 ease group-hover:text-foreground-icon-primary" />
        </button>
      </Focusable>
      <Tooltip size="sm">{label}</Tooltip>
    </TooltipTrigger>
  );
}

export type PanelExpandProps = { isExpanded: boolean; onToggleExpand: () => void };

/** Embedded panels can manage expansion themselves or follow a host that sizes the full workspace. */
export function usePanelExpansion(width: CSSProperties["width"], isExpanded?: boolean, onToggleExpand?: () => void) {
  const [standaloneExpanded, setStandaloneExpanded] = useState(false);
  return {
    width: isExpanded === undefined && standaloneExpanded ? "100%" : width,
    isExpanded: isExpanded ?? standaloneExpanded,
    onToggleExpand: () => {
      if (isExpanded === undefined) setStandaloneExpanded(current => !current);
      onToggleExpand?.();
    },
  };
}

export function PanelExpandButton({ isExpanded, onToggleExpand }: PanelExpandProps) {
  return (
    <PanelAction
      icon={isExpanded ? RiCollapseDiagonalLine : RiExpandDiagonalSLine}
      label={isExpanded ? "收缩面板" : "展开面板"}
      pressed={isExpanded}
      onClick={onToggleExpand}
    />
  );
}
