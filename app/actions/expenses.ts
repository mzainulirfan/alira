"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isExpenseCategory } from "@/lib/expenses";
import { FINANCE_ROLES } from "@/lib/staff";

const EXPENSE_RECEIPTS_BUCKET = "expense-receipts";
const MAX_RECEIPT_SIZE = 5 * 1024 * 1024;
const RECEIPT_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type ExpenseFormState = {
  error?: string;
  success?: boolean;
};

async function ensureBucket(
  supabase: ReturnType<typeof createSupabaseAdmin>
) {
  const { data } = await supabase.storage.getBucket(EXPENSE_RECEIPTS_BUCKET);
  if (data) return;

  const { error } = await supabase.storage.createBucket(
    EXPENSE_RECEIPTS_BUCKET,
    { public: true }
  );
  if (error) throw new Error(`Gagal menyiapkan penyimpanan bukti: ${error.message}`);
}

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

  if (
    typeof expenseDate !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) ||
    Number.isNaN(new Date(`${expenseDate}T00:00:00Z`).getTime())
  ) {
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
    if (!RECEIPT_TYPES.has(receipt.type)) {
      return { error: "Bukti harus berupa file JPEG, PNG, atau WebP." };
    }
    if (receipt.size > MAX_RECEIPT_SIZE) {
      return { error: "Ukuran bukti maksimal 5 MB." };
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
  let receiptUrl: string | null = null;

  try {
    if (receipt instanceof File && receipt.size > 0) {
      await ensureBucket(supabase);
      receiptPath = expenseId;
      const { error: uploadError } = await supabase.storage
        .from(EXPENSE_RECEIPTS_BUCKET)
        .upload(receiptPath, receipt, {
          upsert: true,
          contentType: receipt.type,
        });

      if (uploadError) {
        return { error: `Gagal mengunggah bukti: ${uploadError.message}` };
      }
    } else if (removeReceipt && receiptPath) {
      await supabase.storage.from(EXPENSE_RECEIPTS_BUCKET).remove([receiptPath]);
      receiptPath = null;
    }

    if (receiptPath) {
      const { data } = supabase.storage
        .from(EXPENSE_RECEIPTS_BUCKET)
        .getPublicUrl(receiptPath);
      receiptUrl = data.publicUrl;
    }

    const payload = {
      expense_date: expenseDate,
      title: title.trim(),
      category,
      amount,
      payee: typeof payee === "string" && payee.trim() ? payee.trim() : null,
      payment_method: paymentMethod,
      receipt_path: receiptPath,
      receipt_url: receiptUrl,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = id
      ? await supabase.from("pam_expenses").update(payload).eq("id", id)
      : await supabase.from("pam_expenses").insert({
          id: expenseId,
          ...payload,
          created_by: session.userId,
        });

    if (error) {
      if (!id && receiptPath) {
        await supabase.storage.from(EXPENSE_RECEIPTS_BUCKET).remove([receiptPath]);
      }
      return { error: `Gagal menyimpan pengeluaran: ${error.message}` };
    }
  } catch (error) {
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
    await supabase.storage
      .from(EXPENSE_RECEIPTS_BUCKET)
      .remove([expense.receipt_path as string]);
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

  if (expense.receipt_path) {
    await supabase.storage
      .from(EXPENSE_RECEIPTS_BUCKET)
      .remove([expense.receipt_path as string]);
  }

  const { error } = await supabase
    .from("pam_expenses")
    .update({
      receipt_path: null,
      receipt_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Gagal menghapus bukti: ${error.message}`);
  revalidateExpenses();
}
