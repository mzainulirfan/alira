"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Chart01Icon, Download01Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatMeter, formatShortPeriod } from "@/lib/format";
import type { ReportRow, ReportSummary } from "@/lib/data/reports";

export function ReportsClient({
  period,
  summary,
  rows,
}: {
  period: string;
  summary: ReportSummary;
  rows: ReportRow[];
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Laporan</h1>
          <p className="text-sm text-muted-foreground">
            {formatShortPeriod(period)}
          </p>
        </div>
        <input
          type="month"
          value={period}
          onChange={(e) => changePeriod(e.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Total Pelanggan" value={String(summary.totalCustomers)} />
        <SummaryCard label="Pelanggan Aktif" value={String(summary.activeCustomers)} />
        <SummaryCard label="Total Pemakaian" value={formatMeter(summary.totalUsage)} />
        <SummaryCard label="Total Tagihan" value={formatCurrency(summary.totalBilled)} />
        <SummaryCard label="Pembayaran Masuk" value={formatCurrency(summary.totalPaid)} />
        <SummaryCard label="Belum Dibayar" value={formatCurrency(summary.totalUnpaid)} />
        <SummaryCard label="Menunggak" value={String(summary.overdue)} />
        <SummaryCard label="Jumlah Pembayaran" value={String(summary.paymentsCount)} />
      </div>

      <Button variant="outline" onClick={downloadCsv}>
        <HugeiconsIcon icon={Download01Icon} />
        Download CSV
      </Button>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={Chart01Icon} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Belum ada data.</p>
              <p className="text-sm text-muted-foreground">
                Tambahkan pelanggan untuk melihat laporan bulanan.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col divide-y p-0">
            {rows.map((r) => (
              <div key={r.customer_number} className="flex items-center justify-between gap-2 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.customer_number}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold">
                    {formatCurrency(r.total_amount)}
                  </span>
                  <Badge
                    variant={
                      r.bill_status === "paid"
                        ? "success"
                        : r.bill_status === "unpaid" || r.bill_status === "no_bill"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {r.bill_status === "paid"
                      ? "Lunas"
                      : r.bill_status === "overdue"
                        ? "Menunggak"
                        : r.bill_status === "unpaid"
                          ? "Belum"
                          : "—"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}