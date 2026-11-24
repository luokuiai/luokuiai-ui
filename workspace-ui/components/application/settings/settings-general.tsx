"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useState } from "react";
import { Button } from "../../base/buttons/button";
import { Select, SelectItem } from "../../base/select/select";
import { Switch } from "../../base/switch/switch";
import { PlanArtFlame } from "./plan-art-flame";
import {
  SettingsCard,
  SettingsRow,
  SettingsSectionLabel,
} from "./settings-rows";

/**
 * Figma source: Board UI → "Settings/General" (node 4079:13037), the right
 * pane of the settings modal. Taller than the 614px modal, so the pane
 * scrolls within the shell.
 *
 * Sections, 24px apart:
 *   plan          "Current plan" chip, Ultra $149/mo, upgrade button, and the
 *                 artwork bleeding off the right edge under a radial fade
 *                 into the card background.
 *   limits        single row with a "Manage limits" button.
 *   pull requests two select rows (Review provider / PR destination).
 *   notifications four toggle rows, only "Critical requests" on by default.
 */

/** Compact white select trigger (h 32, radius/lg) per the Figma rows. */
const SELECT_TRIGGER = "h-8 w-auto gap-1 rounded-lg px-2 py-1.5";

export function SettingsGeneral({ planArtSrc }: { planArtSrc?: string }) {
  const localize = useTemplateCopy();
  const [toggles, setToggles] = useState({
    critical: true,
    system: false,
    sound: false,
    dispatch: false,
  });

  const setToggle = (key: keyof typeof toggles) => (value: boolean) =>
    setToggles((t) => ({ ...t, [key]: value }));

  return localize((
    <div className="flex w-full flex-col gap-6">
      {/* Current plan */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-background-secondary-default">
        {/* Artwork bleeding off the right edge, fading into the card bg.
            Rendered through a WebGL shader: waving like a wind-torn flag with
            a continuous burning-edge effect (see plan-art-flame.tsx). */}
        <div aria-hidden className="absolute -top-[11px] start-[328px] size-[277px]">
          <PlanArtFlame
            src={planArtSrc}
            className="size-full object-cover"
          />
          {/* Fades into the card, whatever colour that is: the stops mix the
              card's own token rather than a hardcoded #f7f7f7, which stayed
              white and haloed the artwork in dark mode. Mixing toward 0% of
              the token instead of `transparent` also avoids the grey fringe
              sRGB interpolation gives when a colour fades to rgba(0,0,0,0). */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(closest-side at center,
                color-mix(in srgb, var(--color-background-secondary-default) 0%, transparent) 13%,
                color-mix(in srgb, var(--color-background-secondary-default) 13%, transparent) 37%,
                color-mix(in srgb, var(--color-background-secondary-default) 85%, transparent) 86%,
                var(--color-background-secondary-default) 100%)`,
            }}
          />
        </div>

        <div className="relative flex flex-col gap-2.5 py-3 pe-2.5 ps-3">
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center rounded-md bg-background-tertiary-default px-1.5 py-0.5 text-body-2-medium text-text-secondary">
              当前方案
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-headline-medium text-text-primary">旗舰方案 · 每月 149 美元</p>
              <p className="text-body-2-regular text-text-secondary">
                当前用量额度为标准方案的 7 倍。
              </p>
            </div>
          </div>
          <Button variant="secondary" size="small" className="w-fit">
            升级至最高方案
          </Button>
        </div>
      </div>

      {/* Limits */}
      <SettingsCard>
        <SettingsRow label="用量配额" description="当前用量额度为高级方案的 7 倍">
          <Button variant="secondary" size="small">
            管理用量配额
          </Button>
        </SettingsRow>
      </SettingsCard>

      {/* Pull Requests */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel>合并请求</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="代码审查平台"
            description="选择 GitHub 或其他平台进行代码审查"
          >
            <Select
              aria-label="代码审查平台"
              defaultSelectedKey="github"
              triggerClassName={SELECT_TRIGGER}
            >
              <SelectItem id="github">GitHub</SelectItem>
              <SelectItem id="gitlab">GitLab</SelectItem>
              <SelectItem id="bitbucket">Bitbucket</SelectItem>
            </Select>
          </SettingsRow>
          <SettingsRow
            label="合并请求打开方式"
            description="设置合并请求链接的打开位置"
          >
            <Select
              aria-label="合并请求打开方式"
              defaultSelectedKey="inside"
              triggerClassName={SELECT_TRIGGER}
            >
              <SelectItem id="inside">在 LUOKUI-AI 内打开</SelectItem>
              <SelectItem id="browser">在浏览器中打开</SelectItem>
            </Select>
          </SettingsRow>
        </SettingsCard>
      </div>

      {/* Notifications */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel>通知</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="关键操作请求"
            description="模型需要做出关键决策时通知我"
          >
            <Switch
              aria-label="关键操作请求"
              isSelected={toggles.critical}
              onChange={setToggle("critical")}
            />
          </SettingsRow>
          <SettingsRow
            label="系统通知"
            description="代理完成任务后发送通知"
          >
            <Switch
              aria-label="系统通知"
              isSelected={toggles.system}
              onChange={setToggle("system")}
            />
          </SettingsRow>
          <SettingsRow
            label="完成提示音"
            description="任务完成时播放音效"
          >
            <Switch
              aria-label="完成提示音"
              isSelected={toggles.sound}
              onChange={setToggle("sound")}
            />
          </SettingsRow>
          <SettingsRow
            label="任务推送"
            description="LUOKUI-AI 发来消息时在手机上推送通知"
          >
            <Switch
              aria-label="任务推送"
              isSelected={toggles.dispatch}
              onChange={setToggle("dispatch")}
            />
          </SettingsRow>
        </SettingsCard>
      </div>
    </div>
  ));
}
