import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { createSignedUrlMap } from "@/lib/storage";
import type { Bill, MeterReading } from "@/lib/types";

export const getCustomerDetail = cache(async (customerId: string) => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const [readingsRes, billsRes] = await Promise.all([
    supabase
      .from("pam_meter_readings")
      .select(
        "id, customer_id, period, previous_reading, current_reading, usage, photo_path, photo_url, recorded_by, recorded_at, created_at"
      )
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(12),
    supabase
      .from("pam_bills")
      .select(
        "id, customer_id, meter_reading_id, period, usage, price_per_m3, water_amount, monthly_fee, total_amount, due_date, status, created_at, updated_at"
      )
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(12),
  ]);

  const rawReadings = (readingsRes.data ?? []) as MeterReading[];
  const signedUrls = await createSignedUrlMap(
    supabase,
    "meter-photos",
    rawReadings.map((reading) => reading.photo_path)
  );
  const readings = rawReadings.map((reading) => ({
    ...reading,
    photo_url: signedUrls.get(reading.photo_path ?? "") ?? null,
  }));
  const bills = (billsRes.data ?? []) as Bill[];

  return {
    readings,
    bills,
    lastReading: readings[0] ?? null,
    lastBill: bills[0] ?? null,
  };
});
