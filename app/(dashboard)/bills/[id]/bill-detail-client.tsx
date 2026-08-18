"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BanknoteIcon,
  Calendar01Icon,
  Camera01Icon,
  GaugeIcon,
  InvoiceIcon,
  PrinterIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { AdjacentBill, BillWithCustomer } from "@/lib/data/bills";
import type { PaymentDetail } from "@/lib/data/payments";
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
  canManagePayment,
  payment,
  previousBill,
  nextBill,
  pamName,
}: {
  bill: BillWithCustomer;
  reading: MeterReading | null;
  canManagePayment: boolean;
  payment: PaymentDetail | null;
  previousBill: AdjacentBill | null;
  nextBill: AdjacentBill | null;
  pamName: string;
}) {
  const canPay =
    canManagePayment &&
    (bill.status === "unpaid" || bill.status === "overdue");
  const statusDescription = getStatusDescription(bill, payment);
  const whatsappUrl = getWhatsappUrl(bill);

  return (
    <div
      data-print-invoice
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 print:max-w-none"
    >
      <div className="hidden border-b pb-4 print:block">
        <p className="text-xl font-semibold">{pamName}</p>
        <p className="text-sm text-muted-foreground">Tagihan Air Pelanggan</p>
      </div>

      <div
        data-print-hide
        className="flex items-center justify-between gap-3 print:hidden"
      >
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" render={<Link href="/bills" />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} />
            <span className="sr-only">Kembali</span>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Detail Tagihan</h1>
            <p className="truncate text-sm text-muted-foreground">
              {formatShortPeriod(bill.period.slice(0, 7))}
            </p>
          </div>
        </div>
        <Badge variant={STATUS_VARIANT[bill.status]}>
          {STATUS_LABEL[bill.status]}
        </Badge>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <HugeiconsIcon icon={InvoiceIcon} size={21} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{bill.customer.name}</p>
              <p className="text-xs text-muted-foreground">
                {bill.customer.customer_number}
                {bill.customer.meter_number
                  ? ` · Meter ${bill.customer.meter_number}`
                  : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={`/customers/${bill.customer.id}`} />}
            >
              Detail
              <HugeiconsIcon icon={ArrowRight01Icon} />
            </Button>
          </div>

          <div className="rounded-xl bg-primary/5 px-4 py-5 ring-1 ring-primary/15">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Total Tagihan
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
              {formatCurrency(bill.total_amount)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-primary/10 pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
                Periode {formatShortPeriod(bill.period.slice(0, 7))}
              </span>
              {bill.due_date && (
                <span>Jatuh tempo {formatDate(bill.due_date)}</span>
              )}
            </div>
            <p className="mt-2 text-xs font-medium text-foreground/80">
              {statusDescription}
            </p>
          </div>
        </CardContent>
        {canPay && (
          <CardFooter data-print-hide className="print:hidden">
            <Button
              className="w-full"
              render={<Link href={`/payments/new?bill=${bill.id}`} />}
            >
              Catat Pembayaran
            </Button>
          </CardFooter>
        )}
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={GaugeIcon}
                className="size-4 text-muted-foreground"
              />
              Pencatatan Meter
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {reading ? (
              <>
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <MeterValue
                    label="Sebelumnya"
                    value={reading.previous_reading}
                  />
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="size-4 text-muted-foreground"
                  />
                  <MeterValue
                    label="Sekarang"
                    value={reading.current_reading}
                    align="right"
                  />
                </div>
                <div className="flex items-end justify-between border-t pt-3">
                  <span className="text-sm text-muted-foreground">Pemakaian</span>
                  <span className="text-xl font-semibold">
                    {formatMeter(bill.usage)}
                  </span>
                </div>
                {reading.photo_url && (
                  <a
                    href={reading.photo_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative mt-1 block overflow-hidden rounded-lg border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reading.photo_url}
                      alt={`Foto meter ${bill.customer.name}`}
                      className="h-28 w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-md bg-background/90 px-2 py-1 text-[11px] font-medium shadow-sm">
                      <HugeiconsIcon icon={Camera01Icon} className="size-3.5" />
                      Lihat Foto
                    </span>
                  </a>
                )}
              </>
            ) : (
              <div className="flex min-h-24 flex-col items-center justify-center rounded-lg bg-muted/50 px-4 text-center">
                <p className="text-sm font-medium">Pencatatan tidak tersedia</p>
                <p className="text-xs text-muted-foreground">
                  Pemakaian tagihan: {formatMeter(bill.usage)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle>Rincian Biaya</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <CostRow label="Biaya air" value={bill.water_amount} />
            <CostRow label="Abonemen" value={bill.monthly_fee} />
            <div className="flex items-center justify-between border-t pt-3">
              <span className="font-medium">Total</span>
              <span className="text-lg font-semibold">
                {formatCurrency(bill.total_amount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {payment && (
        <Card size="sm">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={BanknoteIcon}
                className="size-4 text-muted-foreground"
              />
              Informasi Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DetailValue label="Tanggal" value={formatDate(payment.payment_date)} />
            <DetailValue
              label="Metode"
              value={payment.payment_method === "cash" ? "Tunai" : "Transfer"}
            />
            <DetailValue label="Nominal" value={formatCurrency(payment.amount)} />
            <DetailValue
              label="Diterima oleh"
              value={payment.receiver_name ?? "Petugas tidak diketahui"}
            />
            {payment.notes && (
              <div className="sm:col-span-2">
                <DetailValue label="Catatan" value={payment.notes} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div
        data-print-hide
        className="grid grid-cols-2 gap-2 print:hidden"
      >
          <Button
            variant="outline"
            render={
              <a href={whatsappUrl} target="_blank" rel="noreferrer" />
            }
          >
            <HugeiconsIcon icon={WhatsappIcon} />
            Bagikan
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
          >
            <HugeiconsIcon icon={PrinterIcon} />
            Cetak / PDF
          </Button>
      </div>

      {(previousBill || nextBill) && (
        <div
          data-print-hide
          className="grid grid-cols-2 gap-2 print:hidden"
        >
          {previousBill ? (
            <BillNavigation bill={previousBill} direction="previous" />
          ) : (
            <div />
          )}
          {nextBill && <BillNavigation bill={nextBill} direction="next" />}
        </div>
      )}
    </div>
  );
}

function MeterValue({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: number;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : undefined}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 font-semibold">{formatMeter(value)}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{formatCurrency(value)}</span>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

function BillNavigation({
  bill,
  direction,
}: {
  bill: AdjacentBill;
  direction: "previous" | "next";
}) {
  const previous = direction === "previous";
  return (
    <Button
      variant="outline"
      className={previous ? "justify-start" : "justify-end"}
      render={<Link href={`/bills/${bill.id}`} />}
    >
      {previous && <HugeiconsIcon icon={ArrowLeft01Icon} />}
      <span className={previous ? "text-left" : "text-right"}>
        <span className="block text-[10px] font-normal text-muted-foreground">
          {previous ? "Sebelumnya" : "Berikutnya"}
        </span>
        {formatShortPeriod(bill.period.slice(0, 7))}
      </span>
      {!previous && <HugeiconsIcon icon={ArrowRight01Icon} />}
    </Button>
  );
}

function getStatusDescription(
  bill: BillWithCustomer,
  payment: PaymentDetail | null
): string {
  if (bill.status === "paid") {
    return payment
      ? `Lunas pada ${formatDate(payment.payment_date)}`
      : "Tagihan telah dibayar";
  }
  if (bill.status === "overdue" && bill.due_date) {
    const dueDate = new Date(`${bill.due_date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = Math.max(
      1,
      Math.floor((today.getTime() - dueDate.getTime()) / 86_400_000)
    );
    return `Melewati jatuh tempo ${days} hari`;
  }
  if (bill.status === "cancelled") return "Tagihan ini telah dibatalkan";
  return bill.due_date
    ? `Bayar sebelum ${formatDate(bill.due_date)}`
    : "Tagihan belum dibayar";
}

function getWhatsappUrl(bill: BillWithCustomer): string {
  const message = [
    `Tagihan air ${bill.customer.name}`,
    `No. pelanggan: ${bill.customer.customer_number}`,
    `Periode: ${formatShortPeriod(bill.period.slice(0, 7))}`,
    `Total: ${formatCurrency(bill.total_amount)}`,
    bill.due_date ? `Jatuh tempo: ${formatDate(bill.due_date)}` : null,
    `Status: ${STATUS_LABEL[bill.status]}`,
  ]
    .filter(Boolean)
    .join("\n");
  const rawPhone = bill.customer.phone?.replace(/\D/g, "") ?? "";
  const phone = rawPhone.startsWith("0") ? `62${rawPhone.slice(1)}` : rawPhone;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
