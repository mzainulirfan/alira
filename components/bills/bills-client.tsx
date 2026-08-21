"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  ArrowRight01Icon,
  MagicWand01Icon,
  CheckmarkCircle01Icon,
  FilterIcon,
  FilterResetIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { PeriodPicker } from "@/components/ui/period-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import { generateBillsAction, type GenerateBillsState } from "@/app/actions/bills";
import { formatCurrency, formatMeter, formatShortPeriod } from "@/lib/format";
import { currentPeriod } from "@/lib/period";
import type { BillWithCustomer } from "@/lib/data/bills";
import type { Tariff } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Bayar" },
  { key: "paid", label: "Lunas" },
  { key: "overdue", label: "Menunggak" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  unpaid: "Belum Dibayar",
  paid: "Lunas",
  overdue: "Menunggak",
  cancelled: "Dibatalkan",
};

const statusDotClass = {
  all: "bg-muted",
  unpaid: "bg-brass",
  paid: "bg-aqua",
  overdue: "bg-coral",
  cancelled: "bg-muted-2",
} as const;

function isOverdue(bill: BillWithCustomer): boolean {
  if (!bill.due_date) return bill.status === "overdue";
  const due = new Date(`${bill.due_date}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return bill.status === "overdue" || (bill.status === "unpaid" && due.getTime() < today.getTime());
}

function daysOverdue(bill: BillWithCustomer): number | null {
  if (!bill.due_date) return null;
  if (!isOverdue(bill)) return null;
  const due = new Date(`${bill.due_date}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function BillsClient({
  bills,
  allBills,
  period,
  status,
  customerId,
  tariff,
  readingCount,
  canManage,
  hasActiveFilters,
}: {
  bills: BillWithCustomer[];
  allBills: BillWithCustomer[];
  period: string;
  status: string;
  customerId: string | null;
  tariff: Tariff | null;
  readingCount: number;
  canManage: boolean;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    generateBillsAction,
    { created: 0, skipped: 0 } satisfies GenerateBillsState
  );
  const [lastState, setLastState] = useState(state);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pendingCount = Math.max(0, readingCount - allBills.length);
  const overdueCount = allBills.filter((b) => isOverdue(b)).length;

  if (state !== lastState) {
    setLastState(state);
  }

  useEffect(() => {
    if (state?.success) {
      toast.success(
        state.created > 0
          ? `${state.created} tagihan dibuat untuk ${formatShortPeriod(period)}.`
          : `Semua pencatatan sudah memiliki tagihan (${state.skipped} dilewati).`
      );
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function updateParams(next: { period?: string; status?: string }) {
    const sp = new URLSearchParams(searchParams.toString());
    if (next.period !== undefined) {
      if (next.period) sp.set("period", next.period);
      else sp.delete("period");
    }
    if (next.status !== undefined) {
      if (next.status === "all") sp.delete("status");
      else sp.set("status", next.status);
    }
    router.push(`/bills?${sp.toString()}`);
  }

  const counts = {
    all: allBills.length,
    unpaid: allBills.filter((b) => b.status === "unpaid" && !isOverdue(b)).length,
    paid: allBills.filter((b) => b.status === "paid").length,
    overdue: overdueCount,
  };

  const customerName = customerId
    ? allBills[0]?.customer.name ?? null
    : null;

  function clearCustomerFilter() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("customer");
    router.push(`/bills?${sp.toString()}`);
  }

  function resetFilters() {
    router.push("/bills");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Tagihan
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {allBills.length} tagihan untuk {formatShortPeriod(period)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <PeriodPicker period={period} basePath="/bills" />
          <div ref={filterRef} className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label="Filter status tagihan"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className="rounded-[10px] border-line"
            >
              <HugeiconsIcon icon={FilterIcon} />
              {(status !== "all" || customerId !== null) && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-brass" />
              )}
            </Button>
            {filterOpen && (
              <div
                role="listbox"
                className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-[12px] border border-line bg-popover text-popover-foreground shadow-md"
              >
                {STATUS_FILTERS.map((filter) => {
                  const active = status === filter.key;
                  return (
                    <button
                      key={filter.key}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        updateParams({ status: filter.key });
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                    >
                      <span className={cn(active ? "font-semibold text-petrol" : "")}>
                        {filter.label}
                      </span>
                      <span className="font-mono text-xs text-muted-2">
                        {counts[filter.key as keyof typeof counts]}
                      </span>
                      {active && (
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {STATUS_FILTERS.map((filter) => {
          const active = status === filter.key;
          const dot = statusDotClass[filter.key as keyof typeof statusDotClass];
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => updateParams({ status: filter.key })}
              className={cn(
                "flex min-h-[70px] flex-col rounded-[12px] border px-2 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md",
                active
                  ? "border-petrol/40 bg-petrol text-white"
                  : "border-line bg-card hover:border-petrol/30"
              )}
            >
              <p
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-[0.04em]",
                  active ? "text-aqua" : "text-muted-text"
                )}
              >
                {filter.label}
              </p>
              <p
                className={cn(
                  "mt-auto font-mono text-[16px] font-semibold",
                  active ? "text-white" : "text-petrol"
                )}
              >
                {counts[filter.key as keyof typeof counts]}
              </p>
              <span className={cn("mt-1 h-1.5 w-full rounded-full", active ? "bg-aqua-light" : dot)} />
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-aqua-light/60 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-text">
              {status !== "all"
                ? `Menampilkan ${bills.length} dari ${counts[status as keyof typeof counts]} tagihan`
                : `Menampilkan ${bills.length} tagihan`}
            </span>
            {period !== currentPeriod() && (
              <span className="rounded-full bg-petrol px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                {formatShortPeriod(period).toUpperCase()}
              </span>
            )}
            {status !== "all" && (
              <span className="rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">
                {STATUS_FILTERS.find((f) => f.key === status)?.label.toUpperCase()}
              </span>
            )}
            {customerName && (
              <div className="flex items-center gap-1 rounded-full bg-white/70 border border-line px-2 py-0.5">
                <span className="font-mono text-[10px] text-muted-2">{customerName}</span>
                <Button variant="ghost" size="xs" className="h-6 text-muted-text hover:text-petrol" onClick={clearCustomerFilter}>
                  Hapus
                </Button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="font-mono text-[11px] font-semibold text-muted-text hover:text-petrol">
            <HugeiconsIcon icon={FilterResetIcon} />
            Reset Filter
          </Button>
        </div>
      )}

      {canManage && !customerId && pendingCount > 0 && (
        <GenerateBillCard
          period={period}
          pendingCount={pendingCount}
          tariff={tariff}
          pending={pending}
          formAction={formAction}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
        />
      )}

      {bills.length === 0 ? (
        <EmptyState
          status={status}
          customerId={customerId}
          customerName={customerName}
          allBillsCount={allBills.length}
          period={period}
        />
      ) : (
        <section className="flex flex-col">
          <SectionHeading title="Daftar Tagihan" />
          <div className="flex flex-col gap-2">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} customerFilter={Boolean(customerId)} canManage={canManage} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function BillCard({
  bill,
  customerFilter,
  canManage,
}: {
  bill: BillWithCustomer;
  customerFilter: boolean;
  canManage: boolean;
}) {
  const needPayment = bill.status === "unpaid" || bill.status === "overdue";
  const overdue = daysOverdue(bill);

  return (
    <Link
      href={`/bills/${bill.id}`}
      className="group relative overflow-hidden rounded-[14px] border border-line bg-card py-3.5 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md"
    >
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
            overdue !== null ? "bg-coral-light text-coral" : "bg-aqua-light text-aqua"
          )}
        >
          <HugeiconsIcon icon={InvoiceIcon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-[13.5px] font-semibold text-petrol">
              {bill.customer.name}
            </p>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 font-mono text-[9.5px] font-bold",
                bill.status === "overdue"
                  ? "bg-coral-light text-coral"
                  : bill.status === "paid"
                    ? "bg-green-light text-green"
                    : bill.status === "unpaid"
                      ? "bg-brass-light text-brass"
                      : "bg-muted text-muted-2"
              )}
            >
              {bill.status === "overdue" ? "TERLAMBAT" : STATUS_LABEL[bill.status].toUpperCase()}
            </span>
          </div>
          <p className="truncate font-mono text-[11px] text-muted-2">
            {bill.customer.customer_number}
            {customerFilter ? "" : ` · ${formatMeter(bill.usage)} m³`}
            {overdue !== null ? ` · LEWAT ${overdue} HARI` : ""}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">
            {formatCurrency(bill.total_amount)}
          </span>
          {canManage && needPayment && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-[8px] border-line font-display text-[11px] font-semibold text-brass hover:bg-brass-light hover:border-brass"
              render={<Link href={`/payments/new?bill=${bill.id}`} />}
            >
              Catat Bayar
            </Button>
          )}
        </div>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

function EmptyState({
  status,
  customerId,
  customerName,
  allBillsCount,
  period,
}: {
  status: string;
  customerId: string | null;
  customerName: string | null;
  allBillsCount: number;
  period: string;
}) {
  let title = "Belum ada tagihan.";
  let description = "Catat meter terlebih dahulu, lalu buat tagihan.";
  let action: React.ReactNode = null;

  if (status === "unpaid" && allBillsCount > 0) {
    title = "Semua tagihan lunas";
    description = `Tidak ada tagihan yang belum dibayar untuk ${formatShortPeriod(period)}.`;
  } else if (status === "overdue" && allBillsCount > 0) {
    title = "Tidak ada tunggakan";
    description = "Semua tagihan masih dalam periode pembayaran atau sudah lunas.";
  } else if (status === "paid" && allBillsCount === 0) {
    title = "Belum ada tagihan lunas";
    description = `Belum ada tagihan yang lunas untuk ${formatShortPeriod(period)}.`;
  } else if (customerId) {
    description = `Tidak ada tagihan untuk ${customerName ?? "pelanggan ini"} pada periode tersebut.`;
  } else if (allBillsCount > 0) {
    description = "Tidak ada tagihan dengan filter ini.";
  } else {
    action = (
      <Button variant="outline" className="rounded-[10px] border-line" render={<Link href="/meter-readings" />}>
        Ke Pencatatan Meter
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-aqua-light text-aqua">
        <HugeiconsIcon icon={InvoiceIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">{title}</p>
        <p className="text-[13px] text-muted-2">{description}</p>
      </div>
      {action}
    </div>
  );
}

function GenerateBillCard({
  period,
  pendingCount,
  tariff,
  pending,
  formAction,
  confirmOpen,
  setConfirmOpen,
}: {
  period: string;
  pendingCount: number;
  tariff: Tariff | null;
  pending: boolean;
  formAction: (formData: FormData) => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
}) {
  return (
    <div className="flex flex-col">
      <SectionHeading title="Buat Tagihan Baru" />
      <div className="relative overflow-hidden rounded-[14px] border border-line bg-card px-4 py-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-[13px] font-bold text-petrol">Tagihan Belum Dibuat</p>
            <p className="text-[12px] text-muted-2">
              {pendingCount} pencatatan meter belum memiliki tagihan untuk {formatShortPeriod(period)}.
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-petrol text-white">
            <HugeiconsIcon icon={MagicWand01Icon} size={22} />
          </span>
        </div>

        {!tariff && (
          <div className="mb-3 rounded-[10px] border border-coral/30 bg-coral-light/50 px-3 py-2">
            <p className="text-[12px] text-coral">
              Belum ada tarif aktif. Atur tarif di{" "}
              <Link href="/more/tariffs" className="underline underline-offset-2 font-semibold">
                Pengaturan Tarif
              </Link>{" "}
              terlebih dahulu.
            </p>
          </div>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger render={<Button disabled={!tariff} />}>
            <HugeiconsIcon icon={MagicWand01Icon} />
            {pending ? "Membuat tagihan..." : `Buat ${pendingCount} Tagihan`}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <ConfirmationDialogHeader
              icon={MagicWand01Icon}
              title={`Buat ${pendingCount} Tagihan?`}
              description={`Tagihan akan dibuat dari pencatatan meter periode ${formatShortPeriod(period)}.`}
            />
            {tariff && (
              <ConfirmationDialogSummary>
                <div className="flex items-center justify-between">
                  <span className="text-muted-text">Pelanggan</span>
                  <span className="font-mono font-semibold text-petrol">{pendingCount}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-text">Tarif air</span>
                  <span className="font-mono font-semibold text-petrol">{formatCurrency(tariff.price_per_m3)}/m³</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-text">Abonemen</span>
                  <span className="font-mono font-semibold text-petrol">{formatCurrency(tariff.monthly_fee)}</span>
                </div>
              </ConfirmationDialogSummary>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} className="rounded-[10px] border-line">
                Batal
              </Button>
              <form action={formAction} className="w-full sm:w-auto">
                <input type="hidden" name="period" value={period} />
                <Button type="submit" disabled={pending} className="rounded-[10px] bg-petrol font-display text-[14px] font-semibold text-white hover:bg-petrol-2 w-full">
                  {pending ? "Membuat..." : "Buat Tagihan"}
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}