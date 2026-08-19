"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Pengeluaran</h1>
          <p className="text-sm text-muted-foreground">
            {allExpenses.length} transaksi · {formatCurrency(totalAmount)}
          </p>
        </div>
        <ExpenseForm
          defaultDate={defaultDate}
          initialOpen={initialOpen}
          onClosed={clearNewParam}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PeriodPicker period={period} basePath="/expenses" />
        <div ref={filterRef} className="relative ml-auto">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Filter kategori pengeluaran"
            aria-haspopup="listbox"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
          >
            <HugeiconsIcon icon={FilterIcon} />
            {category && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {filterOpen && (
            <div
              role="listbox"
              className="absolute right-0 z-50 mt-2 min-w-48 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
            >
              <button
                type="button"
                role="option"
                aria-selected={category === null}
                onClick={() => {
                  updateCategory(null);
                  setFilterOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <span>Semua kategori</span>
                <span className="text-xs text-muted-foreground">
                  {allExpenses.length}
                </span>
                {category === null && (
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary" />
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
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {counts[item.key]}
                    </span>
                    {active && (
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {expenses.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={downloadCsv}
            title="Download CSV"
          >
            <HugeiconsIcon icon={Download01Icon} />
            <span className="hidden sm:inline">CSV</span>
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground">
              {category
                ? `Menampilkan ${expenses.length} dari ${allExpenses.length} transaksi`
                : `Menampilkan ${expenses.length} transaksi`}
            </span>
            {period !== currentPeriod() && (
              <Badge variant="secondary">{formatShortPeriod(period)}</Badge>
            )}
            {category && (
              <Badge variant="secondary">{EXPENSE_CATEGORY_LABEL[category]}</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <HugeiconsIcon icon={FilterResetIcon} />
            Reset Filter
          </Button>
        </div>
      )}

      {expenses.length === 0 ? (
        <EmptyState
          hasFilter={hasActiveFilters}
          onClear={resetFilters}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              defaultDate={defaultDate}
            />
          ))}
        </div>
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
    <Card>
      <CardContent className="flex flex-col gap-3 py-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <HugeiconsIcon icon={BanknoteArrowUpIcon} size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{expense.title}</p>
            <p className="text-xs text-muted-foreground">
              {EXPENSE_CATEGORY_LABEL[expense.category]} ·{" "}
              {formatDate(expense.expense_date)} ·{" "}
              {EXPENSE_PAYMENT_METHOD_LABEL[expense.payment_method]}
            </p>
            {expense.payee && (
              <p className="truncate text-xs text-muted-foreground">
                {expense.payee}
              </p>
            )}
          </div>
          <span className="shrink-0 text-base font-semibold">
            {formatCurrency(expense.amount)}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {expense.receipt_url && (
            <Button
              variant="ghost"
              size="sm"
              render={
                <a
                  href={expense.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <HugeiconsIcon icon={Attachment01Icon} />
              Bukti
            </Button>
          )}
          <ExpenseForm expense={expense} defaultDate={defaultDate} />
          <DeleteExpense expense={expense} />
        </div>
      </CardContent>
    </Card>
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
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon icon={Delete01Icon} />
        Hapus
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
           <ConfirmationDialogHeader
             icon={Delete01Icon}
             tone="destructive"
             title="Hapus pengeluaran?"
             description="Data yang dihapus tidak dapat dikembalikan."
           />
           <ConfirmationDialogSummary>
             <p className="font-medium">{expense.title}</p>
             <p className="mt-1 text-lg font-semibold text-destructive">
               {formatCurrency(expense.amount)}
             </p>
           </ConfirmationDialogSummary>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                formRef.current?.requestSubmit();
              }}
            >
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
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <HugeiconsIcon icon={BanknoteArrowUpIcon} size={24} />
        </div>
        <div>
          <p className="font-medium">
            {hasFilter
              ? "Tidak ada pengeluaran pada kategori ini"
              : "Belum ada pengeluaran"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? "Pilih kategori lain atau hapus filter."
              : "Catat pengeluaran pertama untuk periode ini."}
          </p>
        </div>
        {hasFilter && (
          <Button variant="outline" onClick={onClear}>
            Hapus Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
