"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { isValidPeriod, periodToDate } from "@/lib/period";
import { FINANCE_ROLES } from "@/lib/staff";

export type GenerateBillsState = {
  error?: string;
  success?: boolean;
  created: number;
  skipped: number;
};

export async function generateBillsAction(
  _prev: GenerateBillsState | undefined,
  formData: FormData
): Promise<GenerateBillsState> {
  const session = await assertRole(FINANCE_ROLES);

  const period = formData.get("period");
  if (!isValidPeriod(period)) {
    return { error: "Periode tidak valid.", created: 0, skipped: 0 };
  }

  const supabase = createSupabaseAdmin();
  const { data, error } = await supabase.rpc("pam_generate_bills", {
    p_period: periodToDate(period),
    p_actor: session.userId,
  });
  if (error) {
    return { error: `Gagal membuat tagihan: ${error.message}`, created: 0, skipped: 0 };
  }
  const result = data as { created?: number; skipped?: number } | null;

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidateTag("bills", "max");
  return {
    success: true,
    created: Number(result?.created ?? 0),
    skipped: Number(result?.skipped ?? 0),
  };
}
