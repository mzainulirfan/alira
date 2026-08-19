"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { InvoiceIcon } from "@hugeicons/core-free-icons";
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

const FILTER_OPTIONS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Lunas" },
  { key: "paid", label: "Lunas" },
  { key: "overdue", label: "Terlambat" },
] as const;

type StatusFilter = (typeof FILTER_OPTIONS)[number]["key"];

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-medium">Tagihan Saya</h2>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {FILTER_OPTIONS.map((filter) => (
            <Button
              key={filter.key}
              type="button"
              variant={statusFilter === filter.key ? "default" : "outline"}
              size="sm"
              disabled={loading && statusFilter !== filter.key}
              onClick={() => handleFilterChange(filter.key)}
              className={cn(
                "shrink-0 px-3",
                statusFilter !== filter.key && "bg-card"
              )}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {bills.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border py-12 text-center text-muted-foreground">
          <HugeiconsIcon icon={InvoiceIcon} className="size-8" />
          <p className="font-medium">Tidak ada tagihan</p>
          <p className="text-sm">
            {statusFilter !== "all"
              ? `Tidak ada tagihan dengan status "${STATUS_LABELS[statusFilter] || statusFilter}"`
              : "Belum ada tagihan sama sekali"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Periode</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Jumlah</th>
                <th className="px-3 py-2 text-center font-medium text-muted-foreground">Status</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bills.map((bill) => (
                <tr
                  key={bill.id}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                  onClick={() => router.push(`/customer/bills/${bill.id}`)}
                >
                  <td className="px-3 py-3">{formatShortPeriod(bill.period)}</td>
                  <td className="px-3 py-3 text-right font-medium">{formatCurrency(bill.total_amount)}</td>
                  <td className="px-3 py-3 text-center">
                    <Badge variant={STATUS_VARIANTS[bill.status] || "default"}>
                      {STATUS_LABELS[bill.status] || bill.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-right text-muted-foreground">
                    {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
