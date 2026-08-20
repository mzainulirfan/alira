"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon, HomeIcon, InvoiceIcon, GaugeIcon, UserIcon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customer/bills", label: "Tagihan", icon: InvoiceIcon },
  { href: "/customer/meter-readings", label: "Meter", icon: GaugeIcon },
  { href: "/customer/profile", label: "Profil", icon: UserIcon },
] as const;

export function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <div className="flex size-[30px] items-center justify-center rounded-[9px] bg-petrol text-aqua">
          <HugeiconsIcon icon={DropletIcon} size={17} />
        </div>
        <span className="font-display text-[19px] font-bold tracking-[-0.01em] text-petrol">
          Alira
          <span className="ml-1 align-middle font-display text-[13px] font-semibold uppercase tracking-[0.02em] text-brass">
            AJA
          </span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[9px] px-3 py-2 font-display text-[13.5px] font-semibold transition-colors",
                active
                  ? "bg-petrol text-white"
                  : "text-muted-text hover:bg-aqua-light hover:text-petrol"
              )}
            >
              <HugeiconsIcon icon={item.icon} size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}