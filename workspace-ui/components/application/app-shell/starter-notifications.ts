import { RiDownloadCloud2Line, RiGitPullRequestLine, RiShieldCheckLine } from "@remixicon/react";

import type { NotificationCenterItem } from "../notification-center/notification-center";

/** The starter's inbox. Three unread, matching the sidebar badge and the bell. */
export const STARTER_NOTIFICATIONS: NotificationCenterItem[] = [
  {
    id: "mention-notes",
    category: "mentions",
    group: "今天",
    title: "莉维娅提到了你",
    description: "能在仪表盘发布前审阅新的空状态吗？",
    timestamp: "2m",
    unread: true,
    avatar: { initials: "LS", alt: "莉维娅·萨里斯", color: "pink" },
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
    description: "The nightly backup finished and is ready to download.",
    timestamp: "18m",
    unread: true,
    status: "success",
    icon: RiDownloadCloud2Line,
    actions: [{ id: "download", label: "下载", variant: "secondary" }],
  },
  {
    id: "review-request",
    category: "activity",
    group: "今天",
    title: "Review requested on the composer changes",
    description: "Mert opened a pull request that touches the chat composer and the thinking indicator.",
    timestamp: "1h",
    unread: true,
    icon: RiGitPullRequestLine,
    actions: [{ id: "review", label: "评审中", variant: "primary" }],
  },
  {
    id: "key-rotated",
    category: "system",
    group: "昨天",
    title: "API key rotated",
    description: "The model provider key was replaced. Deployments pick it up on the next build.",
    timestamp: "1d",
    status: "information",
    icon: RiShieldCheckLine,
  },
  {
    id: "mention-launch",
    category: "mentions",
    group: "昨天",
    title: "Aspen mentioned you",
    description: "The launch checklist is done on my side. Anything left from yours?",
    timestamp: "1d",
    avatar: { initials: "AL", alt: "Aspen Lubin", color: "blue" },
  },
];

export const STARTER_UNREAD_COUNT = STARTER_NOTIFICATIONS.filter((item) => item.unread).length;
