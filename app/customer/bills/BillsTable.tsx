"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FilterIcon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STATUS_VARIANTS: Record<string, "secondary" | "success" | "destructive" | "default"> = {
  unpaid: "secondary",
  pending: "secondary",
  paid: "success",
  overdue: "destructive",
  cancelled: "default",
};

export function BillsTable({
  initialBills,
  total,
  initialPage,
  initialStatusFilter,
}: BillsTableProps) {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [totalCount, setTotalCount] = useState(total);
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState<"all" | "unpaid" | "pending" | "paid" | "overdue">(initialStatusFilter);
  const [loading, setLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchBills(nextPage: number) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customer/bills?page=${nextPage}&limit=20&status=${statusFilter}`,
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

  async function handleFilterChange(nextStatus: "all" | "pending" | "paid" | "overdue") {
    setStatusFilter(nextStatus);
    setFilterOpen(false);
    await fetchBills(1);
  }

  if (bills.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
        <HugeiconsIcon icon={InvoiceIcon} className="size-8" />
        <p className="font-medium">Tidak ada tagihan</p>
        <p className="text-sm">
          {statusFilter !== "all"
            ? `Tidak ada tagihan dengan status "${STATUS_LABELS[statusFilter] || statusFilter}"`
            : "Belum ada tagihan sama sekali"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-medium">Tagihan Saya</h2>
        <div ref={filterRef} className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon-xl"
            aria-label="Filter status tagihan"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <HugeiconsIcon icon={FilterIcon} size={18} />
            {(statusFilter !== "all" || bills.some((b) => b.status !== "paid")) && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {filterOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
            >
              {[
                { key: "all", label: "Semua" },
                { key: "unpaid", label: "Belum Lunas" },
                { key: "paid", label: "Lunas" },
                { key: "overdue", label: "Terlambat" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  role="option"
                  aria-selected={statusFilter === filter.key}
                  onClick={() => handleFilterChange(filter.key as "all" | "pending" | "paid" | "overdue")}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                    statusFilter === filter.key
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-muted-foreground">Periode</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Jumlah</th>
              <th className="text-center px-3 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-3 py-2 font-medium text-muted-foreground">Jatuh Tempo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bills.map((bill) => (
              <tr
                key={bill.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/customer/bills/${bill.id}`)}
              >
                <td className="px-3 py-3">{formatShortPeriod(bill.period)}</td>
                <td className="text-right px-3 py-3 font-medium">{formatCurrency(bill.total_amount)}</td>
                <td className="text-center px-3 py-3">
                  <Badge variant={STATUS_VARIANTS[bill.status] || "default"}>
                    {STATUS_LABELS[bill.status] || bill.status}
                  </Badge>
                </td>
                <td className="text-right px-3 py-3 text-muted-foreground">
                  {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bills.length < totalCount && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchBills(page + 1)}
            disabled={loading}
            className="w-full max-w-xs"
          >
            {loading ? "Memuat..." : `Muat Lebih Banyak (${bills.length}/${totalCount})`}
          </Button>
        </div>
      )}
    </div>
  );
}

export default BillsTable;
