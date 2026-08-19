"use client";

import { redirect } from "next/navigation";
import { getCurrentCustomerProfile } from "@/lib/auth/customer-dal";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon, Logout01Icon, HomeIcon, InvoiceIcon, GaugeIcon, UserIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/customer/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/customer/bills", label: "Tagihan", icon: InvoiceIcon },
  { href: "/customer/meter-readings", label: "Meter", icon: GaugeIcon },
  { href: "/customer/profile", label: "Profil", icon: UserIcon },
] as const;

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentCustomerProfile();
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <Link href="/customer/dashboard" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={DropletIcon} size={18} />
          </div>
          <span className="font-semibold text-ink">{profile?.name}</span>
        </Link>
        <form action={logoutCustomerAction}>
          <Button type="submit" variant="ghost" size="icon" className="gap-1.5">
            <HugeiconsIcon icon={Logout01Icon} size={18} />
            <span className="hidden sm:inline">Keluar</span>
          </Button>
        </form>
      </header>
      <main className="mx-auto flex-1 w-full max-w-3xl px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="grid grid-cols-5">
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
          <Link
            href="/customer/login"
            onClick={(e) => { e.preventDefault(); (document.querySelector('form[action*="logout"]') as HTMLFormElement)?.requestSubmit(); }}
            className={`
              flex flex-col items-center gap-1 py-2 text-[11px] font-medium
              text-muted-foreground
            `}
          >
            <HugeiconsIcon icon={Logout01Icon} size={22} />
            Keluar
          </Link>
        </div>
      </nav>
    </div>
  );
}

async function logoutCustomerAction() {
  "use server";
  const { deleteCustomerSession } = await import("@/lib/auth/customer-jwt");
  await deleteCustomerSession();
  redirect("/customer/login");
}