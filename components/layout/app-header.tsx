"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { UserMenu } from "./user-menu";
import type { StaffRole } from "@/lib/types";

export function AppHeader({
  pamName,
  userName,
  role,
}: {
  pamName: string;
  userName: string;
  role: StaffRole;
}) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-paper px-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-[30px] items-center justify-center rounded-[9px] bg-petrol text-aqua">
          <HugeiconsIcon icon={DropletIcon} size={17} />
        </div>
        <span className="font-display text-[19px] font-bold tracking-[-0.01em] text-petrol">
          {pamName}
          <span className="ml-1 align-middle font-display text-[13px] font-semibold uppercase tracking-[0.02em] text-brass">
            AJA
          </span>
        </span>
      </div>
      <UserMenu userName={userName} role={role} />
    </header>
  );
}