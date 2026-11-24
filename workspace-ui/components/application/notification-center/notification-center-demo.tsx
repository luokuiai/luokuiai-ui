"use client";

import {
  RiDownloadCloud2Line,
  RiGitPullRequestLine,
  RiShieldCheckLine,
  RiUserAddLine,
} from "@remixicon/react";
import {
  NotificationCenter,
  type NotificationCenterItem,
} from "./notification-center";

const notifications: NotificationCenterItem[] = [
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

export function NotificationCenterDemo() {
  return <NotificationCenter notifications={notifications} />;
}
