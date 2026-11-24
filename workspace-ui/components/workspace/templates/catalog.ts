export const templates = [
  { slug: "dashboard", name: "通用仪表盘", group: "业务运营", href: "/templates/dashboard", description: "查看营收趋势、关键指标和客户表格。", features: ["营收趋势", "客户列表"] },
  { slug: "marketing", name: "营销分析", group: "业务运营", href: "/templates/marketing", description: "追踪投放、获客漏斗、渠道访客与广告回报。", features: ["获客漏斗", "渠道分析"] },
  { slug: "finance", name: "财务分析", group: "业务运营", href: "/templates/finance", description: "检查账户余额、资金流向、组合分布和交易记录。", features: ["资金流向", "交易列表"] },
  { slug: "hr", name: "人力资源", group: "业务运营", href: "/templates/hr", description: "查看员工规模、招聘进度、参与度和组织分布。", features: ["招聘漏斗", "员工目录"] },
  { slug: "medical-profile", name: "健康档案", group: "业务运营", href: "/templates/medical-profile", description: "检查健康档案、活动、睡眠和提醒示例。", features: ["活动圆环", "睡眠评分"] },
  { slug: "ai-chat", name: "代码工作台", group: "AI 工作空间", href: "/ai-chat", description: "在会话、代码预览和可调宽度的编辑面板之间切换。", features: ["代码审阅", "会话侧栏"] },
  { slug: "multi-agent-chat", name: "多代理协作", group: "AI 工作空间", href: "/multi-agent-chat", description: "创建代理并发起单聊或群聊，体验动态头像与协作。", features: ["代理创建", "多人会话"] },
  { slug: "ai-image-generation", name: "图像生成", group: "AI 工作空间", href: "/ai-image-generation", description: "体验从提示词、生成反馈到作品画廊的流程。", features: ["生成线程", "作品画廊"] },
  { slug: "ai-profile", name: "AI 活动档案", group: "AI 工作空间", href: "/ai-profile", description: "查看贡献热力图、代理活动和词元使用趋势。", features: ["贡献热力图", "词元趋势"] },
  { slug: "project-board", name: "任务看板", group: "AI 工作空间", href: "/project-board", description: "拖拽工单更新状态，打开详情查看记录、评论和用量。", features: ["工单流转", "用量统计"] },
] as const;
