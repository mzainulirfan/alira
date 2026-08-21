import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import { periodToDate } from "@/lib/period";
import { createSignedUrlMap } from "@/lib/storage";
import type { Bill, Customer, MeterReading, Tariff } from "@/lib/types";

export type BillWithCustomer = Bill & {
  customer: Pick<
    Customer,
    "id" | "name" | "customer_number" | "meter_number" | "phone"
  >;
};

export type AdjacentBill = Pick<Bill, "id" | "period">;

export const getActiveTariff = cache(async (): Promise<Tariff | null> => {
  await verifySession();
  return getCachedActiveTariff();
});

const getCachedActiveTariff = unstable_cache(
  async (): Promise<Tariff | null> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_tariffs")
      .select(
        "id, name, price_per_m3, monthly_fee, effective_date, is_active, created_at"
      )
      .eq("is_active", true)
      .or("effective_date.is.null,effective_date.lte." + new Date().toISOString().slice(0, 10))
      .order("effective_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as Tariff | null;
  },
  ["tariff-active"],
  { tags: ["tariffs"], revalidate: 60 }
);

export const getPeriodBills = cache(
  async (period: string): Promise<BillWithCustomer[]> => {
    await verifySession();
    return getCachedPeriodBills(period);
  }
);

const getCachedPeriodBills = unstable_cache(
  async (period: string): Promise<BillWithCustomer[]> => {
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_bills")
      .select(
        "id, customer_id, meter_reading_id, period, usage, price_per_m3, water_amount, monthly_fee, total_amount, due_date, status, created_at, updated_at, customer:pam_customers(id, name, customer_number, meter_number, phone)"
      )
      .eq("period", periodToDate(period))
      .order("customer(customer_number)", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as BillWithCustomer[];
  },
  ["period-bills"],
  { tags: ["bills"], revalidate: 60 }
);

export const getBillById = cache(
  async (id: string): Promise<BillWithCustomer | null> => {
    await verifySession();
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_bills")
      .select(
        "*, customer:pam_customers(id, name, customer_number, meter_number, phone)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data as BillWithCustomer | null;
  }
);

export const getBillReading = cache(
  async (meterReadingId: string | null): Promise<MeterReading | null> => {
    await verifySession();
    if (!meterReadingId) return null;
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_meter_readings")
      .select("*")
      .eq("id", meterReadingId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    const reading = data as MeterReading | null;
    if (!reading) return null;
    const signedUrls = await createSignedUrlMap(
      supabase,
      "meter-photos",
      [reading.photo_path]
    );
    return {
      ...reading,
      photo_url: signedUrls.get(reading.photo_path ?? "") ?? null,
    };
  }
);

export const getAdjacentCustomerBills = cache(
  async (
    customerId: string,
    period: string
  ): Promise<{ previous: AdjacentBill | null; next: AdjacentBill | null }> => {
    await verifySession();
    const supabase = createSupabaseAdmin();
    const [{ data: previous, error: previousError }, { data: next, error: nextError }] =
      await Promise.all([
        supabase
          .from("pam_bills")
          .select("id, period")
          .eq("customer_id", customerId)
          .lt("period", period)
          .order("period", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("pam_bills")
          .select("id, period")
          .eq("customer_id", customerId)
          .gt("period", period)
          .order("period", { ascending: true })
          .limit(1)
          .maybeSingle(),
      ]);

    if (previousError) throw new Error(previousError.message);
    if (nextError) throw new Error(nextError.message);
    return {
      previous: previous as AdjacentBill | null,
      next: next as AdjacentBill | null,
    };
  }
);
