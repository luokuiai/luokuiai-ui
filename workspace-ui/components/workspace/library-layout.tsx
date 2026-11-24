import type { ReactNode } from "react";

export function LibraryContent({ children }: { children: ReactNode }) {
  return <main className="mx-auto flex w-full max-w-[1350px] min-w-0 flex-col gap-6 px-5 py-7 sm:px-8 lg:px-9 lg:py-9">{children}</main>;
}

export function LibraryHeading({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-separator-border pb-5">
      <div className="grid gap-2">
        <h1 className="text-display-4-semibold">{title}</h1>
        {description && <p className="max-w-2xl text-body-regular text-text-secondary">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
