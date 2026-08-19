"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HomeIcon, InvoiceIcon, GaugeIcon, UserIcon } from "@hugeicons/core-free-icons";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customer/bills", label: "Tagihan", icon: InvoiceIcon },
  { href: "/customer/meter-readings", label: "Meter", icon: GaugeIcon },
  { href: "/customer/profile", label: "Profil", icon: UserIcon },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 py-2 text-[11px] font-medium
                ${active ? "text-primary" : "text-muted-foreground"}
              `}
            >
              <HugeiconsIcon icon={item.icon} size={22} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
