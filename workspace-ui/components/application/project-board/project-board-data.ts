export type TicketSubtask = { id: string; title: string; done: boolean };
export type TicketComment = { id: string; author: string; body: string; time: string };

export type ProjectMember = {
  id: string;
  name: string;
  avatar: string;
  initials: string;
};

export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export const priorityLabels: Record<TicketPriority, string> = {
  Low: "低", Medium: "中", High: "高", Urgent: "紧急",
};

export type ProjectTicket = {
  id: string;
  code: string;
  area: string;
  title: string;
  since: string;
  description?: string;
  subtasks?: TicketSubtask[];
  comments?: TicketComment[];
  isFavorite?: boolean;
  createdBy?: string;
  priority: TicketPriority;
  project: string;
  assignees: string[];
};

export type ProjectColumn = {
  id: string;
  title: string;
  limit: number;
  tickets: ProjectTicket[];
};

/**
 * Photographic placeholders from the open-source Random User Generator.
 * Swap these URLs for people from your product's own user directory.
 */
export const PROJECT_MEMBERS: Record<string, ProjectMember> = {
  maya: {
    id: "maya",
    name: "陈玛雅",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    initials: "MC",
  },
  noah: {
    id: "noah",
    name: "诺亚·威廉斯",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    initials: "NW",
  },
  elif: {
    id: "elif",
    name: "埃利夫·卡娅",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    initials: "EK",
  },
  daniel: {
    id: "daniel",
    name: "金丹尼尔",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    initials: "DK",
  },
  priya: {
    id: "priya",
    name: "普里娅·沙阿",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    initials: "PS",
  },
};

export const PROJECT_COLUMNS: ProjectColumn[] = [
  {
    id: "backlog",
    title: "待规划",
    limit: 8,
    tickets: [
      {
        id: "ticket-ds-38",
        code: "DS-38",
        area: "代理交接",
        title: "设计代理交接审批卡",
        since: "开始于9月14日",
        priority: "Low",
        project: "vibl",
        assignees: ["maya", "priya"],
      },
      {
        id: "ticket-fe-86",
        code: "FE-86",
        area: "任务看板",
        title: "为项目团队添加可保存视图",
        since: "开始于9月13日",
        priority: "Low",
        project: "firstview",
        assignees: ["elif"],
      },
      {
        id: "ticket-be-23",
        code: "BE-23",
        area: "活动接口",
        title: "记录代理操作审计轨迹",
        since: "开始于9月12日",
        priority: "Medium",
        project: "vibl",
        assignees: ["daniel"],
      },
    ],
  },
  {
    id: "todo",
    title: "待办",
    limit: 5,
    tickets: [
      {
        id: "ticket-ds-34",
        code: "DS-34",
        area: "基础规范",
        title: "定义浮层的语义样式令牌",
        since: "开始于9月12日",
        priority: "High",
        project: "LUOKUI-AI",
        assignees: ["maya"],
      },
      {
        id: "ticket-fe-82",
        code: "FE-82",
        area: "输入器",
        title: "为模型选择器添加键盘导航",
        since: "开始于9月11日",
        priority: "Low",
        project: "firstview",
        assignees: ["noah", "elif"],
      },
      {
        id: "ticket-be-19",
        code: "BE-19",
        area: "用量接口",
        title: "返回滚动配额与重置时间",
        since: "开始于9月10日",
        priority: "Low",
        project: "vibl",
        assignees: ["daniel"],
      },
    ],
  },
  {
    id: "in-progress",
    title: "进行中",
    limit: 4,
    tickets: [
      {
        id: "ticket-fe-79",
        code: "FE-79",
        area: "代理进度",
        title: "为流式任务分组添加动效",
        since: "开始于9月9日",
        priority: "Medium",
        project: "firstview",
        assignees: ["elif", "noah"],
      },
      {
        id: "ticket-ds-31",
        code: "DS-31",
        area: "深色模式",
        title: "调校深色仪表盘的图表对比",
        since: "开始于9月8日",
        priority: "Urgent",
        project: "LUOKUI-AI",
        assignees: ["maya"],
      },
    ],
  },
  {
    id: "review",
    title: "评审中",
    limit: 3,
    tickets: [
      {
        id: "ticket-fe-76",
        code: "FE-76",
        area: "问卷",
        title: "优化计划问卷的切换过渡",
        since: "开始于9月7日",
        priority: "Low",
        project: "vibl",
        assignees: ["priya"],
      },
    ],
  },
  {
    id: "done",
    title: "已完成",
    limit: 6,
    tickets: [
      {
        id: "ticket-ds-27",
        code: "DS-27",
        area: "头像",
        title: "为卡片提供头像组",
        since: "完成于9月6日",
        priority: "Low",
        project: "LUOKUI-AI",
        assignees: ["maya"],
      },
      {
        id: "ticket-fe-71",
        code: "FE-71",
        area: "创作画布",
        title: "缩放时对齐生成的页面",
        since: "完成于9月5日",
        priority: "Medium",
        project: "firstview",
        assignees: ["noah", "daniel"],
      },
      {
        id: "ticket-be-16",
        code: "BE-16",
        area: "组件注册表",
        title: "构建时校验模板依赖",
        since: "完成于9月4日",
        priority: "Low",
        project: "LUOKUI-AI",
        assignees: ["daniel"],
      },
      {
        id: "ticket-ds-25",
        code: "DS-25",
        area: "动效",
        title: "记录区块的减弱动效行为",
        since: "完成于9月3日",
        priority: "Low",
        project: "LUOKUI-AI",
        assignees: ["priya"],
      },
    ],
  },
];
const projectLabels = new Map([["vibl", "前端编码项目"], ["firstview", "首屏设计项目"]]);
export const displayProjectName = (name: string) => projectLabels.get(name) ?? name;
