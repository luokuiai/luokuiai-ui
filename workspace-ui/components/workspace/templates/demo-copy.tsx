"use client";

import type { ReactNode } from "react";
import { TemplateCopyProvider } from "../../foundations/template-copy/template-copy";

import { translateDemoCopy } from "../../../lib/demo-copy";

export function WorkspaceDemoCopy({ children }: { children: ReactNode }) {
  return <TemplateCopyProvider translate={translateDemoCopy}>{children}</TemplateCopyProvider>;
}
