"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  BankIcon,
  Cash01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons";
import {
  saveExpenseAction,
  type ExpenseFormState,
} from "@/app/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EXPENSE_CATEGORIES } from "@/lib/expenses";
import type { Expense, ExpenseCategory } from "@/lib/types";

const noState: ExpenseFormState = {};

type FormValues = {
  title: string;
  expense_date: string;
  category: ExpenseCategory;
  amount: string;
  payee: string;
  payment_method: "cash" | "transfer";
  notes: string;
  remove_receipt: boolean;
};

function initialValues(expense: Expense | undefined, defaultDate: string): FormValues {
  return {
    title: expense?.title ?? "",
    expense_date: expense?.expense_date ?? defaultDate,
    category: expense?.category ?? "maintenance",
    amount: expense ? String(expense.amount) : "",
    payee: expense?.payee ?? "",
    payment_method: expense?.payment_method ?? "cash",
    notes: expense?.notes ?? "",
    remove_receipt: false,
  };
}

export function ExpenseForm({
  expense,
  defaultDate,
  initialOpen = false,
  onClosed,
}: {
  expense?: Expense;
  defaultDate: string;
  initialOpen?: boolean;
  onClosed?: () => void;
}) {
  const isEdit = !!expense;
  const [open, setOpen] = useState(initialOpen);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(saveExpenseAction, noState);
  const [lastState, setLastState] = useState(state);
  const [values, setValues] = useState(() => initialValues(expense, defaultDate));
  const [original, setOriginal] = useState(() => initialValues(expense, defaultDate));
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(
    Boolean(expense?.payee || expense?.receipt_url || expense?.notes)
  );
  const [errors, setErrors] = useState<{
    title?: string;
    expense_date?: string;
    amount?: string;
  }>({});

  const dirty =
    JSON.stringify(values) !== JSON.stringify(original) || receiptName !== null;

  if (state !== lastState) {
    setLastState(state);
    if (state?.success) setOpen(false);
  }

  useEffect(() => {
    if (state?.success) {
      toast.success(isEdit ? "Pengeluaran diperbarui." : "Pengeluaran dicatat.");
      onClosed?.();
    } else if (state?.error) {
      toast.error(state.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function update<K extends keyof FormValues>(
    key: K,
    value: FormValues[K]
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === "title" || key === "expense_date" || key === "amount") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: typeof errors = {};
    if (!values.title.trim()) next.title = "Judul wajib diisi.";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(values.expense_date)) {
      next.expense_date = "Tanggal wajib diisi.";
    }
    const amount = Number(values.amount);
    if (values.amount === "" || !Number.isFinite(amount) || amount <= 0) {
      next.amount = "Nominal harus lebih besar dari nol.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resetForm() {
    const reset = initialValues(expense, defaultDate);
    setValues(reset);
    setOriginal(reset);
    setReceiptName(null);
    setDetailsOpen(Boolean(expense?.payee || expense?.receipt_url || expense?.notes));
    setErrors({});
    setConfirmOpen(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function closeForm() {
    if (dirty) {
      setConfirmOpen(true);
      return;
    }
    setOpen(false);
    onClosed?.();
  }

  function discardChanges() {
    resetForm();
    setOpen(false);
    onClosed?.();
  }

  function handleOpenChange(next: boolean) {
    if (next) {
      resetForm();
      setOpen(true);
    } else {
      closeForm();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant={isEdit ? "ghost" : "default"}
            size={isEdit ? "sm" : "default"}
          />
        }
      >
        <HugeiconsIcon icon={isEdit ? Edit01Icon : Add01Icon} />
        {isEdit ? "Edit" : "Catat Pengeluaran"}
      </DialogTrigger>

      <DialogContent
        initialFocus={() => titleRef.current}
        className="max-h-[calc(100%-2rem)] overflow-y-auto sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Pengeluaran" : "Catat Pengeluaran"}
          </DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          onSubmit={(event) => {
            if (!validate()) event.preventDefault();
          }}
          className="flex flex-col gap-4"
        >
          {isEdit && <input type="hidden" name="id" value={expense.id} />}
          <input
            type="hidden"
            name="remove_receipt"
            value={String(values.remove_receipt)}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-title">Judul Pengeluaran</Label>
            <Input
              ref={titleRef}
              id="expense-title"
              name="title"
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="cth. Perbaikan saluran RT 03"
              className="h-10"
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expense-amount">Nominal</Label>
            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                Rp
              </span>
              <Input
                id="expense-amount"
                name="amount"
                type="number"
                inputMode="numeric"
                min={1}
                step="any"
                value={values.amount}
                onChange={(event) => update("amount", event.target.value)}
                placeholder="0"
                className="h-12 pl-10 text-lg font-semibold"
                aria-invalid={!!errors.amount}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-date">Tanggal</Label>
              <Input
                id="expense-date"
                name="expense_date"
                type="date"
                value={values.expense_date}
                onChange={(event) => update("expense_date", event.target.value)}
                className="h-10"
                aria-invalid={!!errors.expense_date}
              />
              {errors.expense_date && (
                <p className="text-xs text-destructive">{errors.expense_date}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expense-category">Kategori</Label>
              <select
                id="expense-category"
                name="category"
                value={values.category}
                onChange={(event) =>
                  update("category", event.target.value as ExpenseCategory)
                }
                className="h-10 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className="mb-3 block w-full text-sm leading-none font-medium">
              Metode Pembayaran
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: "cash", label: "Tunai", icon: Cash01Icon },
                  { value: "transfer", label: "Transfer", icon: BankIcon },
                ] as const
              ).map((method) => (
                <label
                  key={method.value}
                  className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-input px-3 text-sm font-medium text-muted-foreground transition-colors has-[:checked]:border-primary has-[:checked]:text-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/15"
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={method.value}
                    checked={values.payment_method === method.value}
                    onChange={() => update("payment_method", method.value)}
                    className="sr-only"
                  />
                  <HugeiconsIcon icon={method.icon} className="size-4" />
                  {method.label}
                </label>
              ))}
            </div>
          </fieldset>

          <details
            open={detailsOpen}
            onToggle={(event) => setDetailsOpen(event.currentTarget.open)}
            className="border-t pt-3"
          >
            <summary className="cursor-pointer text-sm font-medium select-none">
              Detail tambahan
              <span className="ml-1 font-normal text-muted-foreground">
                (opsional)
              </span>
            </summary>

            <div className="flex flex-col gap-4 pt-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expense-payee">Penerima atau Vendor</Label>
                <Input
                  id="expense-payee"
                  name="payee"
                  value={values.payee}
                  onChange={(event) => update("payee", event.target.value)}
                  placeholder="cth. Toko Bangunan Maju"
                  className="h-10"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="expense-receipt">Bukti Pembayaran</Label>
                  {expense?.receipt_url && (
                    <a
                      href={expense.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Lihat bukti lama
                    </a>
                  )}
                </div>
                <Input
                  ref={fileRef}
                  id="expense-receipt"
                  name="receipt"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) =>
                    setReceiptName(event.target.files?.[0]?.name ?? null)
                  }
                  className="h-10"
                />
                {expense?.receipt_url && (
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={values.remove_receipt}
                      onChange={(event) =>
                        update("remove_receipt", event.target.checked)
                      }
                      className="size-4 accent-primary"
                    />
                    Hapus bukti lama saat disimpan
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="expense-notes">Catatan</Label>
                <Textarea
                  id="expense-notes"
                  name="notes"
                  value={values.notes}
                  onChange={(event) => update("notes", event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </details>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={closeForm}>
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan Perubahan"
                  : "Simpan Pengeluaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Perubahan belum disimpan</DialogTitle>
            <DialogDescription>
              Ada data yang belum tersimpan. Yakin ingin menutup form ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Lanjut Mengisi
            </Button>
            <Button variant="destructive" onClick={discardChanges}>
              Buang Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
