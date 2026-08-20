"use client";

import { Menu } from "@base-ui/react/menu";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { DropletIcon, Logout01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { getCustomerProfile, logoutCustomerAction } from "@/app/actions/customer-auth";
import { CustomerBottomNav } from "./CustomerBottomNav";

function getInitial(name: string | null): string {
  return name?.trim().charAt(0).toUpperCase() || "P";
}

export function CustomerPortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [, startLogout] = useTransition();
  const [customerName, setCustomerName] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCustomerProfile().then((profile) => {
      if (active) setCustomerName(profile?.name ?? null);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HugeiconsIcon icon={DropletIcon} size={18} />
          </div>
          <span className="font-medium text-ink">Alira</span>
        </div>
        <Menu.Root>
          <Menu.Trigger
            aria-label="Menu akun pelanggan"
            className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-active focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {getInitial(customerName)}
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner align="end" sideOffset={8} className="z-50">
              <Menu.Popup className="min-w-52 rounded-md border border-border bg-popover p-1 text-sm shadow-md outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
                <div className="flex flex-col gap-0.5 px-3 py-2">
                  <p className="truncate font-medium text-foreground">
                    {customerName ?? "Pelanggan"}
                  </p>
                  <p className="text-xs text-muted-foreground">Pelanggan PAM</p>
                </div>
                <div className="mx-2 h-px bg-border" />
                <Menu.Item
                  onClick={() => router.push("/customer/profile")}
                  className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none transition-colors data-highlighted:bg-muted"
                >
                  <HugeiconsIcon icon={UserIcon} className="size-4" />
                  Profil Saya
                </Menu.Item>
                <Menu.Item
                  onClick={() => startLogout(() => logoutCustomerAction())}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-destructive outline-none transition-colors data-highlighted:bg-destructive/10"
                >
                  <HugeiconsIcon icon={Logout01Icon} className="size-4" />
                  Keluar
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <CustomerBottomNav />
    </div>
  );
}
