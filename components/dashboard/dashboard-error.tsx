"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { RefreshIcon, Alert02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function DashboardError({
  onReset,
}: {
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
        <HugeiconsIcon icon={Alert02Icon} className="size-6" />
      </span>
      <div>
        <p className="text-sm font-medium">Data belum berhasil dimuat</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Periksa koneksi Anda lalu coba muat ulang.
        </p>
      </div>
      <Button size="sm" onClick={onReset}>
        <HugeiconsIcon icon={RefreshIcon} className="size-4" />
        Muat ulang
      </Button>
    </div>
  );
}