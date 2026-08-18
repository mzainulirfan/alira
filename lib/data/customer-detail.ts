import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Bill, MeterReading } from "@/lib/types";

export const getCustomerDetail = cache(async (customerId: string) => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const [readingsRes, billsRes] = await Promise.all([
    supabase
      .from("pam_meter_readings")
      .select("*")
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(12),
    supabase
      .from("pam_bills")
      .select("*")
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(12),
  ]);

  const readings = (readingsRes.data ?? []) as MeterReading[];
  const bills = (billsRes.data ?? []) as Bill[];

  return {
    readings,
    bills,
    lastReading: readings[0] ?? null,
    lastBill: bills[0] ?? null,
  };
});