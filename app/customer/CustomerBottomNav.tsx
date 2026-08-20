"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HomeIcon, InvoiceIcon, GaugeIcon, UserIcon } from "@hugeicons/core-free-icons";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customer/bills", label: "Tagihan", icon: InvoiceIcon },
  { href: "/customer/meter-readings", label: "Meter", icon: GaugeIcon },
  { href: "/customer/profile", label: "Profil", icon: UserIcon },
] as const;

export function CustomerBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 px-1 py-2.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
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
              {item.label}
              {active ? (
                <span className="h-[2.5px] w-3.5 rounded-[2px] bg-brass" aria-hidden />
              ) : (
                <span className="h-[2.5px]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}