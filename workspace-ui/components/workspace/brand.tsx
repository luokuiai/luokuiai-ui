import Image from "next/image";
import { Avatar, type AvatarProps } from "../base/avatar/avatar";
import { cx } from "../../utils/cx";
import { workspaceName } from "./identity";
import workspaceLogo from "./workspace-logo.png";

export function WorkspaceTeamAvatar({ size = "md", alt = "" }: Pick<AvatarProps, "size" | "alt">) {
  return <Avatar size={size} src={workspaceLogo.src} alt={alt} className="rounded-md bg-transparent" />;
}

export function WorkspaceWordmark({
  className,
  alt = workspaceName,
  inverse = false,
}: {
  className?: string;
  alt?: string;
  inverse?: boolean;
}) {
  return (
    <span className={cx("inline-flex min-w-0 max-w-full items-center", className)}>
      {!inverse && (
        <Image src="/brand/wordmark-light.png" width={410} height={120} alt={alt} className="theme-logo-light h-auto w-full" loading="eager" unoptimized />
      )}
      <Image
        src="/brand/wordmark-dark.png"
        width={410}
        height={120}
        alt={alt}
        className={cx("h-auto w-full", !inverse && "theme-logo-dark")}
        loading="eager"
        unoptimized
      />
    </span>
  );
}
