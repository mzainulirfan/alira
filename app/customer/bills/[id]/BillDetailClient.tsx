"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  GaugeIcon,
  Calendar01Icon,
  Camera01Icon,
} from "@hugeicons/core-free-icons";
import { formatCurrency, formatDate, formatMeter, formatShortPeriod } from "@/lib/format";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";
import type { Bill, MeterReading, Payment } from "@/lib/types";

interface BillDetailClientProps {
  bill: Bill;
  reading: MeterReading | null;
  payment: Pick<Payment, "id" | "payment_date"> | null;
}

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
};

function getOverdueDays(dueDate: string | null): number | null {
  if (!dueDate) return null;
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  if (diff <= 0) return null;
  return Math.max(1, Math.floor(diff / 86_400_000));
}

function getStatusDescription(
  bill: Bill,
  payment: Pick<Payment, "id" | "payment_date"> | null
): string {
  if (bill.status === "paid") {
    return payment ? `Lunas pada ${formatDate(payment.payment_date)}` : "Tagihan telah dibayar";
  }
  if (bill.status === "overdue") {
    const overdueDays = getOverdueDays(bill.due_date);
    if (overdueDays) {
      return `Melewati jatuh tempo ${overdueDays} hari`;
    }
    return bill.due_date ? `Melewati jatuh tempo` : "Menunggu pembayaran";
  }
  if (bill.status === "cancelled") return "Tagihan ini telah dibatalkan";
  return bill.due_date ? `Bayar sebelum ${formatDate(bill.due_date)}` : "Tagihan belum dibayar";
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

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-line py-2">
      <span className="text-[12.5px] text-muted-2">{label}</span>
      <span className="font-mono text-[15px] font-semibold text-petrol">{value}</span>
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

export default function BillDetailClient({
  bill,
  reading,
  payment,
}: BillDetailClientProps) {
  const router = useRouter();
  const statusDescription = getStatusDescription(bill, payment);
  const tariffLabel =
    bill.price_per_m3 != null ? `${formatCurrency(bill.price_per_m3)}/m³` : "Belum tersedia";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push("/customer/bills")}
          className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </button>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Detail Tagihan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {formatShortPeriod(bill.period)}
          </p>
        </div>
      </div>

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
            <p className="font-mono text-[28px] font-bold text-white">{formatCurrency(bill.total_amount)}</p>
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
          <p className="max-w-[78%] text-[12.5px] leading-relaxed text-[#b9d4d0]">
            {statusDescription}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] text-[#b9d4d0]">
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
        </div>
      </div>

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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={reading.photo_url}
                    alt={`Foto meter ${formatShortPeriod(bill.period)}`}
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
          <CostRow label="Biaya air" value={formatCurrency(bill.water_amount)} />
          {bill.price_per_m3 != null && (
            <div className="flex items-center justify-between border-b border-dashed border-line py-2">
              <span className="text-[11px] text-muted-2">{formatMeter(bill.usage)} × {tariffLabel}</span>
            </div>
          )}
          <CostRow label="Abonemen" value={formatCurrency(bill.monthly_fee)} />
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
              <DetailValue label="Status" value="Lunas" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
