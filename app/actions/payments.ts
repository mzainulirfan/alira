"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isValidDate } from "@/lib/period";
import { FINANCE_ROLES } from "@/lib/staff";

export type RecordPaymentState = {
  error?: string;
  success?: boolean;
};

export async function recordPaymentAction(
  _prev: RecordPaymentState | undefined,
  formData: FormData
): Promise<RecordPaymentState> {
  const session = await assertRole(FINANCE_ROLES);

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
  if (!isValidDate(paymentDate)) {
    return { error: "Tanggal pembayaran tidak valid." };
  }

  const supabase = createSupabaseAdmin();
  const { error } = await supabase.rpc("pam_record_payment", {
    p_bill_id: billId,
    p_expected_amount: amount,
    p_payment_method: method,
    p_payment_date: paymentDate,
    p_notes: typeof notes === "string" && notes.trim() ? notes.trim() : null,
    p_actor: session.userId,
  });
  if (error) return { error: `Gagal menyimpan pembayaran: ${error.message}` };

  revalidatePath("/payments");
  revalidatePath("/bills");
  revalidatePath(`/bills/${billId}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidateTag("payments", "max");
  revalidateTag("bills", "max");
  return { success: true };
}
