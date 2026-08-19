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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Dibayar" },
  { key: "paid", label: "Lunas" },
  { key: "overdue", label: "Menunggak" },
] as const;

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

function daysOverdue(bill: BillWithCustomer): number | null {
  if (bill.status !== "overdue" || !bill.due_date) return null;
  const due = new Date(`${bill.due_date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - due.getTime()) / 86_400_000);
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
  const overdueCount = allBills.filter((b) => b.status === "overdue").length;

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
    unpaid: allBills.filter((b) => b.status === "unpaid").length,
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Tagihan</h1>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodPicker period={period} basePath="/bills" />
        <div ref={filterRef} className="relative ml-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Filter status tagihan"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <HugeiconsIcon icon={FilterIcon} />
            {(status !== "all" || customerId !== null) && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {filterOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 min-w-44 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
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
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{filter.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {counts[filter.key as keyof typeof counts]}
                    </span>
                    {active && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        className="size-4 text-primary"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">
              {status !== "all"
                ? `Menampilkan ${bills.length} dari ${counts[status as keyof typeof counts]} tagihan`
                : `Menampilkan ${bills.length} tagihan`}
            </span>
            {period !== currentPeriod() && (
              <Badge variant="secondary">{formatShortPeriod(period)}</Badge>
            )}
            {status !== "all" && (
              <Badge variant="secondary">
                {STATUS_FILTERS.find((filter) => filter.key === status)?.label}
              </Badge>
            )}
            {customerName && (
              <div className="flex h-6 items-center gap-1 rounded-md border border-primary/20 bg-primary/5 pl-2 pr-1">
                <p className="truncate text-xs text-muted-foreground">
                  {customerName}
                </p>
                <Button variant="ghost" size="xs" onClick={clearCustomerFilter}>
                  Hapus
                </Button>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
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
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              customerFilter={Boolean(customerId)}
              canManage={canManage}
            />
          ))}
        </div>
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
    <Card className="relative transition-colors hover:border-primary/30 hover:bg-muted/20 focus-within:border-primary/40">
      <Link
        href={`/bills/${bill.id}`}
        aria-label={`Lihat detail tagihan ${bill.customer.name}`}
        className="absolute inset-0 z-10 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <CardContent className="flex flex-col gap-2 py-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-md ${
              overdue !== null ? "bg-destructive/15 text-destructive" : "bg-muted"
            }`}
          >
            <HugeiconsIcon
              icon={InvoiceIcon}
              size={20}
              className={overdue !== null ? undefined : "text-muted-foreground"}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium">{bill.customer.name}</p>
              <Badge variant={STATUS_VARIANT[bill.status]} className="shrink-0">
                {STATUS_LABEL[bill.status]}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {bill.customer.customer_number}
              {customerFilter ? "" : ` · ${formatMeter(bill.usage)}`}
              {overdue !== null ? ` · Lewat ${overdue} hari` : ""}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-base font-semibold">
              {formatCurrency(bill.total_amount)}
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 text-muted-foreground"
            />
          </div>
        </div>

        {canManage && needPayment && (
          <div className="flex justify-end border-t pt-2">
            <Button
              size="sm"
              className="relative z-20"
              render={<Link href={`/payments/new?bill=${bill.id}`} />}
            >
              Catat Pembayaran
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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
  let icon = <HugeiconsIcon icon={InvoiceIcon} size={24} className="text-muted-foreground" />;
  let title = "Belum ada tagihan.";
  let description = "Catat meter terlebih dahulu, lalu buat tagihan.";
  let action: React.ReactNode = null;

  if (status === "unpaid" && allBillsCount > 0) {
    icon = (
      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} className="text-success" />
    );
    title = "Semua tagihan lunas";
    description = `Tidak ada tagihan yang belum dibayar untuk ${formatShortPeriod(period)}.`;
  } else if (status === "overdue" && allBillsCount > 0) {
    title = "Tidak ada tunggakan";
    description =
      "Semua tagihan masih dalam periode pembayaran atau sudah lunas.";
  } else if (status === "paid" && allBillsCount === 0) {
    title = "Belum ada tagihan lunas";
    description = `Belum ada tagihan yang lunas untuk ${formatShortPeriod(period)}.`;
  } else if (customerId) {
    description = `Tidak ada tagihan untuk ${customerName ?? "pelanggan ini"} pada periode tersebut.`;
  } else if (allBillsCount > 0) {
    description = "Tidak ada tagihan dengan filter ini.";
  } else {
    action = (
      <Button variant="outline" render={<Link href="/meter-readings" />}>
        Ke Pencatatan Meter
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-muted">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
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
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col gap-3 py-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">Tagihan Belum Dibuat</p>
            <p className="text-sm text-muted-foreground">
              {pendingCount} pencatatan meter belum memiliki tagihan untuk{" "}
              {formatShortPeriod(period)}.
            </p>
          </div>
          <HugeiconsIcon icon={MagicWand01Icon} className="mt-0.5 size-5 shrink-0 text-primary" />
        </div>

        {!tariff && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            Belum ada tarif aktif. Atur tarif di{" "}
            <Link href="/more/tariffs" className="underline underline-offset-2">
              Pengaturan Tarif
            </Link>{" "}
            terlebih dahulu.
          </p>
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
                   <span className="text-muted-foreground">Pelanggan</span>
                   <span className="font-medium">{pendingCount}</span>
                 </div>
                 <div className="mt-2 flex items-center justify-between">
                   <span className="text-muted-foreground">Tarif air</span>
                   <span className="font-medium">
                     {formatCurrency(tariff.price_per_m3)}/m³
                   </span>
                 </div>
                 <div className="mt-2 flex items-center justify-between">
                   <span className="text-muted-foreground">Abonemen</span>
                   <span className="font-medium">
                     {formatCurrency(tariff.monthly_fee)}
                   </span>
                 </div>
               </ConfirmationDialogSummary>
             )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Batal
              </Button>
               <form action={formAction} className="w-full sm:w-auto">
                <input type="hidden" name="period" value={period} />
                 <Button type="submit" disabled={pending} className="w-full">
                  {pending ? "Membuat..." : "Buat Tagihan"}
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
