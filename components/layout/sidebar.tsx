"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import type { StaffRole } from "@/lib/types";

export function Sidebar({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface-soft md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HugeiconsIcon icon={DropletIcon} size={18} />
        </div>
        <span className="font-medium text-ink">Alira</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`) ||
            (item.href === "/more" && pathname.startsWith("/expenses"));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
