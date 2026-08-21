"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Attachment01Icon,
  BanknoteArrowUpIcon,
  Delete01Icon,
  Download01Icon,
  FilterIcon,
  FilterResetIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { deleteExpenseAction } from "@/app/actions/expenses";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ConfirmationDialogHeader,
  ConfirmationDialogSummary,
} from "@/components/ui/confirmation-dialog";
import { PeriodPicker } from "@/components/ui/period-picker";
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABEL,
  EXPENSE_PAYMENT_METHOD_LABEL,
} from "@/lib/expenses";
import { formatCurrency, formatDate, formatShortPeriod } from "@/lib/format";
import { currentPeriod } from "@/lib/period";
import type { Expense, ExpenseCategory } from "@/lib/types";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { cn } from "@/lib/utils";

export function ExpensesClient({
  expenses,
  allExpenses,
  period,
  category,
  totalAmount,
  hasActiveFilters,
}: {
  expenses: Expense[];
  allExpenses: Expense[];
  period: string;
  category: ExpenseCategory | null;
  totalAmount: number;
  hasActiveFilters: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterRef = useRef<HTMLDivElement>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const initialOpen = searchParams.get("new") === "true";
  const currentMonth = new Date().toISOString().slice(0, 7);
  const defaultDate =
    currentMonth === period
      ? new Date().toISOString().slice(0, 10)
      : `${period}-01`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const counts = Object.fromEntries(
    EXPENSE_CATEGORIES.map((item) => [
      item.key,
      allExpenses.filter((expense) => expense.category === item.key).length,
    ])
  ) as Record<ExpenseCategory, number>;

  function replaceParams(sp: URLSearchParams) {
    const query = sp.toString();
    router.replace(query ? `/expenses?${query}` : "/expenses");
  }

  function updateCategory(next: ExpenseCategory | null) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("new");
    if (next) sp.set("category", next);
    else sp.delete("category");
    replaceParams(sp);
  }

  function clearNewParam() {
    if (!searchParams.has("new")) return;
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("new");
    replaceParams(sp);
  }

  function resetFilters() {
    router.replace(initialOpen ? "/expenses?new=true" : "/expenses");
  }

  function downloadCsv() {
    const escape = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`;
    const header = [
      "Tanggal",
      "Judul",
      "Kategori",
      "Nominal",
      "Penerima",
      "Metode",
      "Catatan",
    ];
    const lines = expenses.map((expense) =>
      [
        expense.expense_date,
        expense.title,
        EXPENSE_CATEGORY_LABEL[expense.category],
        expense.amount,
        expense.payee ?? "",
        EXPENSE_PAYMENT_METHOD_LABEL[expense.payment_method],
        expense.notes ?? "",
      ]
        .map(escape)
        .join(",")
    );
    const csv = [header.map(escape).join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pengeluaran-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <Link href="/more" className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-aqua-light text-aqua transition-colors hover:bg-aqua/80">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-bold leading-[32px] text-petrol sm:text-[30px] sm:leading-[38px]">
            Pengeluaran
          </h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-muted-text">
            {allExpenses.length} transaksi · {formatCurrency(totalAmount)}
          </p>
        </div>
        <ExpenseForm
          defaultDate={defaultDate}
          initialOpen={initialOpen}
          onClosed={clearNewParam}
        />
      </div>

      <section className="flex flex-col">
        <SectionHeading title="Filter & Periode" />
        <div className="flex flex-wrap items-center gap-2">
          <PeriodPicker period={period} basePath="/expenses" />
          <div ref={filterRef} className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon-xl"
              aria-label="Filter kategori pengeluaran"
              aria-haspopup="listbox"
              aria-expanded={filterOpen}
              onClick={() => setFilterOpen((open) => !open)}
              className="rounded-[10px] border-line"
            >
              <HugeiconsIcon icon={FilterIcon} />
              {category && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-brass" />
              )}
            </Button>
            {filterOpen && (
              <div
                role="listbox"
                className="absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-[12px] border border-line bg-popover text-popover-foreground shadow-md"
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={category === null}
                  onClick={() => {
                    updateCategory(null);
                    setFilterOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                >
                  <span className={cn(category === null ? "font-semibold text-petrol" : "")}>Semua kategori</span>
                  <span className="font-mono text-xs text-muted-2">{allExpenses.length}</span>
                  {category === null && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />
                  )}
                </button>
                {EXPENSE_CATEGORIES.map((item) => {
                  const active = category === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        updateCategory(item.key);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-aqua-light"
                    >
                      <span className={cn(active ? "font-semibold text-petrol" : "")}>{item.label}</span>
                      <span className="font-mono text-xs text-muted-2">{counts[item.key]}</span>
                      {active && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-aqua" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {expenses.length > 0 && (
            <Button
              variant="outline"
              size="icon-xl"
              className="rounded-[10px] border-line"
              onClick={downloadCsv}
              title="Download CSV"
            >
              <HugeiconsIcon icon={Download01Icon} />
            </Button>
          )}
        </div>
      </section>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[12px] border border-line bg-aqua-light/60 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-text">
              {category
                ? `Menampilkan ${expenses.length} dari ${allExpenses.length} transaksi`
                : `Menampilkan ${expenses.length} transaksi`}
            </span>
            {period !== currentPeriod() && (
              <span className="rounded-full bg-petrol px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                {formatShortPeriod(period).toUpperCase()}
              </span>
            )}
            {category && (
              <span className="rounded-full bg-brass-light px-2 py-0.5 font-mono text-[10px] font-bold text-brass">
                {EXPENSE_CATEGORY_LABEL[category].toUpperCase()}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="font-mono text-[11px] font-semibold text-muted-text hover:text-petrol">
            <HugeiconsIcon icon={FilterResetIcon} />
            Reset Filter
          </Button>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilters} onClear={resetFilters} />
      ) : (
        <section className="flex flex-col">
          <SectionHeading title="Daftar Pengeluaran" />
          <div className="flex flex-col gap-2">
            {expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} defaultDate={defaultDate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ExpenseCard({
  expense,
  defaultDate,
}: {
  expense: Expense;
  defaultDate: string;
}) {
  return (
    <Link href={`/expenses/edit/${expense.id}`} className="group relative flex items-start gap-3 overflow-hidden rounded-[14px] border border-line bg-card py-3 pr-3 pl-4 transition-all hover:-translate-y-0.5 hover:border-petrol/30 hover:shadow-md">
      <span className="absolute top-0 bottom-0 left-0 w-1 bg-brass" />
      <span aria-hidden className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brass-light text-brass">
          <HugeiconsIcon icon={BanknoteArrowUpIcon} size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[13.5px] font-semibold text-petrol">{expense.title}</p>
          <p className="truncate font-mono text-[11px] text-muted-2">
            {EXPENSE_CATEGORY_LABEL[expense.category]} · {formatDate(expense.expense_date)} · {EXPENSE_PAYMENT_METHOD_LABEL[expense.payment_method]}
          </p>
          {expense.payee && <p className="truncate font-mono text-[11px] text-muted-2">{expense.payee}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="font-mono text-[15px] font-bold text-petrol whitespace-nowrap">{formatCurrency(expense.amount)}</span>
          {expense.receipt_url && (
            <Button variant="outline" size="sm" className="rounded-[8px] border-line font-display text-[11px] font-semibold text-brass hover:bg-brass-light hover:border-brass" render={<a href={expense.receipt_url} target="_blank" rel="noreferrer" />}>
              <HugeiconsIcon icon={Attachment01Icon} className="mr-1" /> Bukti
            </Button>
          )}
          <ExpenseForm expense={expense} defaultDate={defaultDate} />
          <DeleteExpense expense={expense} />
          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-paper text-muted-2 transition-all group-hover:bg-petrol group-hover:text-white">
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function DeleteExpense({ expense }: { expense: Expense }) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form
        ref={formRef}
        action={async (formData) => {
          try {
            await deleteExpenseAction(formData);
            toast.success("Pengeluaran dihapus.");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Gagal menghapus pengeluaran."
            );
          }
        }}
      >
        <input type="hidden" name="id" value={expense.id} />
      </form>
      <Button type="button" variant="outline" size="sm" className="rounded-[8px] border-coral text-coral hover:bg-coral-light hover:border-coral font-display text-[11px] font-semibold" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Delete01Icon} className="mr-1" /> Hapus
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm rounded-[14px] bg-card">
          <ConfirmationDialogHeader
            icon={Delete01Icon}
            tone="destructive"
            title="Hapus pengeluaran?"
            description="Data yang dihapus tidak dapat dikembalikan."
          />
          <ConfirmationDialogSummary>
            <p className="font-display text-[13px] font-semibold text-petrol">{expense.title}</p>
            <p className="mt-1 font-mono text-[18px] font-bold text-coral">{formatCurrency(expense.amount)}</p>
          </ConfirmationDialogSummary>
          <DialogFooter className="pt-2 border-t border-line">
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-[10px] border-line font-display text-[13px] font-semibold text-muted-text hover:text-petrol hover:border-petrol/40 w-full">
              Batal
            </Button>
            <Button variant="outline" className="rounded-[10px] border-coral text-coral hover:bg-coral-light hover:border-coral font-display text-[13px] font-semibold w-full" onClick={() => { setOpen(false); formRef.current?.requestSubmit(); }}>
              Hapus Pengeluaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EmptyState({
  hasFilter,
  onClear,
}: {
  hasFilter: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-line bg-card py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-[12px] bg-brass-light text-brass">
        <HugeiconsIcon icon={BanknoteArrowUpIcon} size={24} />
      </div>
      <div>
        <p className="font-display text-[15px] font-bold text-petrol">
          {hasFilter ? "Tidak ada pengeluaran pada kategori ini" : "Belum ada pengeluaran"}
        </p>
        <p className="text-[13px] text-muted-2">
          {hasFilter
            ? "Pilih kategori lain atau hapus filter."
            : "Catat pengeluaran pertama untuk periode ini."}
        </p>
      </div>
      {hasFilter && (
        <Button variant="outline" className="rounded-[10px] border-line" onClick={onClear}>
          Hapus Filter
        </Button>
      )}
    </div>
  );
}