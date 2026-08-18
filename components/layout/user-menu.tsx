"use client";

import { Menu } from "@base-ui/react/menu";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserIcon } from "@hugeicons/core-free-icons";
import { STAFF_ROLE_LABEL } from "@/lib/staff";
import type { StaffRole } from "@/lib/types";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function UserMenu({
  userName,
  role,
}: {
  userName: string;
  role: StaffRole;
}) {
  const router = useRouter();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Menu akun"
        className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {getInitial(userName)}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="min-w-52 rounded-xl border border-border bg-popover p-1 text-sm shadow-md outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <p className="truncate font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {STAFF_ROLE_LABEL[role]}
              </p>
            </div>
            <div className="mx-2 h-px bg-border" />
            <Menu.Item
              onClick={() => {
                router.push("/more/account");
              }}
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 outline-none transition-colors data-highlighted:bg-muted"
            >
              <HugeiconsIcon icon={UserIcon} className="size-4" />
              Kelola Akun
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
