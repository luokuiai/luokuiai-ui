"use client";

import { useTemplateCopy } from "../../foundations/template-copy/template-copy";

import { useRef, useState } from "react";
import {
  RiDownloadCloud2Line,
  RiGitPullRequestLine,
  RiNotificationLine,
  RiShieldCheckLine,
  RiUserAddLine,
} from "@remixicon/react";
import { Dialog, Popover } from "react-aria-components";
import {
  NotificationCenter,
  type NotificationCenterItem,
} from "./notification-center";
import { IconButton } from "../../base/buttons/icon-button";
import { cx } from "../../../utils/cx";
import { useDismissOnOutsidePress } from "../../../utils/use-dismiss-on-outside-press";

const TEMPLATE_NOTIFICATIONS: NotificationCenterItem[] = [
  {
    id: "mention-notes",
    category: "mentions",
    group: "今天",
    title: "莉维娅提到了你",
    description: "能在仪表盘发布前审阅新的空状态吗？",
    timestamp: "2 分钟前",
    unread: true,
    avatar: { src: "/avatars/livia-saris.webp", alt: "莉维娅·萨里斯" },
    actions: [
      { id: "reply", label: "回复", variant: "primary" },
      { id: "view", label: "查看讨论", variant: "secondary" },
    ],
  },
  {
    id: "backup-ready",
    category: "system",
    group: "今天",
    title: "工作区备份已完成",
    description: "7 月 23 日的备份已完成，可以下载。",
    timestamp: "18 分钟前",
    unread: true,
    status: "success",
    icon: RiDownloadCloud2Line,
    actions: [{ id: "download", label: "下载", variant: "secondary" }],
  },
  {
    id: "project-invite",
    category: "activity",
    group: "今天",
    title: "你已加入海洋项目",
    description: "玛丽亚已授予你编辑权限，可以访问全部项目文件。",
    timestamp: "1 小时前",
    unread: true,
    icon: RiUserAddLine,
    status: "information",
  },
  {
    id: "pull-request",
    category: "mentions",
    group: "本周早些时候",
    title: "杰登请求你审阅",
    description: "合并请求 #284 更新了通知偏好流程。",
    timestamp: "周一",
    unread: true,
    avatar: { src: "/avatars/jaydon-aminoff.webp", alt: "杰登·阿米诺夫" },
    actions: [{ id: "review", label: "审阅改动", variant: "secondary" }],
  },
  {
    id: "security-check",
    category: "system",
    group: "本周早些时候",
    title: "安全检查已完成",
    description: "未发现凭据暴露或有漏洞的依赖项。",
    timestamp: "周日",
    status: "success",
    icon: RiShieldCheckLine,
  },
  {
    id: "deploy-failed",
    category: "system",
    group: "本周早些时候",
    title: "预览部署失败",
    description: "构建在校验应用路由时停止。",
    timestamp: "周六",
    unread: true,
    status: "error",
    icon: RiGitPullRequestLine,
    actions: [
      { id: "retry", label: "重试", variant: "primary" },
      { id: "logs", label: "查看日志", variant: "secondary" },
    ],
  },
];

export function TemplateNotificationCenterMenu({
  notifications = TEMPLATE_NOTIFICATIONS,
  unreadCount,
}: {
  notifications?: NotificationCenterItem[];
  unreadCount?: number;
} = {}) {
  const localize = useTemplateCopy();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const visibleUnreadCount =
    unreadCount ?? notifications.filter((notification) => notification.unread).length;

  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);

  return localize((
    <>
      <span className="group relative inline-flex">
        <IconButton
          ref={triggerRef}
          icon={RiNotificationLine}
          size="medium"
          aria-label="通知"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          onClick={() => setIsOpen((open) => !open)}
        />
        {visibleUnreadCount > 0 && (
          <span className="pointer-events-none absolute top-0.5 start-[18px] flex size-4 items-center justify-center rounded-full border-[1.5px] border-background-primary-default bg-red-600 group-hover:border-0 group-active:border-0">
            <span className="w-4 text-center text-[10px] leading-4 font-bold text-white">
              {visibleUnreadCount}
            </span>
          </span>
        )}
      </span>
      <Popover
        ref={popoverRef}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom end"
        offset={8}
        isNonModal
        className={cx(
          "w-[430px] max-w-[calc(100vw-32px)] origin-top-right outline-none",
          "transition duration-150 ease-out",
          "data-[entering]:scale-95 data-[entering]:opacity-0 data-[entering]:blur-[2px]",
          "data-[exiting]:scale-95 data-[exiting]:opacity-0 data-[exiting]:blur-[2px]",
        )}
      >
        <Dialog aria-label="通知" className="outline-none">
          <NotificationCenter notifications={notifications} />
        </Dialog>
      </Popover>
    </>
  ));
}
