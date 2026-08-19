"use server";

import { unstable_cache } from "next/cache";
import { createSupabaseAdmin } from "@/lib/supabase/server";
import type { Bill, MeterReading } from "@/lib/types";

export type DashboardData = {
  activeBill: BillSummary | null;
  latestReading: MeterSummary | null;
};

export type BillSummary = {
  id: string;
  period: string;
  total_amount: number;
  status: "unpaid" | "overdue";
  due_date: string | null;
};

export type MeterSummary = {
  id: string;
  period: string;
  current_reading: number;
  previous_reading: number;
  usage: number;
};

async function getDashboardDataForCustomer(customerId: string): Promise<DashboardData> {
  const supabase = createSupabaseAdmin();

  const [billResult, readingResult] = await Promise.all([
    supabase
      .from("pam_bills")
      .select("id, period, total_amount, status, due_date")
      .eq("customer_id", customerId)
      .in("status", ["unpaid", "overdue"])
      .order("due_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pam_meter_readings")
      .select("id, period, current_reading, previous_reading, usage")
      .eq("customer_id", customerId)
      .order("period", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const error = billResult.error ?? readingResult.error;
  if (error) throw new Error(`Gagal memuat dashboard pelanggan: ${error.message}`);

  return {
    activeBill: billResult.data ? { ...billResult.data } : null,
    latestReading: readingResult.data ? { ...readingResult.data } : null,
  };
}

export const getCustomerDashboardData = unstable_cache(
  getDashboardDataForCustomer,
  ["customer-dashboard"],
  { revalidate: 60, tags: ["customer-dashboard"] }
);

export async function getCustomerBills(
  customerId: string,
  page = 1,
  limit = 20,
  statusFilter?: "all" | "unpaid" | "paid" | "overdue"
) {
  const supabase = createSupabaseAdmin();

  let query = supabase
    .from("pam_bills")
    .select("id, period, total_amount, status, due_date, created_at", { count: "exact" })
    .eq("customer_id", customerId)
    .order("period", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data as Bill[], total: count ?? 0, page, limit };
}

export async function getCustomerBillDetail(customerId: string, billId: string) {
  const supabase = createSupabaseAdmin();

  const { data: bill, error } = await supabase
    .from("pam_bills")
    .select(
      "id, period, total_amount, status, due_date, monthly_fee, usage, price_per_m3, penalty, photo_path, created_at, paid_at, payment_method, payment_gateway_ref"
    )
    .eq("id", billId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error || !bill) return null;
  return bill as unknown as Bill;
}

export async function getCustomerMeterReadings(customerId: string, page = 1, limit = 20) {
  const supabase = createSupabaseAdmin();

  const query = supabase
    .from("pam_meter_readings")
    .select(
      "id, period, previous_reading, current_reading, usage, photo_path, recorded_at, recorded_by",
      { count: "exact" }
    )
    .eq("customer_id", customerId)
    .order("period", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: data as MeterReading[], total: count ?? 0, page, limit };
}
