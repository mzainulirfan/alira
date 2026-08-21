"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { formatShortPeriodLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

function getMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatShortPeriodLabel(value) });
  }
  return options;
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function PeriodPicker({
  period,
  basePath = "/dashboard",
  className,
}: {
  period: string;
  basePath?: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mounted = useMounted();
  const options = mounted ? getMonthOptions() : [{ value: "", label: "..." }];

  function changePeriod(next: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("period", next);
    router.push(`${basePath}?${sp.toString()}`);
  }

  return (
    <div className={cn("relative shrink-0", className)}>
      <HugeiconsIcon
        icon={Calendar01Icon}
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-brass"
      />
      <select
        value={period}
        onChange={(e) => changePeriod(e.target.value)}
        aria-label="Pilih periode"
        className="h-9 w-full appearance-none rounded-[10px] border border-line bg-card pl-9 pr-8 font-mono text-[12.5px] font-semibold text-petrol focus:border-petrol/40 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-muted-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
