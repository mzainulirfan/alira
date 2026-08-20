"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreHorizontalIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { bottomNavItems } from "./nav-items";
import type { StaffRole } from "@/lib/types";

export function BottomNav({ role }: { role: StaffRole }) {
  const pathname = usePathname();
  const visibleItems = bottomNavItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  function isActive(item: { href: string }): boolean {
    return (
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`))
    );
  }

  const moreActive =
    pathname.startsWith("/more") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/payments") ||
    pathname.startsWith("/expenses");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 px-1 py-2.5">
        {visibleItems.map((item) => {
          const active = isActive(item);
          const isCenter = item.title === "Catat Meter";
          if (isCenter) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-end gap-1.5 text-[9.5px] font-semibold",
                  active ? "text-petrol" : "text-muted-2"
                )}
              >
                <span className="relative flex size-12 -translate-y-3 items-center justify-center rounded-full bg-petrol text-white shadow-[0_8px_18px_rgba(14,59,67,0.38)] after:absolute after:-inset-1 after:rounded-full after:border-[1.5px] after:border-dashed after:border-brass after:opacity-60">
                  <HugeiconsIcon icon={item.icon} size={20} />
                </span>
                <span className="-mt-2.5">{item.title}</span>
                {active && <NavUnderline />}
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-end gap-1 text-[9.5px] font-semibold",
                active ? "text-petrol" : "text-muted-2"
              )}
            >
              <HugeiconsIcon icon={item.icon} size={20} />
              {item.title}
              {active ? <NavUnderline /> : <span className="h-[2.5px]" />}
            </Link>
          );
        })}
        <Link
          href="/more"
          className={cn(
            "flex flex-col items-center justify-end gap-1 text-[9.5px] font-semibold",
            moreActive ? "text-petrol" : "text-muted-2"
          )}
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={20} />
          Lainnya
          {moreActive ? <NavUnderline /> : <span className="h-[2.5px]" />}
        </Link>
      </div>
    </nav>
  );
}

function NavUnderline() {
  return (
    <span className="h-[2.5px] w-3.5 rounded-[2px] bg-brass" aria-hidden />
  );
}