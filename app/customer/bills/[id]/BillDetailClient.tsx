"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  GaugeIcon,
  Calendar01Icon,
  BanknoteIcon,
  Clock01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency, formatMeter, formatShortPeriod } from "@/lib/format";
import type { Bill } from "@/lib/types";

interface BillDetailClientProps {
  bill: Bill;
}

const STATUS_LABELS: Record<string, string> = {
  unpaid: "Belum Lunas",
  paid: "Lunas",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANTS: Record<string, "secondary" | "success" | "destructive" | "default"> = {
  unpaid: "secondary",
  paid: "success",
  overdue: "destructive",
  cancelled: "default",
};

export default function BillDetailClient({ bill }: BillDetailClientProps) {
  const isOverdue = bill.status === "overdue";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Detail Tagihan</h1>
          <p className="text-sm text-muted-foreground">
            Periode {formatShortPeriod(bill.period)}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[bill.status] || "default"}>
          {STATUS_LABELS[bill.status] || bill.status}
        </Badge>
      </header>

      {isOverdue && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
          <HugeiconsIcon icon={AlertCircleIcon} size={18} className="text-destructive" />
          <p className="text-sm text-destructive">
            Tagihan ini sudah melewati jatuh tempo. Segera lakukan pembayaran untuk menghindari denda.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={InvoiceIcon} size={18} />
            Rincian Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <HugeiconsIcon icon={BanknoteIcon} size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Abonemen Bulanan</p>
                <p className="font-medium">{formatCurrency(bill.monthly_fee ?? 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
                <HugeiconsIcon icon={GaugeIcon} size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pemakaian Air</p>
                <p className="font-medium">{formatMeter(bill.usage ?? 0)} m³</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-warning/10 text-warning">
                <HugeiconsIcon icon={BanknoteIcon} size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Harga per m³</p>
                <p className="font-medium">{formatCurrency(bill.price_per_m3 ?? 0)}/m³</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Tagihan</span>
              <span>{formatCurrency(bill.total_amount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar01Icon} size={18} />
            Informasi Tagihan
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Calendar01Icon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Periode</p>
              <p className="font-medium">{formatShortPeriod(bill.period)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
              <p className="font-medium">
                {bill.due_date ? new Date(bill.due_date).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dibuat</p>
              <p className="font-medium">
                {bill.created_at ? new Date(bill.created_at).toLocaleDateString("id-ID") : "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="font-medium">{STATUS_LABELS[bill.status] || bill.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 pt-4">
        <Link href="/customer/bills">
          <Button variant="outline" className="flex-1">
            Kembali ke Daftar Tagihan
          </Button>
        </Link>
      </div>
    </div>
  );
}