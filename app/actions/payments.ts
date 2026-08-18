"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";

export type RecordPaymentState = {
  error?: string;
  success?: boolean;
};

export async function recordPaymentAction(
  _prev: RecordPaymentState | undefined,
  formData: FormData
): Promise<RecordPaymentState> {
  await verifySession();

  const billId = formData.get("bill_id");
  const amountRaw = formData.get("amount");
  const method = formData.get("payment_method");
  const paymentDate = formData.get("payment_date");
  const notes = formData.get("notes");

  if (typeof billId !== "string" || !billId) {
    return { error: "Tagihan tidak valid." };
  }
  if (method !== "cash" && method !== "transfer") {
    return { error: "Metode pembayaran tidak valid." };
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Nominal pembayaran tidak valid." };
  }

  const supabase = createSupabaseAdmin();

  const { data: bill, error: billError } = await supabase
    .from("pam_bills")
    .select("id, customer_id, total_amount, status")
    .eq("id", billId)
    .maybeSingle();

  if (billError) return { error: billError.message };
  if (!bill) return { error: "Tagihan tidak ditemukan." };
  if (bill.status === "paid") {
    return { error: "Tagihan ini sudah lunas." };
  }

  const existing = await supabase
    .from("pam_payments")
    .select("id")
    .eq("bill_id", billId)
    .maybeSingle();
  if (existing.data) {
    return { error: "Pembayaran untuk tagihan ini sudah tercatat." };
  }

  const { error: payError } = await supabase.from("pam_payments").insert({
    bill_id: billId,
    customer_id: bill.customer_id,
    amount,
    payment_method: method,
    payment_date: paymentDate || undefined,
    notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
  });

  if (payError) return { error: `Gagal menyimpan pembayaran: ${payError.message}` };

  const { error: updateError } = await supabase
    .from("pam_bills")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", billId);

  if (updateError) {
    return { error: `Gagal memperbarui status tagihan: ${updateError.message}` };
  }

  revalidatePath("/payments");
  revalidatePath("/bills");
  revalidatePath(`/bills/${billId}`);
  revalidatePath("/dashboard");
  return { success: true };
}