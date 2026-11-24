"use client";

import { AgentAvatar } from "../application/agent-avatar/agent-avatar";
import { INITIAL_AGENTS } from "../application/multi-agent-chat/data";
import { cx } from "../../utils/cx";

const avatars = [
  { index: 1, size: 90, position: "start-[6%] bottom-[18%]" },
  { index: 3, size: 154, position: "start-[28%] top-[16%]" },
  { index: 2, size: 109, position: "end-[5%] bottom-[13%]" },
] as const;

export function HeroAgents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-0 hidden w-[49%] overflow-hidden sm:block">
      <div className="workspace-orbit absolute inset-0" />
      <div className="absolute start-[8%] top-[22%] size-1.5 rounded-full bg-accent-300" />
      <div className="absolute end-[15%] top-[20%] size-2 rounded-full bg-accent-300" />
      <div className="absolute end-[28%] bottom-[20%] size-1.5 rounded-full bg-accent-400" />
      {avatars.map(({ index, size, position }) => (
        <div key={index} className={cx("absolute", position)}>
          <AgentAvatar config={INITIAL_AGENTS[index].avatar} size={size} />
        </div>
      ))}
    </div>
  );
}
