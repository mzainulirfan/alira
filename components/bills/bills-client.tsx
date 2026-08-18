"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  ArrowRight01Icon,
  MagicWand01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PeriodPicker } from "@/components/ui/period-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { generateBillsAction, type GenerateBillsState } from "@/app/actions/bills";
import { formatCurrency, formatMeter, formatShortPeriod } from "@/lib/format";
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

const STATUS_VARIANT = (status: string) => {
  if (status === "paid") return "success";
  if (status === "overdue") return "destructive";
  return "warning";
};

export function BillsClient({
  bills,
  allBills,
  period,
  status,
  customerId,
  totalAmount,
  paidAmount,
  unpaidAmount,
  tariff,
  readingCount,
}: {
  bills: BillWithCustomer[];
  allBills: BillWithCustomer[];
  period: string;
  status: string;
  customerId: string | null;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  tariff: Tariff | null;
  readingCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    generateBillsAction,
    { created: 0, skipped: 0 } satisfies GenerateBillsState
  );
  const [lastState, setLastState] = useState(state);

  const paidPct = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const pendingCount = Math.max(0, readingCount - allBills.length);

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
    overdue: allBills.filter((b) => b.status === "overdue").length,
  };

  const customerName = customerId
    ? allBills[0]?.customer.name ?? null
    : null;

  function clearCustomerFilter() {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("customer");
    router.push(`/bills?${sp.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Tagihan</h1>
          <p className="text-sm text-muted-foreground">{formatShortPeriod(period)}</p>
        </div>
        <PeriodPicker period={period} basePath="/bills" />
      </div>

      {customerName && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
          <p className="text-sm">
            Filter pelanggan:{" "}
            <span className="font-medium">{customerName}</span>
          </p>
          <Button variant="ghost" size="sm" onClick={clearCustomerFilter}>
            Hapus Filter
          </Button>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <SectionLabel>Ringkasan Tagihan</SectionLabel>
        <div className="grid grid-cols-3 gap-3">
          <Summary label="Total" value={formatCurrency(totalAmount)} />
          <Summary label="Dibayar" value={formatCurrency(paidAmount)} />
          <Summary
            label="Belum"
            value={formatCurrency(unpaidAmount)}
            alert={unpaidAmount > 0}
          />
        </div>
        <Card>
          <CardContent className="flex flex-col gap-2 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{paidPct}%</span>{" "}
              tagihan sudah dibayar
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <p className="text-sm">
              {unpaidAmount > 0 ? (
                <>
                  Sisa tagihan{" "}
                  <span className="font-semibold text-warning">
                    {formatCurrency(unpaidAmount)}
                  </span>
                </>
              ) : (
                "Semua tagihan sudah dibayar"
              )}
            </p>
          </CardContent>
        </Card>
      </section>

      {!customerId && (
        <GenerateBillCard
          period={period}
          pendingCount={pendingCount}
          allBillsCount={allBills.length}
          tariff={tariff}
          pending={pending}
          formAction={formAction}
          confirmOpen={confirmOpen}
          setConfirmOpen={setConfirmOpen}
        />
      )}

      <div className="flex gap-2 overflow-x-auto">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.key}
            variant={status === f.key ? "default" : "outline"}
            size="sm"
            onClick={() => updateParams({ status: f.key })}
          >
            {f.label}
            <span className="text-xs opacity-70">
              {counts[f.key as keyof typeof counts]}
            </span>
          </Button>
        ))}
      </div>

      {bills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <HugeiconsIcon icon={InvoiceIcon} size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Belum ada tagihan.</p>
              <p className="text-sm text-muted-foreground">
                {customerId
                  ? `Tidak ada tagihan untuk ${customerName ?? "pelanggan ini"} pada periode tersebut.`
                  : allBills.length === 0
                    ? "Catat meter terlebih dahulu, lalu generate tagihan."
                    : "Tidak ada tagihan dengan filter ini."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {bills.map((bill) => (
            <Link key={bill.id} href={`/bills/${bill.id}`}>
              <Card>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <HugeiconsIcon icon={InvoiceIcon} size={20} className="text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{bill.customer.name}</p>
                      <Badge
                        variant={STATUS_VARIANT(bill.status) as "success" | "warning" | "destructive"}
                        className="shrink-0"
                      >
                        {STATUS_LABEL[bill.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {bill.customer.customer_number} · Pemakaian{" "}
                      {formatMeter(bill.usage)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="font-semibold">{formatCurrency(bill.total_amount)}</span>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-4 text-muted-foreground"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </h2>
  );
}

function Summary({
  label,
  value,
  alert = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-1 py-3">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={alert ? "text-sm font-semibold text-warning" : "text-sm font-semibold"}>
          {value}
        </span>
      </CardContent>
    </Card>
  );
}

function GenerateBillCard({
  period,
  pendingCount,
  allBillsCount,
  tariff,
  pending,
  formAction,
  confirmOpen,
  setConfirmOpen,
}: {
  period: string;
  pendingCount: number;
  allBillsCount: number;
  tariff: Tariff | null;
  pending: boolean;
  formAction: (formData: FormData) => void;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
}) {
  const canGenerate = pendingCount > 0;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">Generate Tagihan</p>
            <p className="text-sm text-muted-foreground">
              Buat tagihan untuk {formatShortPeriod(period)}
              {tariff ? ` menggunakan tarif ${tariff.name}` : ""}.
            </p>
          </div>
          <HugeiconsIcon icon={MagicWand01Icon} className="mt-0.5 size-5 shrink-0 text-primary" />
        </div>

        {!tariff ? (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            Belum ada tarif aktif. Atur tarif di{" "}
            <Link href="/more/tariffs" className="underline underline-offset-2">
              Pengaturan Tarif
            </Link>{" "}
            terlebih dahulu.
          </p>
        ) : canGenerate ? (
          <p className="text-sm text-muted-foreground">
            {pendingCount} pencatatan belum memiliki tagihan dan akan dibuat.
          </p>
        ) : (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
            Semua {allBillsCount} pencatatan sudah memiliki tagihan untuk periode ini.
          </p>
        )}

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger
            render={<Button variant="outline" disabled={!canGenerate} />}
          >
            <HugeiconsIcon icon={MagicWand01Icon} />
            {pending ? "Membuat tagihan..." : "Generate Tagihan"}
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Buat tagihan?</DialogTitle>
              <DialogDescription>
                {tariff && (
                  <>
                    Tarif aktif: <span className="font-medium text-foreground">{tariff.name}</span>{" "}
                    ({formatCurrency(tariff.price_per_m3)}/m³ +{" "}
                    {formatCurrency(tariff.monthly_fee)} abonemen)
                  </>
                )}
                <br />
                {pendingCount} tagihan baru akan dibuat untuk {formatShortPeriod(period)}.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Batal
              </Button>
              <form action={formAction}>
                <input type="hidden" name="period" value={period} />
                <Button type="submit" disabled={pending}>
                  {pending ? "Membuat..." : "Ya, Buat Tagihan"}
                </Button>
              </form>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}