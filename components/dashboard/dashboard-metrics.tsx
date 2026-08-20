import Link from "next/link";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function DashboardMetrics({
  activeCustomers,
  totalCustomers,
  readingDone,
  readingTotal,
  readingPct,
  billPaidCount,
  billTotal,
  billRemaining,
}: {
  activeCustomers: number;
  totalCustomers: number;
  readingDone: number;
  readingTotal: number;
  readingPct: number;
  billPaidCount: number;
  billTotal: number;
  billRemaining: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <CustomerMetric activeCustomers={activeCustomers} totalCustomers={totalCustomers} />
      <MeterGauge readingDone={readingDone} readingTotal={readingTotal} pct={readingPct} />
      <BillMetric billPaidCount={billPaidCount} billTotal={billTotal} billRemaining={billRemaining} />
    </div>
  );
}

function CustomerMetric({
  activeCustomers,
  totalCustomers,
}: {
  activeCustomers: number;
  totalCustomers: number;
}) {
  return (
    <Link
      href="/customers"
      className="flex min-h-[118px] flex-col rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Pelanggan
      </p>
      <p className="mt-1 font-mono text-[22px] font-semibold text-petrol">
        {formatNumber(activeCustomers)}
      </p>
      <p className="text-[10.5px] text-muted-2">
        {formatNumber(totalCustomers)} total terdaftar
      </p>
      <div className="mt-auto flex gap-[3px] pt-2">
        {Array.from({ length: 7 }).map((_, i) => {
          const on = totalCustomers > 0 && i < Math.round((activeCustomers / totalCustomers) * 7);
          return (
            <span
              key={i}
              className={cn("size-1.5 rounded-full", on ? "bg-aqua" : "bg-aqua-light")}
            />
          );
        })}
      </div>
    </Link>
  );
}

function MeterGauge({
  readingDone,
  readingTotal,
  pct,
}: {
  readingDone: number;
  readingTotal: number;
  pct: number;
}) {
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <Link
      href="/meter-readings"
      className="flex min-h-[118px] flex-col items-center rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="self-start text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Meter
      </p>
      <div className="relative flex flex-1 items-center justify-center">
        <svg viewBox="0 0 80 80" className="size-16" role="presentation">
          <circle cx="40" cy="40" r="32" fill="none" stroke="#E4F5F3" strokeWidth="7" />
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="#16A6A0"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 40 40)"
          />
        </svg>
        <span className="absolute font-mono text-sm font-bold text-petrol">{pct}%</span>
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted-2">
        {formatNumber(readingDone)}/{formatNumber(readingTotal)} TERCATAT
      </p>
    </Link>
  );
}

function BillMetric({
  billPaidCount,
  billTotal,
  billRemaining,
}: {
  billPaidCount: number;
  billTotal: number;
  billRemaining: number;
}) {
  return (
    <Link
      href="/bills"
      className="flex min-h-[118px] flex-col rounded-[14px] border border-line bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">
        Tagihan
      </p>
      <p className="mt-1 font-mono text-[22px] font-semibold text-petrol">
        {formatNumber(billPaidCount)}/{formatNumber(billTotal)}
      </p>
      <p className="text-[10.5px] text-muted-2">{formatNumber(billRemaining)} belum lunas</p>
      <span className="mt-auto w-fit rounded-full bg-green-light px-2 py-0.5 font-mono text-[10px] font-bold text-green">
        {billRemaining === 0 ? "LUNAS SEMUA" : "BELUM LUNAS"}
      </span>
    </Link>
  );
}