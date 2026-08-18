"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { UserMenu } from "./user-menu";

export function AppHeader({ pamName }: { pamName: string }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon icon={DropletIcon} size={18} />
        </div>
        <span className="font-semibold text-ink">{pamName}</span>
      </div>
      <UserMenu pamName={pamName} />
    </header>
  );
}