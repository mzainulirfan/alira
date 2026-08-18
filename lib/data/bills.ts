import "server-only";

import { cache } from "react";
import { verifySession } from "@/lib/auth/dal";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Bill, Customer, MeterReading, Tariff } from "@/lib/types";

export type BillWithCustomer = Bill & {
  customer: Pick<
    Customer,
    "id" | "name" | "customer_number" | "meter_number" | "phone"
  >;
};

export type AdjacentBill = Pick<Bill, "id" | "period">;

export function periodToDate(period: string): string {
  return `${period}-01`;
}

export function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const getActiveTariff = cache(async (): Promise<Tariff | null> => {
  await verifySession();
  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("pam_tariffs")
    .select("*")
    .eq("is_active", true)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Tariff | null;
});

export const getPeriodBills = cache(
  async (period: string): Promise<BillWithCustomer[]> => {
    await verifySession();
    const supabase = createSupabaseAdmin();

    const { data, error } = await supabase
      .from("pam_bills")
      .select(
        "*, customer:pam_customers(id, name, customer_number, meter_number, phone)"
      )
      .eq("period", periodToDate(period))
      .order("customer(customer_number)", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as BillWithCustomer[];
  }
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
    return data as MeterReading | null;
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
