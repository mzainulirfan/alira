"use client";

import { Menu } from "@base-ui/react/menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";
import { logoutAction } from "@/app/actions/auth";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function UserMenu({ pamName }: { pamName: string }) {
  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label="Menu akun"
        className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/80 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {getInitial(pamName)}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="min-w-52 rounded-xl border border-border bg-popover p-1 text-sm shadow-md outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <div className="flex flex-col gap-0.5 px-3 py-2">
              <p className="truncate font-medium text-foreground">{pamName}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <div className="mx-2 h-px bg-border" />
            <Menu.Item
              onClick={() => {
                void logoutAction();
              }}
              className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-destructive outline-none transition-colors data-highlighted:bg-destructive/10 data-highlighted:text-destructive"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
              Keluar
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}