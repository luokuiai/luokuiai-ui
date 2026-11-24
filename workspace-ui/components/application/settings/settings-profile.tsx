"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useRef, useState, type ComponentProps } from "react";
import { CalendarDate } from "@internationalized/date";
import { RiCalendarLine, RiExternalLinkLine, RiLogoutCircleLine, RiMailLine } from "@remixicon/react";
import { Button } from "../../base/buttons/button";
import { DatePicker } from "../../base/date-picker/date-picker";
import { Input } from "../../base/input/input";
import { Switch } from "../../base/switch/switch";
import { cx } from "../../../utils/cx";
import {
  SettingsCard,
  SettingsRow,
  SettingsValueField,
} from "./settings-rows";

/**
 * Figma source: Board UI → "Settings/Profile" (node 4081:13943), the right
 * pane of the settings modal.
 *
 * Two cards, 24px apart:
 *   1. identity   Email / First name / Last name as editable design-system
 *                 Inputs (small, 202px — mail icon on Email), Date of birth
 *                 (white date-picker trigger, 202px)
 *   2. account    BoardUI account → "Manage", Public profile toggle (on),
 *                 Device ID (muted, truncated), Log out from all devices.
 */

function formatBirthDate(date: CalendarDate) {
  return `${date.year}年${date.month}月${date.day}日`;
}

/**
 * Design-system Input that commits on Enter / blur: Enter just blurs the
 * field, and blur fires `onSaved` only when the value actually changed since
 * the last commit — so clicking in and out without typing stays silent.
 */
function SavableInput({
  initialValue,
  onSaved,
  ...inputProps
}: { initialValue: string; onSaved?: () => void } & Omit<
  ComponentProps<typeof Input>,
  "value" | "onChange" | "defaultValue"
>) {
  const localize = useTemplateCopy();
  const [value, setValue] = useState(initialValue);
  const committed = useRef(initialValue);

  return localize((
    <Input
      size="small"
      {...inputProps}
      value={value}
      onChange={setValue}
      onKeyDown={(event) => {
        if (event.key === "Enter") (event.target as HTMLElement).blur();
      }}
      onBlur={() => {
        if (value !== committed.current) {
          committed.current = value;
          onSaved?.();
        }
      }}
      className={cx("w-[202px] shrink-0", inputProps.className)}
    />
  ));
}

export function SettingsProfile({ onSaved }: { onSaved?: () => void } = {}) {
  const localize = useTemplateCopy();
  const [birthDate, setBirthDate] = useState<CalendarDate>(new CalendarDate(1997, 7, 28));
  const [birthOpen, setBirthOpen] = useState(false);
  const birthTriggerRef = useRef<HTMLButtonElement>(null);
  const [publicProfile, setPublicProfile] = useState(true);

  return localize((
    <div className="flex w-full flex-col gap-6">
      <SettingsCard>
        <SettingsRow label="邮箱">
          <SavableInput
            aria-label="邮箱"
            type="email"
            leadingIcon={RiMailLine}
            initialValue="hi@mertcan.works"
            onSaved={onSaved}
          />
        </SettingsRow>
        <SettingsRow label="名">
          <SavableInput aria-label="名" initialValue="晓" onSaved={onSaved} />
        </SettingsRow>
        <SettingsRow label="姓">
          <SavableInput aria-label="姓" initialValue="卢" onSaved={onSaved} />
        </SettingsRow>
        <SettingsRow label="出生日期">
          <button
            ref={birthTriggerRef}
            type="button"
            onClick={() => setBirthOpen((o) => !o)}
            className={[
              "flex h-8 w-[202px] shrink-0 cursor-pointer items-center gap-0.5 rounded-lg px-2",
              "border border-border-button-default bg-background-primary-default shadow-xs",
              "transition-colors duration-150 ease hover:bg-background-primary-hover",
              "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
            ].join(" ")}
          >
            <RiCalendarLine className="size-[18px] shrink-0 text-foreground-icon-primary" aria-hidden />
            <span className="px-0.5 text-body-regular whitespace-nowrap text-text-primary">
              {formatBirthDate(birthDate)}
            </span>
          </button>
          <DatePicker
            aria-label="出生日期"
            triggerRef={birthTriggerRef}
            isOpen={birthOpen}
            onOpenChange={setBirthOpen}
            value={birthDate}
            onChange={(next) => next && setBirthDate(next)}
          />
        </SettingsRow>
      </SettingsCard>

      <SettingsCard>
        <SettingsRow label="LUOKUI-AI 账户">
          <Button variant="secondary" size="small" leadingIcon={RiExternalLinkLine}>
            管理
          </Button>
        </SettingsRow>
        <SettingsRow
          label="公开个人资料"
          description="开启后，任何人都可查看你的个人资料"
        >
          <Switch
            aria-label="公开个人资料"
            isSelected={publicProfile}
            onChange={setPublicProfile}
          />
        </SettingsRow>
        <SettingsRow label="设备标识">
          <SettingsValueField muted>593e2611-b9e3-44e2-1289-ab3f9d21</SettingsValueField>
        </SettingsRow>
        <SettingsRow label="退出所有设备">
          <Button variant="secondary" size="small" leadingIcon={RiLogoutCircleLine}>
            退出登录
          </Button>
        </SettingsRow>
      </SettingsCard>
    </div>
  ));
}
