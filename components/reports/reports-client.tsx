"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Chart01Icon,
  Download01Icon,
  FilterResetIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import type { ReportRow, ReportSummary } from "@/lib/data/reports";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatPeriodLabel(period: string): string {
  const [year, month] = period.split("-");
  const monthIndex = Number(month) - 1;
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

export function ReportsClient({
  period,
  summary,
  rows,
  hasActiveFilters,
}: {
  period: string;
  summary: ReportSummary;
  rows: ReportRow[];
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function changePeriod(next: string) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("period", next);
    router.push(`/reports?${sp.toString()}`);
  }

  function downloadCsv() {
    const header = [
      "Nomor Pelanggan",
      "Nama",
      "Status",
      "Pemakaian (m3)",
      "Tagihan",
      "Dibayar",
      "Status Tagihan",
    ];
    const lines = rows.map((r) =>
      [
        r.customer_number,
        `"${r.name}"`,
        r.status,
        r.usage,
        r.total_amount,
        r.paid_amount,
        r.bill_status,
      ].join(",")
    );
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link
          href="/dashboard"
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Laporan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {formatPeriodLabel(period)} · Saldo bersih{" "}
            {formatCurrency(summary.netCash)}
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Filter & Aksi" />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => changePeriod(e.target.value)}
            className="h-11 rounded-[10px] border border-line bg-card pl-3 pr-8 text-sm font-mono text-[13px] text-petrol outline-none focus-visible:border-aqua focus-visible:ring-3 focus-visible:ring-aqua/20 appearance-none"
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date();
              d.setMonth(d.getMonth() - i);
              const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
              return (
                <option key={val} value={val}>
                  {formatPeriodLabel(val)}
                </option>
              );
            })}
          </select>
          <Button
            variant="outline"
            className="rounded-[10px] border-line"
            onClick={downloadCsv}
          >
            <HugeiconsIcon icon={Download01Icon} />
            Download CSV
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/reports")}
              className="font-mono text-[11px] font-semibold text-muted-text hover:text-petrol"
            >
              <HugeiconsIcon icon={FilterResetIcon} />
              Reset Filter
            </Button>
          )}
        </div>
      </section>

      {rows.length === 0 ? (
        <EmptyState period={period} />
      ) : (
        <section className="flex flex-col">
          <SectionHeading title="Daftar Pelanggan" />
          <div className="rounded-[14px] border border-line bg-card divide-y divide-dashed divide-line">
            {rows.map((r) => (
              <Link
                key={r.customer_number}
                href={`/customers/${r.id}`}
                className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] bg-transparent py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:bg-petrol/3 hover:shadow-md"
              >
                <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60" />
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 border-t border-dashed border-line"
                />
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 border-t border-dashed border-line"
                />
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
                    r.bill_status === "paid"
                      ? "bg-green-light text-green"
                      : r.bill_status === "overdue"
                        ? "bg-coral-light text-coral"
                        : r.bill_status === "unpaid"
                          ? "bg-brass-light text-brass"
                          : "bg-muted text-muted-2"
                  )}
                >
                  <HugeiconsIcon icon={Chart01Icon} size={20} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[13.5px] font-semibold text-petrol">
                    {r.name}
                  </p>
                  <p className="truncate font-mono text-[11px] text-muted-2">
                    {r.customer_number}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">
                    {formatCurrency(r.total_amount)}
                  </span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                      r.bill_status === "paid"
                        ? "bg-green-light text-green"
                        : r.bill_status === "overdue"
                          ? "bg-coral-light text-coral"
                          : r.bill_status === "unpaid"
                            ? "bg-brass-light text-brass"
                            : "bg-muted text-muted-2"
                    )}
                  >
                    {r.bill_status === "paid"
                      ? "LUNAS"
                      : r.bill_status === "overdue"
                        ? "TERLAMBAT"
                        : r.bill_status === "unpaid"
                          ? "BELUM"
                          : "—"}
                  </span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3.5"
                    />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState({ period }: { period: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-muted text-muted-2">
        <HugeiconsIcon icon={Chart01Icon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">
          Belum ada data
        </p>
        <p className="text-[13px] text-muted-2">
          Tambahkan pelanggan untuk melihat laporan{" "}
          {formatPeriodLabel(period)}.
        </p>
      </div>
    </div>
  );
}
