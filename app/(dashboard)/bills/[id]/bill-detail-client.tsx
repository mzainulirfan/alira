"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  InvoiceIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { BillWithCustomer } from "@/lib/data/bills";
import type { MeterReading } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  unpaid: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "secondary",
};

export function BillDetailClient({
  bill,
  reading,
}: {
  bill: BillWithCustomer;
  reading: MeterReading | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" render={<Link href="/bills" />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="text-xl font-semibold">Detail Tagihan</h1>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <HugeiconsIcon icon={InvoiceIcon} size={24} className="text-muted-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">{bill.customer.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {bill.customer.customer_number}
                </p>
              </div>
            </div>
            <Badge variant={STATUS_VARIANT[bill.status]}>{STATUS_LABEL[bill.status]}</Badge>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Periode</span>
            <span className="font-medium">{formatShortPeriod(bill.period.slice(0, 7))}</span>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            {reading ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meter sebelumnya</span>
                  <span className="font-medium">{formatMeter(reading.previous_reading)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Meter sekarang</span>
                  <span className="font-medium">{formatMeter(reading.current_reading)}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" />
                Pencatatan meter tidak tersedia untuk tagihan ini.
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pemakaian</span>
              <span className="font-medium">{formatMeter(bill.usage)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Biaya Air</span>
              <span className="font-medium">{formatCurrency(bill.water_amount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abonemen</span>
              <span className="font-medium">{formatCurrency(bill.monthly_fee)}</span>
            </div>
            {bill.due_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jatuh Tempo</span>
                <span className="font-medium">{formatDate(bill.due_date)}</span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between rounded-lg bg-primary/5 px-3 py-2.5 ring-1 ring-primary/15">
              <span className="font-medium">TOTAL</span>
              <span className="text-xl font-semibold text-primary">
                {formatCurrency(bill.total_amount)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {bill.status === "unpaid" && (
        <Card>
          <CardHeader>
            <CardTitle>Pembayaran</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" render={<Link href={`/payments/new?bill=${bill.id}`} />}>
              Catat Pembayaran
            </Button>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" render={<Link href={`/customers/${bill.customer.id}`} />}>
        Lihat Pelanggan
      </Button>
    </div>
  );
}