"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isExpenseCategory } from "@/lib/expenses";
import { getImageExtension, hasValidImageSignature } from "@/lib/image-upload";
import { isValidDate } from "@/lib/period";
import { ensurePrivateBucket, removeStorageObjects } from "@/lib/storage";
import { FINANCE_ROLES } from "@/lib/staff";

const EXPENSE_RECEIPTS_BUCKET = "expense-receipts";
const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;

export type ExpenseFormState = {
  error?: string;
  success?: boolean;
};

function revalidateExpenses() {
  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/dashboard");
}

export async function saveExpenseAction(
  _prev: ExpenseFormState | undefined,
  formData: FormData
): Promise<ExpenseFormState> {
  const session = await assertRole(FINANCE_ROLES);

  const idValue = formData.get("id");
  const id = typeof idValue === "string" && idValue ? idValue : null;
  const expenseDate = formData.get("expense_date");
  const title = formData.get("title");
  const category = formData.get("category");
  const amount = Number(formData.get("amount"));
  const payee = formData.get("payee");
  const paymentMethod = formData.get("payment_method");
  const notes = formData.get("notes");
  const receipt = formData.get("receipt");
  const removeReceipt = formData.get("remove_receipt") === "true";

  if (!isValidDate(expenseDate)) {
    return { error: "Tanggal pengeluaran tidak valid." };
  }
  if (typeof title !== "string" || !title.trim()) {
    return { error: "Judul pengeluaran wajib diisi." };
  }
  if (!isExpenseCategory(category)) {
    return { error: "Kategori pengeluaran tidak valid." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Nominal pengeluaran harus lebih besar dari nol." };
  }
  if (paymentMethod !== "cash" && paymentMethod !== "transfer") {
    return { error: "Metode pembayaran tidak valid." };
  }
  if (receipt instanceof File && receipt.size > 0) {
    if (!getImageExtension(receipt.type)) {
      return { error: "Bukti harus berupa file JPEG, PNG, atau WebP." };
    }
    if (receipt.size > MAX_RECEIPT_SIZE) {
      return { error: "Ukuran bukti maksimal 5 MB." };
    }
    if (!(await hasValidImageSignature(receipt))) {
      return { error: "Isi file bukti tidak valid." };
    }
  }

  const supabase = createSupabaseAdmin();
  let previousReceiptPath: string | null = null;

  if (id) {
    const { data: existing, error: readError } = await supabase
      .from("pam_expenses")
      .select("receipt_path")
      .eq("id", id)
      .maybeSingle();

    if (readError || !existing) {
      return { error: "Pengeluaran tidak ditemukan." };
    }
    previousReceiptPath = existing.receipt_path as string | null;
  }

  const expenseId = id ?? randomUUID();
  let receiptPath = previousReceiptPath;
  let uploadedReceiptPath: string | null = null;

  try {
    if (receipt instanceof File && receipt.size > 0) {
      await ensurePrivateBucket(supabase, EXPENSE_RECEIPTS_BUCKET);
      uploadedReceiptPath =
        `${expenseId}/${randomUUID()}.` + getImageExtension(receipt.type);
      receiptPath = uploadedReceiptPath;
      const { error: uploadError } = await supabase.storage
        .from(EXPENSE_RECEIPTS_BUCKET)
        .upload(receiptPath, receipt, {
          upsert: false,
          contentType: receipt.type,
        });

      if (uploadError) {
        uploadedReceiptPath = null;
        return { error: `Gagal mengunggah bukti: ${uploadError.message}` };
      }
    } else if (removeReceipt) {
      receiptPath = null;
    }

    const payload = {
      expense_date: expenseDate,
      title: title.trim(),
      category,
      amount,
      payee: typeof payee === "string" && payee.trim() ? payee.trim() : null,
      payment_method: paymentMethod,
      receipt_path: receiptPath,
      receipt_url: null,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    let saveResult;
    if (id) {
      let updateQuery = supabase.from("pam_expenses").update(payload).eq("id", id);
      updateQuery = previousReceiptPath
        ? updateQuery.eq("receipt_path", previousReceiptPath)
        : updateQuery.is("receipt_path", null);
      saveResult = await updateQuery.select("id").maybeSingle();
    } else {
      saveResult = await supabase
        .from("pam_expenses")
        .insert({
          id: expenseId,
          ...payload,
          created_by: session.userId,
        })
        .select("id")
        .maybeSingle();
    }
    const { data: saved, error } = saveResult;

    if (error || !saved) {
      if (uploadedReceiptPath) {
        await removeStorageObjects(
          supabase,
          EXPENSE_RECEIPTS_BUCKET,
          [uploadedReceiptPath]
        );
      }
      return {
        error: `Gagal menyimpan pengeluaran: ${error?.message ?? "data tidak ditemukan"}`,
      };
    }

    if (previousReceiptPath && previousReceiptPath !== receiptPath) {
      await removeStorageObjects(
        supabase,
        EXPENSE_RECEIPTS_BUCKET,
        [previousReceiptPath]
      );
    }
  } catch (error) {
    if (uploadedReceiptPath) {
      await removeStorageObjects(
        supabase,
        EXPENSE_RECEIPTS_BUCKET,
        [uploadedReceiptPath]
      );
    }
    return {
      error:
        error instanceof Error ? error.message : "Gagal menyimpan pengeluaran.",
    };
  }

  revalidateExpenses();
  return { success: true };
}

export async function deleteExpenseAction(formData: FormData): Promise<void> {
  await assertRole(FINANCE_ROLES);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Pengeluaran tidak valid.");

  const supabase = createSupabaseAdmin();
  const { data: expense, error: readError } = await supabase
    .from("pam_expenses")
    .select("receipt_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !expense) throw new Error("Pengeluaran tidak ditemukan.");

  const { error } = await supabase.from("pam_expenses").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus pengeluaran: ${error.message}`);

  if (expense.receipt_path) {
    await removeStorageObjects(
      supabase,
      EXPENSE_RECEIPTS_BUCKET,
      [expense.receipt_path as string]
    );
  }

  revalidateExpenses();
}

export async function removeExpenseReceiptAction(
  formData: FormData
): Promise<void> {
  await assertRole(FINANCE_ROLES);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Pengeluaran tidak valid.");

  const supabase = createSupabaseAdmin();
  const { data: expense, error: readError } = await supabase
    .from("pam_expenses")
    .select("receipt_path")
    .eq("id", id)
    .maybeSingle();

  if (readError || !expense) throw new Error("Pengeluaran tidak ditemukan.");

  let updateQuery = supabase
    .from("pam_expenses")
    .update({
      receipt_path: null,
      receipt_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  updateQuery = expense.receipt_path
    ? updateQuery.eq("receipt_path", expense.receipt_path)
    : updateQuery.is("receipt_path", null);
  const { data: updated, error } = await updateQuery.select("id").maybeSingle();

  if (error) throw new Error(`Gagal menghapus bukti: ${error.message}`);
  if (!updated) throw new Error("Data pengeluaran berubah. Muat ulang lalu coba kembali.");
  if (expense.receipt_path) {
    await removeStorageObjects(
      supabase,
      EXPENSE_RECEIPTS_BUCKET,
      [expense.receipt_path as string]
    );
  }
  revalidateExpenses();
}
