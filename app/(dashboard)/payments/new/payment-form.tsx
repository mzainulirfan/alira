"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BanknoteIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  InvoiceIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import {
  recordPaymentAction,
  type RecordPaymentState,
} from "@/app/actions/payments";
import { formatCurrency, formatDate, formatShortPeriod } from "@/lib/format";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const initialState: RecordPaymentState = {};

export function PaymentForm({
  bill,
}: {
  bill: {
    id: string;
    total_amount: number;
    period: string;
    status: string;
    customer: { id: string; name: string; customer_number: string };
  };
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [cashReceived, setCashReceived] = useState("");
  const [state, formAction, pending] = useActionState(recordPaymentAction, initialState);
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) setLastState(state);

  useEffect(() => {
    if (state?.success) {
      toast.success("Pembayaran tercatat. Tagihan lunas.");
      router.push(`/bills/${bill.id}`);
    } else if (state?.error) toast.error(state.error);
  }, [state, bill.id, router]);

  const cashReceivedAmount = Number(cashReceived) || 0;
  const cashDifference = cashReceivedAmount - bill.total_amount;
  const cashIsSufficient = paymentMethod === "transfer" || cashReceivedAmount >= bill.total_amount;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href={`/bills/${bill.id}`} className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Catat Pembayaran
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {bill.customer.name} · {formatShortPeriod(bill.period)}
          </p>
        </div>
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Ringkasan Tagihan" />
        <Link href={`/customers/${bill.customer.id}`} className="group relative flex items-center gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
          <span className="absolute top-0 bottom-0 left-0 w-1 bg-aqua/60" />
          <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
          <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua">
              <HugeiconsIcon icon={InvoiceIcon} size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{bill.customer.name}</p>
              <p className="truncate font-mono text-[11px] text-muted-2">{bill.customer.customer_number} · {formatShortPeriod(bill.period)}</p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold", bill.status === "overdue" ? "bg-coral-light text-coral" : "bg-brass-light text-brass")}>
              {bill.status === "overdue" ? "TERLAMBAT" : "BELUM LUNAS"}
            </span>
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
            </span>
          </div>
        </Link>
      </section>

      <section className="flex flex-col">
        <SectionHeading title="Total Bayar" />
        <div className="rounded-[14px] border border-line bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">Total Tagihan</p>
              <p className="mt-1 font-mono text-[28px] font-bold text-petrol">{formatCurrency(bill.total_amount)}</p>
            </div>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold", bill.status === "overdue" ? "bg-coral-light text-coral" : "bg-brass-light text-brass")}>
              {bill.status === "overdue" ? "TERLAMBAT" : "BELUM LUNAS"}
            </span>
          </div>
          <p className="mt-3 font-mono text-[10.5px] text-muted-2">Pembayaran harus sesuai total tagihan.</p>
        </div>
      </section>

      <form id="payment-form" ref={formRef} action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="bill_id" value={bill.id} />
        <input type="hidden" name="amount" value={bill.total_amount} />

        <section className="flex flex-col">
          <SectionHeading title="Detail Pembayaran" />
          <div className="rounded-[14px] border border-line bg-card p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="payment_date" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text flex items-center gap-1.5">
                  <HugeiconsIcon icon={Calendar01Icon} className="size-4 text-muted-2" />
                  Tanggal Pembayaran
                </Label>
                <Input id="payment_date" name="payment_date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required className="h-11 rounded-[10px] border-line" />
              </div>

              <fieldset className="flex flex-col gap-2">
                <legend className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">Metode Pembayaran</legend>
                <div className="grid grid-cols-2 gap-2">
                  {(["cash", "transfer"] as const).map((method) => {
                    const selected = paymentMethod === method;
                    return (
                      <label key={method} className={cn("flex cursor-pointer items-center justify-between rounded-[10px] border px-3 py-3 text-sm transition-colors", selected ? "border-petrol bg-petrol/5 text-petrol" : "border-line hover:border-petrol/30")}>
                        <span className="flex items-center gap-2">
                          <HugeiconsIcon icon={BanknoteIcon} className="size-4" />
                          {method === "cash" ? "Tunai" : "Transfer"}
                        </span>
                        {selected && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />}
                        <input type="radio" name="payment_method" value={method} checked={selected} onChange={() => setPaymentMethod(method)} className="sr-only" />
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              {paymentMethod === "cash" && (
                <div className="flex flex-col gap-2 border-t border-dashed border-line pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="cash_received" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">Uang Diterima</Label>
                    <Button type="button" variant="ghost" size="xs" onClick={() => setCashReceived(String(bill.total_amount))} className="rounded-[8px] text-brass hover:bg-brass-light">Uang Pas</Button>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-2">Rp</span>
                    <Input id="cash_received" type="number" inputMode="numeric" min={0} step={1} value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} placeholder="0" className="h-12 pl-10 text-lg font-medium rounded-[10px] border-line" aria-invalid={cashReceived !== "" && cashDifference < 0} />
                  </div>
                  {cashReceived === "" ? (
                    <p className="text-[11px] text-muted-2">Masukkan nominal uang dari pelanggan atau pilih Uang Pas.</p>
                  ) : cashDifference < 0 ? (
                    <div className="flex items-center justify-between rounded-[10px] border border-coral/30 bg-coral-light/50 px-3 py-2 text-sm text-coral">
                      <span>Masih kurang</span>
                      <span className="font-mono font-semibold text-coral">{formatCurrency(Math.abs(cashDifference))}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-[10px] border border-green/30 bg-green-light/50 px-3 py-2 text-sm text-green">
                      <span>{cashDifference === 0 ? "Uang pas" : "Kembalian"}</span>
                      <span className="font-mono font-semibold text-green">{formatCurrency(Math.max(0, cashDifference))}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5 border-t border-dashed border-line pt-3">
                <Label htmlFor="notes" className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] text-muted-text">Catatan (opsional)</Label>
                <Textarea id="notes" name="notes" rows={2} placeholder="Contoh: dibayar langsung di kantor" className="h-20 rounded-[10px] border-line" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <Button type="button" className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full" onClick={() => setConfirmOpen(true)} disabled={pending || !paymentDate || !cashIsSufficient}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-2" /> Periksa & Konfirmasi
          </Button>
        </div>
      </form>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[14px] bg-card">
          <ConfirmationDialogHeader icon={CheckmarkCircle01Icon} title="Konfirmasi Pembayaran" description="Pastikan pelanggan, nominal, dan metode pembayaran sudah benar." />
          <ConfirmationDialogSummary>
            <div className="flex items-center justify-between border-b border-dashed border-line pb-3">
              <div className="min-w-0">
                <p className="truncate font-display text-[13px] font-semibold text-petrol">{bill.customer.name}</p>
                <p className="truncate font-mono text-[10.5px] text-muted-2">{formatShortPeriod(bill.period)}</p>
              </div>
              <p className="font-mono text-[18px] font-bold text-petrol">{formatCurrency(bill.total_amount)}</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-[10px] bg-paper/80 p-3"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">Tanggal</p><p className="mt-0.5 font-display text-[13px] font-semibold text-petrol">{formatDate(paymentDate)}</p></div>
              <div className="rounded-[10px] bg-paper/80 p-3"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">Metode</p><p className="mt-0.5 font-display text-[13px] font-semibold text-petrol">{paymentMethod === "cash" ? "Tunai" : "Transfer"}</p></div>
              {paymentMethod === "cash" && (
                <>
                  <div className="rounded-[10px] bg-paper/80 p-3"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">Uang diterima</p><p className="mt-0.5 font-mono text-[14px] font-bold text-petrol">{formatCurrency(cashReceivedAmount)}</p></div>
                  <div className="rounded-[10px] bg-paper/80 p-3"><p className="font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-text">Kembalian</p><p className="mt-0.5 font-mono text-[14px] font-bold text-green">{formatCurrency(Math.max(0, cashDifference))}</p></div>
                </>
              )}
            </div>
          </ConfirmationDialogSummary>
          <DialogFooter className="pt-2 border-t border-line">
            <Button type="button" variant="outline" className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full" onClick={() => setConfirmOpen(false)} disabled={pending}>Periksa Lagi</Button>
            <Button type="submit" form="payment-form" disabled={pending || !cashIsSufficient} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full">{pending ? "Menyimpan..." : "Catat Pembayaran"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}