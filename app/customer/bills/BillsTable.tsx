"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  ArrowLeft01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatShortPeriod } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bill } from "@/lib/types";

interface BillsTableProps {
  initialBills: Bill[];
  total: number;
  initialPage: number;
  initialStatusFilter: "all" | "unpaid" | "pending" | "paid" | "overdue";
}

const STATUS_LABELS: Record<string, string> = {
  unpaid: "Belum Lunas",
  pending: "Belum Lunas",
  paid: "Lunas",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  unpaid: { bg: "bg-brass-light", text: "text-brass", dot: "bg-brass" },
  pending: { bg: "bg-brass-light", text: "text-brass", dot: "bg-brass" },
  paid: { bg: "bg-green-light", text: "text-green", dot: "bg-green" },
  overdue: { bg: "bg-coral-light", text: "text-coral", dot: "bg-coral" },
  cancelled: { bg: "bg-muted-2/10", text: "text-muted-2", dot: "bg-muted-2" },
};

const FILTER_OPTIONS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Lunas" },
  { key: "paid", label: "Lunas" },
  { key: "overdue", label: "Terlambat" },
] as const;

type StatusFilter = (typeof FILTER_OPTIONS)[number]["key"];

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof InvoiceIcon;
  tone: "info" | "warning" | "success";
}) {
  const tones = {
    info: "bg-aqua-light text-aqua",
    warning: "bg-brass-light text-brass",
    success: "bg-green-light text-green",
  };

  return (
    <div className="flex flex-col rounded-[14px] border border-line bg-card p-3">
      <div className="flex items-center gap-2">
        <span className={cn("flex size-7 items-center justify-center rounded-[8px]", tones[tone])}>
          <HugeiconsIcon icon={icon} className="size-3.5" />
        </span>
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
          {label}
        </p>
      </div>
      <p className="mt-2 font-mono text-[19px] font-semibold text-petrol">{value}</p>
    </div>
  );
}

function BillItem({
  bill,
  onClick,
}: {
  bill: Bill;
  onClick: () => void;
}) {
  const colors = STATUS_COLORS[bill.status] || STATUS_COLORS.unpaid;
  const isPaid = bill.status === "paid";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 text-left transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <span className={cn("absolute top-0 bottom-0 left-0 w-1", isPaid ? "bg-green" : "bg-brass")} />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />

      <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={InvoiceIcon} size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-display text-[13.5px] font-semibold text-petrol">
            {formatShortPeriod(bill.period)}
          </p>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold", colors.bg, colors.text)}>
            <span className={cn("size-1 rounded-full", colors.dot)} />
            {STATUS_LABELS[bill.status] || bill.status}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-mono text-[13px] font-semibold text-petrol">
            {formatCurrency(bill.total_amount)}
          </p>
          {bill.due_date && (
            <span className="font-mono text-[11px] text-muted-2">
              {bill.status === "paid" ? "Dibayar" : "Jatuh tempo"} {new Date(bill.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      <HugeiconsIcon
        icon={ArrowLeft01Icon}
        size={18}
        className="shrink-0 rotate-180 text-muted-2 transition-transform group-hover:translate-x-0.5 group-hover:text-petrol"
      />
    </button>
  );
}

export function BillsTable({
  initialBills,
  total,
  initialPage,
  initialStatusFilter,
}: BillsTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [totalCount, setTotalCount] = useState(total);
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    initialStatusFilter === "pending" ? "unpaid" : initialStatusFilter
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const summary = useMemo(() => {
    const unpaid = initialBills.filter((b) => b.status === "unpaid" || b.status === "pending").length;
    const paid = initialBills.filter((b) => b.status === "paid").length;
    const overdue = initialBills.filter((b) => b.status === "overdue").length;
    return { unpaid, paid, overdue };
  }, [initialBills]);

  async function fetchBills(nextPage: number, nextStatus = statusFilter) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customer/bills?page=${nextPage}&limit=20&status=${nextStatus}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Gagal memuat tagihan");
      const data = await res.json();
      setBills(data.data);
      setTotalCount(data.total);
      setPage(data.page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilterChange(nextStatus: StatusFilter) {
    setStatusFilter(nextStatus);
    await fetchBills(1, nextStatus);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/customer/dashboard")}
          className="flex size-9 items-center justify-center rounded-[10px] border border-line bg-card text-petrol transition-colors hover:bg-aqua-light hover:text-aqua"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Tagihan Saya
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {totalCount} tagihan total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <SummaryCard
          label="Belum Lunas"
          value={String(summary.unpaid)}
          icon={Clock01Icon}
          tone="warning"
        />
        <SummaryCard
          label="Lunas"
          value={String(summary.paid)}
          icon={CheckmarkCircle01Icon}
          tone="success"
        />
        <SummaryCard
          label="Terlambat"
          value={String(summary.overdue)}
          icon={InvoiceIcon}
          tone="info"
        />
      </div>

      <section className="flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[15px] font-bold text-petrol">Daftar Tagihan</h2>
          <div className="flex gap-1.5">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                disabled={loading && statusFilter !== filter.key}
                onClick={() => handleFilterChange(filter.key)}
                className={cn(
                  "rounded-full px-3 py-1 font-mono text-[11px] font-semibold transition-colors",
                  statusFilter === filter.key
                    ? "bg-petrol text-white"
                    : "bg-card text-muted-2 border border-line hover:bg-aqua-light hover:text-aqua"
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-line bg-card py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted-2/10">
              <HugeiconsIcon icon={InvoiceIcon} className="size-6 text-muted-2" />
            </div>
            <p className="font-display text-[13.5px] font-semibold text-petrol">Tidak ada tagihan</p>
            <p className="text-[12.5px] text-muted-2">
              {statusFilter !== "all"
                ? `Tidak ada tagihan dengan status "${STATUS_LABELS[statusFilter] || statusFilter}"`
                : "Belum ada tagihan sama sekali"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {bills.map((bill) => (
              <BillItem
                key={bill.id}
                bill={bill}
                onClick={() => router.push(`/customer/bills/${bill.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {bills.length < totalCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchBills(page + 1)}
            disabled={loading}
            className="w-full max-w-xs rounded-[10px] border-line"
          >
            {loading ? "Memuat..." : `Muat Lebih Banyak (${bills.length}/${totalCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}

export default BillsTable;
