"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";
import { formatShortPeriod } from "@/lib/format";

function monthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    options.push({ value, label: formatShortPeriod(value) });
  }
  return options;
}

export function PeriodPicker({
  period,
  basePath = "/dashboard",
}: {
  period: string;
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = monthOptions();

  function changePeriod(next: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("period", next);
    router.push(`${basePath}?${sp.toString()}`);
  }

  return (
    <div className="relative">
      <HugeiconsIcon
        icon={Calendar01Icon}
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <select
        value={period}
        onChange={(e) => changePeriod(e.target.value)}
        aria-label="Pilih periode"
        className="h-8 appearance-none rounded-lg border border-border bg-card pl-8 pr-8 text-sm font-medium focus:border-ring focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}