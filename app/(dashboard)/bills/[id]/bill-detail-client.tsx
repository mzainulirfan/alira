"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Camera01Icon,
  Calendar01Icon,
  GaugeIcon,
  InvoiceIcon,
  PrinterIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import type { AdjacentBill, BillWithCustomer } from "@/lib/data/bills";
import type { PaymentDetail } from "@/lib/data/payments";
import type { MeterReading } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
};

export function BillDetailClient({
  bill,
  reading,
  canManagePayment,
  payment,
  previousBill,
  nextBill,
  settings,
}: {
  bill: BillWithCustomer;
  reading: MeterReading | null;
  canManagePayment: boolean;
  payment: PaymentDetail | null;
  previousBill: AdjacentBill | null;
  nextBill: AdjacentBill | null;
  settings: { pam_name: string; address: string | null; phone: string | null };
}) {
  const statusDescription = getStatusDescription(bill, payment);
  const whatsappUrl = getWhatsappUrl(bill);

  return (
    <>
      <div
        data-print-receipt
        className="hidden print:block"
      >
        <BillReceipt bill={bill} reading={reading} payment={payment} settings={settings} />
      </div>
      <div
        data-print-invoice
        className="mx-auto flex w-full max-w-3xl flex-col gap-5 print:max-w-none"
      >
      <div data-print-hide className="flex items-end justify-between gap-3">
        <Link href="/bills" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Detail Tagihan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {formatShortPeriod(bill.period)} · {bill.customer.name}
          </p>
        </div>
      </div>

      <BillHero
        status={bill.status}
        totalAmount={bill.total_amount}
        dueDate={bill.due_date}
        payment={payment}
      />

      <section className="flex flex-col">
        <SectionHeading title="Pelanggan" />
        <Link href={`/customers/${bill.customer.id}`} className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60" />
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
            <HugeiconsIcon icon={InvoiceIcon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{bill.customer.name}</p>
            <p className="truncate font-mono text-[11px] text-muted-2">{bill.customer.customer_number}{bill.customer.meter_number ? ` · Meter ${bill.customer.meter_number}` : ""}</p>
          </div>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </span>
        </Link>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Ringkasan Tagihan" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-12 items-center justify-center rounded-[10px]",
              bill.status === "overdue" ? "bg-coral-light text-coral" : "bg-aqua-light text-aqua"
            )}>
              <HugeiconsIcon icon={InvoiceIcon} size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[28px] font-bold text-petrol">{formatCurrency(bill.total_amount)}</p>
              <p className="font-mono text-[10.5px] text-muted-2">
                {statusDescription}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                bill.status === "overdue" ? "bg-coral-light text-coral" :
                bill.status === "paid" ? "bg-green-light text-green" :
                bill.status === "unpaid" ? "bg-brass-light text-brass" :
                "bg-muted text-muted-2"
              )}>
                {bill.status === "overdue" ? "TERLAMBAT" : STATUS_LABEL[bill.status].toUpperCase()}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-dashed border-line pt-3 font-mono text-[10.5px] text-muted-2">
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
              Periode {formatShortPeriod(bill.period)}
            </span>
            {bill.due_date && (
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Calendar01Icon} className="size-3.5" />
                Jatuh tempo {formatDate(bill.due_date)}
              </span>
            )}
          </div>
          {canManagePayment && (bill.status === "unpaid" || bill.status === "overdue") && (
            <div className="mt-4" data-print-hide>
              <Button className="w-full rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2" render={<Link href={`/payments/new?bill=${bill.id}`} />}>
                Catat Pembayaran
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Pencatatan Meter" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          {reading ? (
            <>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <MeterValue label="Sebelumnya" value={reading.previous_reading} />
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 text-muted-2" />
                <MeterValue label="Sekarang" value={reading.current_reading} align="right" />
              </div>
              <div className="mt-3 flex items-end justify-between border-t border-dashed border-line pt-3">
                <span className="font-mono text-[10.5px] text-muted-2">Pemakaian</span>
                <span className="font-mono text-[18px] font-bold text-petrol">{formatMeter(bill.usage)} m³</span>
              </div>
              {reading.photo_url && (
                <a
                  href={reading.photo_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative mt-3 block overflow-hidden rounded-[12px] border border-line"
                >
                  <img
                    src={reading.photo_url}
                    alt={`Foto meter ${bill.customer.name}`}
                    loading="lazy"
                    decoding="async"
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
            <div className="flex min-h-24 flex-col items-center justify-center gap-3 rounded-[12px] border border-dashed border-line bg-paper/50 px-4 text-center">
              <div className="flex size-10 items-center justify-center rounded-[10px] bg-muted text-muted-2">
                <HugeiconsIcon icon={GaugeIcon} size={20} />
              </div>
              <p className="font-display text-[13px] font-semibold text-petrol">Pencatatan tidak tersedia</p>
              <p className="font-mono text-[11px] text-muted-2">Pemakaian tagihan: {formatMeter(bill.usage)} m³</p>
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Rincian Biaya" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <CostRow label="Biaya air" value={bill.water_amount} />
          <CostRow label="Abonemen" value={bill.monthly_fee} />
          <div className="mt-1 flex items-center justify-between border-t border-dashed border-line pt-3">
            <span className="font-display text-[13px] font-semibold text-petrol">Total</span>
            <span className="font-mono text-[18px] font-bold text-petrol">{formatCurrency(bill.total_amount)}</span>
          </div>
        </div>
      </section>

      {payment && (
        <section className="flex flex-col">
          <SectionHeading title="Informasi Pembayaran" />
          <div className="rounded-[14px] border border-line bg-card p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <DetailValue label="Tanggal" value={formatDate(payment.payment_date)} />
              <DetailValue label="Metode" value={payment.payment_method === "cash" ? "Tunai" : "Transfer"} />
              <DetailValue label="Nominal" value={formatCurrency(payment.amount)} />
              <DetailValue label="Diterima oleh" value={payment.receiver_name ?? "Petugas tidak diketahui"} />
              {payment.notes && (
                <div className="sm:col-span-2">
                  <DetailValue label="Catatan" value={payment.notes} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="flex flex-col">
        <SectionHeading title="Navigasi" linkLabel="Semua Tagihan" linkHref="/bills" />
        <div className="grid gap-2 sm:grid-cols-2">
          <BillNavigation bill={previousBill} direction="previous" />
          <BillNavigation bill={nextBill} direction="next" />
        </div>
      </section>

      <div data-print-hide className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="rounded-[10px] border-line" render={<a href={whatsappUrl} target="_blank" rel="noreferrer" />}>
          <HugeiconsIcon icon={WhatsappIcon} />
          Bagikan
        </Button>
        <Button variant="outline" className="rounded-[10px] border-line" onClick={() => window.print()}>
          <HugeiconsIcon icon={PrinterIcon} />
          Cetak Struk
        </Button>
      </div>
      <div data-print-hide className="rounded-[10px] border border-dashed border-line bg-paper/50 p-3 text-center">
        <p className="font-mono text-[10.5px] text-muted-2">Pratinjau struk 80mm akan tampil saat cetak (Ctrl+P). Untuk printer thermal, pilih ukuran kertas 80mm.</p>
      </div>
    </div>
    </>
  );
}

function BillReceipt({
  bill,
  reading,
  payment,
  settings,
}: {
  bill: BillWithCustomer;
  reading: MeterReading | null;
  payment: PaymentDetail | null;
  settings: { pam_name: string; address: string | null; phone: string | null };
}) {
  const now = new Date();
  const isPaid = bill.status === "paid";
  const isOverdue = bill.status === "overdue";
  return (
    <div className="font-mono text-[9px] leading-[1.35] text-black">
      {/* Header — compact */}
      <div className="text-center leading-tight">
        <p className="text-[12px] font-bold uppercase tracking-[0.03em]">{settings.pam_name}</p>
        {settings.address && <p className="text-[7.5px] text-black/60">{settings.address}</p>}
        {settings.phone && <p className="text-[7.5px] text-black/60">Telp {settings.phone}</p>}
      </div>
      <div className="my-1.5 border-t border-dashed border-black" />
      <div className="text-center leading-tight">
        <p className="text-[9px] font-bold uppercase tracking-[0.06em]">{isPaid ? "KWITANSI" : "STRUK TAGIHAN"}</p>
        <p className="text-[7.5px] text-black/60">{formatShortPeriod(bill.period)} • {bill.customer.customer_number}</p>
      </div>
      <div className="my-1.5 border-t border-dashed border-black" />
      {/* Pelanggan — 2 baris */}
      <div className="text-[8.5px] leading-tight">
        <div className="flex justify-between gap-2"><span className="text-black/50">Pelanggan</span><span className="truncate font-semibold text-right">{bill.customer.name}</span></div>
        <div className="flex justify-between gap-2 text-[7.5px] text-black/50"><span>{bill.customer.customer_number}{bill.customer.meter_number ? ` • ${bill.customer.meter_number}` : ""}</span><span>{bill.customer.phone ?? ""}</span></div>
      </div>
      <div className="my-1.5 border-t border-dashed border-black" />
      {/* Meter — compact grid */}
      <div className="grid grid-cols-3 gap-1 text-center text-[8.5px] leading-tight">
        <div><p className="text-black/50">Lalu</p><p className="font-semibold">{reading ? formatMeter(reading.previous_reading) : "-"}</p></div>
        <div><p className="text-black/50">Kini</p><p className="font-semibold">{reading ? formatMeter(reading.current_reading) : "-"}</p></div>
        <div><p className="text-black/50">Pakai</p><p className="font-bold">{formatMeter(bill.usage)} m³</p></div>
      </div>
      <div className="mt-1 flex justify-between text-[7.5px] text-black/50"><span>Periode {formatShortPeriod(bill.period)}</span><span>{bill.price_per_m3 ? `${formatCurrency(bill.price_per_m3)}/m³` : ""}</span></div>
      <div className="my-1.5 border-t border-dashed border-black" />
      {/* Rincian — compact */}
      <div className="space-y-0.5 text-[8.5px]">
        <div className="flex justify-between"><span className="text-black/50">Air ({formatMeter(bill.usage)}×{bill.price_per_m3 ? formatCurrency(bill.price_per_m3) : "-"})</span><span>{formatCurrency(bill.water_amount)}</span></div>
        <div className="flex justify-between"><span className="text-black/50">Abonemen</span><span>{formatCurrency(bill.monthly_fee)}</span></div>
        <div className="flex justify-between border-t border-black pt-1 text-[11px] font-bold"><span>TOTAL</span><span>{formatCurrency(bill.total_amount)}</span></div>
        <div className="flex justify-between text-[7px] text-black/50"><span>{isPaid ? "LUNAS" : isOverdue ? "MENUNGGAK" : "BELUM BAYAR"}{bill.due_date ? ` • J Tempo ${formatDate(bill.due_date)}` : ""}</span><span>{isPaid ? "✔" : ""}</span></div>
      </div>
      {payment && (
        <>
          <div className="my-1.5 border-t border-dashed border-black" />
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[7.5px] leading-tight">
            <span className="text-black/50">Tgl bayar</span><span className="text-right">{formatDate(payment.payment_date)}</span>
            <span className="text-black/50">Metode</span><span className="text-right uppercase">{payment.payment_method === "cash" ? "Tunai" : "Transfer"}</span>
            {payment.receiver_name && <><span className="text-black/50">Petugas</span><span className="truncate text-right">{payment.receiver_name}</span></>}
          </div>
        </>
      )}
      <div className="my-1.5 border-t border-dashed border-black" />
      <div className="text-center text-[6.5px] leading-tight text-black/50">
        <p>Terima kasih • Simpan sebagai bukti sah</p>
        <p>{now.toLocaleDateString("id-ID")} {now.toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit"})} • {bill.customer.customer_number}</p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0 text-black/60">{label}</span>
      <span className="truncate text-right font-semibold">{value}</span>
    </div>
  );
}

function BillHero({
  status,
  totalAmount,
  dueDate,
  payment,
}: {
  status: string;
  totalAmount: number;
  dueDate: string | null;
  payment: PaymentDetail | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-[18px] bg-gradient-to-br from-petrol via-petrol-2 to-[#0b2e34] p-5 sm:p-6">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.1))",
        }}
      />
      <div className="absolute -top-[38px] -right-[38px] size-[170px] rounded-full border-[1.5px] border-aqua/35">
        <div className="absolute inset-[22px] rounded-full border border-dashed border-brass/40" />
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.06em] text-aqua">
          <span className="size-1.5 rounded-full bg-aqua" />
          Tagihan
        </span>
        <div className="flex items-center gap-2">
          <p className="font-mono text-[28px] font-bold text-white">{formatCurrency(totalAmount)}</p>
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
            status === "overdue" ? "bg-coral-light text-coral" :
            status === "paid" ? "bg-green-light text-green" :
            status === "unpaid" ? "bg-brass-light text-brass" :
            "bg-muted text-muted-2"
          )}>
            {status === "overdue" ? "TERLAMBAT" : STATUS_LABEL[status].toUpperCase()}
          </span>
        </div>
        <p className="max-w-[78%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
          {status === "paid"
            ? payment
              ? `Lunas pada ${formatDate(payment.payment_date)}`
              : "Tagihan telah dibayar"
            : status === "overdue" && dueDate
              ? `Melewati jatuh tempo · Bayar sebelum ${formatDate(dueDate)}`
              : dueDate
                ? `Jatuh tempo ${formatDate(dueDate)}`
                : "Tagihan belum dibayar"}
        </p>
      </div>
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
      <p className="font-mono text-[10.5px] text-muted-2">{label}</p>
      <p className="mt-0.5 font-mono text-[18px] font-semibold text-petrol">{formatMeter(value)}</p>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-line py-2">
      <span className="text-[12.5px] text-muted-2">{label}</span>
      <span className="font-mono text-[15px] font-semibold text-petrol">{formatCurrency(value)}</span>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-paper/80 p-3">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">{label}</p>
      <p className="mt-0.5 font-display text-[13px] font-semibold text-petrol">{value}</p>
    </div>
  );
}

function BillNavigation({
  bill,
  direction,
}: {
  bill: AdjacentBill | null;
  direction: "previous" | "next";
}) {
  if (!bill) return <div />;

  const previous = direction === "previous";
  return (
    <Link
      href={`/bills/${bill.id}`}
      className={cn(
        "relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md",
        previous ? "justify-start" : "justify-end"
      )}
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60" />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
      <div className="flex items-center gap-3">
        <span className={cn("flex size-6 items-center justify-center rounded-full", previous ? "bg-aqua-light text-aqua" : "bg-brass-light text-brass")}>
          <HugeiconsIcon icon={previous ? ArrowLeft01Icon : ArrowRight01Icon} size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] text-muted-2">{previous ? "SEBELUMNYA" : "BERIKUTNYA"}</p>
          <p className="truncate font-display text-[13px] font-semibold text-petrol">{formatShortPeriod(bill.period)}</p>
        </div>
      </div>
    </Link>
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
    `Periode: ${formatShortPeriod(bill.period)}`,
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