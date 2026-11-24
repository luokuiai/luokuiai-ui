import Link from "next/link";
import { WorkspaceFrame } from "../chrome";
import { LibraryContent, LibraryHeading } from "../library-layout";
import { cx } from "../../../utils/cx";
import { adminSections, type AdminSection } from "./admin-data";
import { AdminPages } from "./admin-pages";

const descriptions: Record<AdminSection, string> = {
  overview: "查看代理、模型连接、运行完成率和工作区费用。",
  models: "管理模型可用性和默认路由。",
  agents: "添加代理、指定团队和职责，并控制运行调度。",
  runs: "筛选运行、检查详情，体验提交、执行和重试。",
  usage: "按周期查看费用与词元用量，设置预算并导出明细。",
  audit: "追踪示例工作区中的模型、代理、运行和预算变更。",
};

export function AdminScreen({ section }: { section: AdminSection }) {
  const info = adminSections.find((entry) => entry.id === section)!;
  return (
    <WorkspaceFrame active="admin">
      <LibraryContent>
        <LibraryHeading title={info.label} description={descriptions[section]} actions={<span className="rounded-lg bg-background-secondary-default px-2.5 py-1.5 text-caption-1-semibold text-text-secondary">本地示例工作区</span>} />
        <nav aria-label="AI 后台模块" className="flex flex-wrap gap-1.5">
          {adminSections.map(({ id, href, label }) => (
            <Link key={id} href={href} aria-current={id === section ? "page" : undefined} className={cx("rounded-xl border px-3 py-2 text-body-medium focus-visible:outline-2 focus-visible:outline-border-focus-ring", id === section ? "border-accent-500/30 bg-accent-500/10 text-accent-600" : "border-border-button-default bg-background-primary-default text-text-secondary hover:bg-background-primary-hover")}>{label}</Link>
          ))}
        </nav>
        <AdminPages section={section} />
      </LibraryContent>
    </WorkspaceFrame>
  );
}
