import Link from "next/link";
import { formatCurrency } from "@/lib/format";

export function CashFlowCard({
  period,
  cashIn,
  cashOut,
}: {
  period: string;
  cashIn: number;
  cashOut: number;
}) {
  const net = cashIn - cashOut;

  return (
    <div className="flex flex-col">
      <div className="rounded-[14px] border border-line bg-card px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-[14.5px] font-bold text-petrol">Arus Kas</h3>
          <Link
            href={`/reports?period=${period}`}
            className="flex items-center gap-0.5 font-mono text-[11.5px] font-semibold text-muted-text hover:text-petrol"
          >
            LIHAT DETAIL
            <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="flex flex-col">
          <LedgerRow label="Pemasukan" swatch="bg-aqua" value={cashIn} />
          <LedgerRow label="Pengeluaran" swatch="bg-coral" value={cashOut} />
          <div className="flex items-center justify-between border-b border-dashed border-line py-3">
            <span className="font-display text-[13px] font-bold text-petrol">
              Saldo Bersih
            </span>
            <span className="font-mono text-[16.5px] font-bold text-petrol">
              {formatCurrency(net)}
            </span>
          </div>
        </div>

        <div className="mt-3.5 flex items-center gap-2.5 rounded-[10px] bg-aqua-light py-2.5 pr-3 pl-2.5">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-aqua bg-white/60 text-aqua">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
          <p className="text-[10.5px] leading-[1.35] font-semibold text-petrol-2">
            Arus kas seimbang bulan ini
            <span className="block text-[10px] font-normal text-muted-text">
              Tidak ada transaksi tertunda
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function LedgerRow({
  label,
  swatch,
  value,
}: {
  label: string;
  swatch: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-line py-2 first:pt-0">
      <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-muted-text">
        <span className={swatch + " size-2 rounded-[2px]"} />
        {label}
      </span>
      <span className="font-mono text-[13px] font-semibold text-petrol">
        {formatCurrency(value)}
      </span>
    </div>
  );
}