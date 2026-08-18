"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { bottomNavItems } from "./nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {bottomNavItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon icon={item.icon} size={22} />
              {item.title}
            </Link>
          );
        })}
        <Link
          href="/more"
          className={cn(
            "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
            pathname.startsWith("/more") ||
              pathname.startsWith("/reports") ||
              pathname.startsWith("/payments") ||
              pathname.startsWith("/expenses")
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={22} />
          Lainnya
        </Link>
      </div>
    </nav>
  );
}
