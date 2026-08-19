"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { Bill, MeterReading, Payment } from "@/lib/types";

interface BillDetailClientProps {
  bill: Bill;
  reading: MeterReading | null;
  payment: Pick<Payment, "id" | "payment_date"> | null;
}

const STATUS_LABELS: Record<Bill["status"], string> = {
  unpaid: "Belum lunas",
  paid: "Lunas",
  overdue: "Terlambat",
  cancelled: "Dibatalkan",
};

const STATUS_VARIANTS: Record<
  Bill["status"],
  "secondary" | "success" | "destructive" | "default"
> = {
  unpaid: "secondary",
  paid: "success",
  overdue: "destructive",
  cancelled: "default",
};

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </p>
  );
}

function InfoRow({
  label,
  value,
  valueClassName = "",
  secondary,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {secondary && <p className="mt-0.5 text-xs text-muted-foreground">{secondary}</p>}
      </div>
      <p className={`text-sm font-medium text-foreground ${valueClassName}`}>{value}</p>
    </div>
  );
}

function SectionDivider() {
  return <div className="border-t border-border/70" />;
}

function getOverdueDays(dueDate: string | null): number | null {
  if (!dueDate) return null;

  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = today.getTime() - due.getTime();
  if (diff <= 0) return null;

  return Math.max(1, Math.floor(diff / 86_400_000));
}

function getStatusNote(
  bill: Bill,
  payment: Pick<Payment, "id" | "payment_date"> | null
): string {
  if (bill.status === "paid") {
    return payment ? `Dibayar ${formatDate(payment.payment_date)}` : "Sudah dibayar";
  }

  if (bill.status === "overdue") {
    const overdueDays = getOverdueDays(bill.due_date);
    const dueText = bill.due_date ? `Jatuh tempo ${formatDate(bill.due_date)}` : null;
    if (overdueDays) {
      return dueText ? `Lewat ${overdueDays} hari | ${dueText}` : `Lewat ${overdueDays} hari`;
    }
    return dueText ?? "Menunggu pembayaran";
  }

  if (bill.status === "cancelled") {
    return "Tagihan dibatalkan";
  }

  return bill.due_date ? `Bayar sebelum ${formatDate(bill.due_date)}` : "Menunggu pembayaran";
}

export default function BillDetailClient({
  bill,
  reading,
  payment,
}: BillDetailClientProps) {
  const statusLabel = STATUS_LABELS[bill.status];
  const statusVariant = STATUS_VARIANTS[bill.status];
  const statusNote = getStatusNote(bill, payment);
  const hasReading = Boolean(reading);
  const hasPreviousReading = Boolean(reading && reading.previous_reading > 0);
  const tariffLabel =
    bill.price_per_m3 != null ? `${formatCurrency(bill.price_per_m3)} / m3` : "Tarif belum tersedia";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href="/customer/bills" />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} />
          <span className="sr-only">Kembali ke daftar tagihan</span>
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl font-medium">Detail Tagihan</h1>
          <p className="truncate text-sm text-muted-foreground">{formatShortPeriod(bill.period)}</p>
        </div>
      </header>

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <section className="space-y-3">
            <div className="space-y-1">
              <SectionTitle>Periode</SectionTitle>
              <p className="text-lg font-medium text-foreground">
                {formatShortPeriod(bill.period)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant}>{statusLabel}</Badge>
                <span className="text-sm text-muted-foreground">{statusNote}</span>
              </div>
              <p className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
                {formatCurrency(bill.total_amount)}
              </p>
            </div>

            {bill.status === "overdue" && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  size={18}
                  className="mt-0.5 shrink-0 text-destructive"
                />
                <p className="text-sm text-destructive">Tagihan ini sudah melewati jatuh tempo.</p>
              </div>
            )}
          </section>

          <SectionDivider />

          <section className="space-y-3">
            <SectionTitle>Pemakaian air</SectionTitle>
            {hasReading ? (
              <div className="space-y-3">
                {hasPreviousReading ? (
                  <InfoRow
                    label="Meter sebelumnya"
                    value={formatMeter(reading!.previous_reading)}
                  />
                ) : (
                  <InfoRow
                    label="Pencatatan pertama"
                    value={formatMeter(reading!.current_reading)}
                  />
                )}
                <InfoRow label="Meter sekarang" value={formatMeter(reading!.current_reading)} />
                <InfoRow
                  label="Pemakaian"
                  value={formatMeter(bill.usage)}
                  valueClassName="text-base"
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Data pencatatan meter belum tersedia.</p>
            )}
          </section>

          <SectionDivider />

          <section className="space-y-3">
            <SectionTitle>Rincian tagihan</SectionTitle>

            <div className="space-y-3">
              <InfoRow
                label="Pemakaian air"
                value={formatCurrency(bill.water_amount)}
                secondary={
                  bill.price_per_m3 != null
                    ? `${formatMeter(bill.usage)} x ${tariffLabel}`
                    : undefined
                }
              />
              <InfoRow label="Abonemen" value={formatCurrency(bill.monthly_fee)} />
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-medium text-foreground">
                  {formatCurrency(bill.total_amount)}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {bill.price_per_m3 != null ? `Tarif air ${tariffLabel}` : tariffLabel}
              </p>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
