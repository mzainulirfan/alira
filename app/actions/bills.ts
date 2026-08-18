"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { periodToDate } from "@/lib/data/bills";
import type { AppSettings } from "@/lib/types";
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
  await assertRole(FINANCE_ROLES);

  const period = formData.get("period");
  if (typeof period !== "string" || !/^\d{4}-\d{2}$/.test(period)) {
    return { error: "Periode tidak valid.", created: 0, skipped: 0 };
  }

  const supabase = createSupabaseAdmin();

  const [{ data: tariff }, { data: settings }, { data: readings }] =
    await Promise.all([
      supabase
        .from("pam_tariffs")
        .select("*")
        .eq("is_active", true)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("pam_app_settings").select("*").limit(1).maybeSingle(),
      supabase
        .from("pam_meter_readings")
        .select("*")
        .eq("period", periodToDate(period)),
    ]);

  if (!tariff) {
    return {
      error: "Belum ada tarif aktif. Atur tarif terlebih dahulu di Pengaturan.",
      created: 0,
      skipped: 0,
    };
  }
  if (!readings?.length) {
    return {
      error: "Belum ada pencatatan meter pada periode ini.",
      created: 0,
      skipped: 0,
    };
  }

  const dueDay = (settings as AppSettings | null)?.billing_due_day ?? 15;
  const year = Number(period.slice(0, 4));
  const month = Number(period.slice(5, 7));
  const dueDate = new Date(Date.UTC(year, month - 1, dueDay));
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  const { data: existing } = await supabase
    .from("pam_bills")
    .select("customer_id")
    .eq("period", periodToDate(period));

  const existingIds = new Set(
    (existing ?? []).map((b) => (b as { customer_id: string }).customer_id)
  );

  const bills = [];
  for (const reading of readings as Array<{
    id: string;
    customer_id: string;
    usage: number;
  }>) {
    if (existingIds.has(reading.customer_id)) continue;
    const waterAmount = Math.round(reading.usage * tariff.price_per_m3);
    bills.push({
      customer_id: reading.customer_id,
      meter_reading_id: reading.id,
      period: periodToDate(period),
      usage: reading.usage,
      water_amount: waterAmount,
      monthly_fee: tariff.monthly_fee,
      total_amount: waterAmount + tariff.monthly_fee,
      due_date: dueDateStr,
      status: "unpaid",
    });
  }

  if (bills.length === 0) {
    return {
      success: true,
      created: 0,
      skipped: readings.length,
    };
  }

  const { error } = await supabase.from("pam_bills").insert(bills);
  if (error) {
    return { error: `Gagal membuat tagihan: ${error.message}`, created: 0, skipped: 0 };
  }

  revalidatePath("/bills");
  revalidatePath("/dashboard");
  return {
    success: true,
    created: bills.length,
    skipped: readings.length - bills.length,
  };
}
