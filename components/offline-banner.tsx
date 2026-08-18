"use client";

import { useOffline } from "next/offline";
import { HugeiconsIcon } from "@hugeicons/react";
import { WifiDisconnected01Icon } from "@hugeicons/core-free-icons";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-white"
    >
      <HugeiconsIcon icon={WifiDisconnected01Icon} size={16} />
      Tidak ada koneksi internet. Periksa koneksi Anda.
    </div>
  );
}